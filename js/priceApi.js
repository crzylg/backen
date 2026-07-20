// Anbindung an Open Food Facts – Open Prices API (https://prices.openfoodfacts.org)
// Liefert ausschließlich reale, von der Community gemeldete Preise aus Deutschland.
// Wird nichts gefunden, wird NIEMALS ein Preis erfunden — Status bleibt "not_found".
const OFF_PRICES_ENDPOINT = "https://prices.openfoodfacts.org/api/v1/prices";
const PRICE_CACHE_KEY = "pastaci_prices_v1";
const LAST_UPDATED_KEY = "pastaci_prices_last_updated";
const FETCH_TIMEOUT_MS = 10000;

function loadPriceCache() {
  try {
    return JSON.parse(localStorage.getItem(PRICE_CACHE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function savePriceCache(cache) {
  localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));
}

function getLastUpdatedTimestamp() {
  return localStorage.getItem(LAST_UPDATED_KEY);
}

function setLastUpdatedTimestamp(ts) {
  localStorage.setItem(LAST_UPDATED_KEY, ts);
}

function toBaseGramsOrMl(qty, unit, baseUnit) {
  const gramUnits = { g: 1, kg: 1000, mg: 0.001 };
  const mlUnits = { ml: 1, l: 1000, cl: 10 };
  if (baseUnit === "g" && gramUnits[unit] != null) return qty * gramUnits[unit];
  if (baseUnit === "ml" && mlUnits[unit] != null) return qty * mlUnits[unit];
  return null;
}

// Normalisiert einen einzelnen gemeldeten Preis auf den Preis je Basis-Einheit
// (g, ml oder Stück). Gibt null zurück, wenn sich kein verlässlicher Wert ableiten lässt.
function normalizePricePerBaseUnit(item, baseUnit) {
  const price = typeof item.price === "number" ? item.price : parseFloat(item.price);
  if (!price || price <= 0) return null;
  if (item.currency && item.currency !== "EUR") return null;

  const pricePer = item.price_per || (item.product && item.product.price_per) || null;
  const product = item.product || {};
  const qty = product.product_quantity ? parseFloat(product.product_quantity) : null;
  const qtyUnit = product.product_quantity_unit ? String(product.product_quantity_unit).toLowerCase() : null;

  if (baseUnit === "piece") {
    if (pricePer === "UNIT") return price;
    if (qty && qtyUnit === "pieces" && qty > 0) return price / qty;
    return null;
  }

  if (qty && qtyUnit) {
    const converted = toBaseGramsOrMl(qty, qtyUnit, baseUnit);
    if (converted) return price / converted;
  }
  if (pricePer === "KILOGRAM" && baseUnit === "g") return price / 1000;
  if (pricePer === "LITER" && baseUnit === "ml") return price / 1000;
  return null;
}

function median(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function fetchIngredientPrice(ingredient) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const params = new URLSearchParams({
      product_name: ingredient.searchTerm,
      location_country_code: "DE",
      order_by: "-created",
      size: "30"
    });
    const res = await fetch(`${OFF_PRICES_ENDPOINT}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { status: "error", httpStatus: res.status };
    }
    const data = await res.json();
    const items = data.items || data.results || [];
    if (!Array.isArray(items) || items.length === 0) {
      return { status: "not_found" };
    }
    const normalized = items
      .map((item) => normalizePricePerBaseUnit(item, ingredient.baseUnit))
      .filter((v) => v !== null && v > 0);
    if (normalized.length === 0) {
      return { status: "not_found" };
    }
    return { status: "ok", pricePerUnit: median(normalized), sampleCount: normalized.length };
  } catch (err) {
    clearTimeout(timeout);
    return { status: "error", message: err && err.message };
  }
}

// Ruft für alle Zutaten die aktuellen Preise ab. Manuell eingegebene Preise
// werden nicht überschrieben, außer die API liefert einen neuen echten Fund.
async function updateAllPrices(onProgress) {
  const cache = loadPriceCache();
  let okCount = 0;
  for (const ingredient of INGREDIENTS) {
    const result = await fetchIngredientPrice(ingredient);
    if (result.status === "ok") {
      cache[ingredient.id] = {
        status: "ok",
        pricePerUnit: result.pricePerUnit,
        sampleCount: result.sampleCount,
        source: "off",
        fetchedAt: new Date().toISOString()
      };
      okCount++;
    } else {
      const existing = cache[ingredient.id];
      if (!existing || existing.source !== "manual") {
        cache[ingredient.id] = {
          status: result.status,
          source: "off",
          fetchedAt: new Date().toISOString()
        };
      }
    }
    if (onProgress) onProgress(ingredient, result);
  }
  savePriceCache(cache);
  setLastUpdatedTimestamp(new Date().toISOString());
  return { okCount, total: INGREDIENTS.length, cache };
}

function setManualPrice(ingredientId, pricePerUnit) {
  const cache = loadPriceCache();
  cache[ingredientId] = {
    status: "ok",
    pricePerUnit,
    source: "manual",
    fetchedAt: new Date().toISOString()
  };
  savePriceCache(cache);
  return cache;
}
