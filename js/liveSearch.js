// Zweistufige Live-Preissuche für vom Nutzer hinzugefügte Zutaten, über den
// selbst gehosteten Cloudflare-Worker-Proxy (siehe cloudflare-worker/README.md).
//
// Warum zweistufig: Open Prices' product_name-Filter funktioniert nicht
// (siehe priceApi.js-Kommentar und Commit-Historie) — nur category_tag
// filtert wirklich. Freitext-Suche gibt es aber im normalen Open-Food-Facts-
// Produktkatalog. Schritt 1 sucht dort nach dem eingegebenen Namen und
// ermittelt die häufigste Kategorie unter den Treffern; Schritt 2 fragt mit
// dieser Kategorie echte Preise aus Deutschland bei Open Prices ab.
const PROXY_URL_KEY = "pastaci_proxy_url";
const LIVE_SEARCH_TIMEOUT_MS = 12000;
// Ein einzelner gemeldeter Preis kann ein Ausreißer oder Tippfehler sein
// (Open Prices ist crowdsourced). Erst ab zwei unabhängigen Preisen zeigen
// wir das Ergebnis als "gefunden" an.
const MIN_SAMPLE_COUNT = 2;

function getProxyUrl() {
  return (localStorage.getItem(PROXY_URL_KEY) || "").trim().replace(/\/+$/, "");
}

function setProxyUrl(url) {
  localStorage.setItem(PROXY_URL_KEY, (url || "").trim().replace(/\/+$/, ""));
}

function toBaseGramsOrMlForLive(qty, unit, baseUnit) {
  const gramUnits = { g: 1, kg: 1000, mg: 0.001 };
  const mlUnits = { ml: 1, l: 1000, cl: 10 };
  if (baseUnit === "g" && gramUnits[unit] != null) return qty * gramUnits[unit];
  if (baseUnit === "ml" && mlUnits[unit] != null) return qty * mlUnits[unit];
  return null;
}

function normalizeLivePrice(item, baseUnit) {
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
    const converted = toBaseGramsOrMlForLive(qty, qtyUnit, baseUnit);
    if (converted) return price / converted;
  }
  if (pricePer === "KILOGRAM" && baseUnit === "g") return price / 1000;
  if (pricePer === "LITER" && baseUnit === "ml") return price / 1000;
  return null;
}

function medianOf(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LIVE_SEARCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Schritt 1: häufigste Kategorie unter den zum Namen passenden Produkten
// im deutschen Open-Food-Facts-Katalog ermitteln.
async function findCategoryForName(proxy, searchTerm) {
  const params = new URLSearchParams({
    search_terms: searchTerm,
    countries_tags_en: "germany",
    json: "1",
    page_size: "20"
  });
  const res = await fetchWithTimeout(`${proxy}/off/cgi/search.pl?${params.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  const products = data.products || [];
  const counts = {};
  products.forEach((p) => {
    (p.categories_tags || []).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

// Schritt 2: echte Preise aus Deutschland für diese Kategorie abfragen.
async function fetchPricesForCategory(proxy, categoryTag, baseUnit) {
  const params = new URLSearchParams({
    category_tag: categoryTag,
    location_country_code: "DE",
    order_by: "-created",
    size: "30"
  });
  const res = await fetchWithTimeout(`${proxy}/prices/api/v1/prices?${params.toString()}`);
  if (!res.ok) return { status: "error", httpStatus: res.status };
  const data = await res.json();
  const items = data.items || data.results || [];
  const normalized = items
    .map((item) => normalizeLivePrice(item, baseUnit))
    .filter((v) => v !== null && v > 0);
  if (normalized.length < MIN_SAMPLE_COUNT) return { status: "not_found" };
  return { status: "ok", pricePerUnit: medianOf(normalized), sampleCount: normalized.length };
}

// Öffentliche Funktion: sucht live nach einem Preis für eine (meist selbst
// hinzugefügte) Zutat. Erfindet nie einen Preis - liefert "not_found" oder
// "no_proxy", wenn nichts gefunden wird bzw. keine Proxy-URL konfiguriert ist.
async function liveSearchPrice(ingredient) {
  const proxy = getProxyUrl();
  if (!proxy) return { status: "no_proxy" };
  try {
    const categoryTag = await findCategoryForName(proxy, ingredient.searchTerm);
    if (!categoryTag) return { status: "not_found" };
    const result = await fetchPricesForCategory(proxy, categoryTag, ingredient.baseUnit);
    return { ...result, categoryTag };
  } catch (err) {
    return { status: "error", message: err && err.message };
  }
}
