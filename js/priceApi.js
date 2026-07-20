// Liest die zuletzt synchronisierten Deutschland-Preise aus data/prices.json.
// Diese Datei wird NICHT im Browser live von Open Food Facts abgerufen (die
// Open Prices API unterstützt kein CORS für Browser-Anfragen), sondern von
// einem GitHub-Actions-Workflow serverseitig aktualisiert (scripts/fetch-prices.mjs,
// .github/workflows/update-prices.yml), der täglich läuft und bei Bedarf manuell
// angestoßen werden kann. So bleibt alles kostenlos und ohne eigenen Server.
// Wird für eine Zutat nichts gefunden, wird NIEMALS ein Preis erfunden.
const PRICES_JSON_URL = "data/prices.json";
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

// Füllt Zutaten ohne jeglichen gespeicherten Preis mit dem recherchierten
// Richtwert (ingredients.js: defaultPricePerUnit). Wird nur einmalig beim
// ersten Laden aufgerufen; überschreibt nie einen bereits vorhandenen Eintrag.
function ensureDefaultPrices() {
  const cache = loadPriceCache();
  let changed = false;
  INGREDIENTS.forEach((ingredient) => {
    if (!cache[ingredient.id] && typeof ingredient.defaultPricePerUnit === "number") {
      cache[ingredient.id] = {
        status: "ok",
        pricePerUnit: ingredient.defaultPricePerUnit,
        source: "default",
        fetchedAt: DEFAULT_PRICES_DATE
      };
      changed = true;
    }
  });
  if (changed) savePriceCache(cache);
  return cache;
}

async function fetchSyncedPrices() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${PRICES_JSON_URL}?v=${Date.now()}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    return null;
  }
}

// Übernimmt die zuletzt synchronisierten Preise in den lokalen Cache. Manuell
// eingegebene Preise werden nicht überschrieben. Gibt an, wie viele Zutaten
// einen echten Preis aus Deutschland haben (okCount) und ob data/prices.json
// überhaupt erreichbar war (fetchFailed).
async function updateAllPrices(onProgress) {
  const cache = loadPriceCache();
  const remote = await fetchSyncedPrices();
  let okCount = 0;

  for (const ingredient of INGREDIENTS) {
    const remoteEntry = remote && remote.prices ? remote.prices[ingredient.id] : null;
    let entry;
    if (remoteEntry && remoteEntry.status === "ok" && typeof remoteEntry.pricePerUnit === "number") {
      entry = {
        status: "ok",
        pricePerUnit: remoteEntry.pricePerUnit,
        sampleCount: remoteEntry.sampleCount,
        source: "off",
        fetchedAt: (remote && remote.generatedAt) || new Date().toISOString()
      };
      cache[ingredient.id] = entry;
      okCount++;
    } else {
      const existing = cache[ingredient.id];
      if (existing && (existing.source === "manual" || existing.source === "default")) {
        // Richtwerte und manuelle Preise bleiben stehen, bis echte Live-Daten
        // gefunden werden - sie werden nicht durch "nicht gefunden" ersetzt.
        entry = existing;
      } else {
        entry = {
          status: remoteEntry ? remoteEntry.status : "error",
          source: "off",
          fetchedAt: new Date().toISOString()
        };
        cache[ingredient.id] = entry;
      }
    }
    if (onProgress) onProgress(ingredient, entry);
  }

  savePriceCache(cache);
  const ts = (remote && remote.generatedAt) || new Date().toISOString();
  setLastUpdatedTimestamp(ts);
  return {
    okCount,
    total: INGREDIENTS.length,
    cache,
    remoteGeneratedAt: remote ? remote.generatedAt : null,
    fetchFailed: !remote
  };
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

// Ergebnis einer Live-Suche (liveSearch.js) für eine selbst hinzugefügte
// Zutat im Cache ablegen. Wie "off", aber eigene Quelle fürs Badge.
function setLivePrice(ingredientId, pricePerUnit, sampleCount) {
  const cache = loadPriceCache();
  cache[ingredientId] = {
    status: "ok",
    pricePerUnit,
    sampleCount,
    source: "live",
    fetchedAt: new Date().toISOString()
  };
  savePriceCache(cache);
  return cache;
}

function setNotFound(ingredientId) {
  const cache = loadPriceCache();
  cache[ingredientId] = { status: "not_found", source: "live", fetchedAt: new Date().toISOString() };
  savePriceCache(cache);
  return cache;
}
