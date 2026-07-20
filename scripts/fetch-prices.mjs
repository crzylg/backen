#!/usr/bin/env node
// Läuft serverseitig (GitHub Actions), nicht im Browser — deshalb kein CORS-Problem.
// Ruft für jede Zutat echte, von der Community gemeldete Preise aus Deutschland bei
// Open Food Facts – Open Prices ab und schreibt das Ergebnis nach data/prices.json.
// Wird für eine Zutat nichts gefunden, wird status "not_found" gespeichert —
// es wird niemals ein Preis erfunden.
import { createRequire } from "module";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { INGREDIENTS } = require("../js/ingredients.js");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "data", "prices.json");
const OFF_PRICES_ENDPOINT = "https://prices.openfoodfacts.org/api/v1/prices";
const FETCH_TIMEOUT_MS = 15000;
const DELAY_BETWEEN_REQUESTS_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toBaseGramsOrMl(qty, unit, baseUnit) {
  const gramUnits = { g: 1, kg: 1000, mg: 0.001 };
  const mlUnits = { ml: 1, l: 1000, cl: 10 };
  if (baseUnit === "g" && gramUnits[unit] != null) return qty * gramUnits[unit];
  if (baseUnit === "ml" && mlUnits[unit] != null) return qty * mlUnits[unit];
  return null;
}

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
    // product_name erfordert exakte Übereinstimmung; product_name__like erlaubt
    // eine Teilstring-Suche und ist der einzige Weg, generische Zutatennamen
    // (z. B. "Mehl") gegen volle Produktbezeichnungen zu matchen.
    const params = new URLSearchParams({
      product_name__like: ingredient.searchTerm,
      location_country_code: "DE",
      order_by: "-created",
      size: "30"
    });
    const res = await fetch(`${OFF_PRICES_ENDPOINT}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Konditor-Rechner/1.0 (+https://github.com/crzylg/backen)"
      },
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

async function main() {
  const prices = {};
  let okCount = 0;

  for (const ingredient of INGREDIENTS) {
    const result = await fetchIngredientPrice(ingredient);
    if (result.status === "ok") {
      prices[ingredient.id] = {
        status: "ok",
        pricePerUnit: result.pricePerUnit,
        sampleCount: result.sampleCount
      };
      okCount++;
      console.log(`OK  ${ingredient.id}: ${result.pricePerUnit.toFixed(5)} EUR/${ingredient.baseUnit} (${result.sampleCount} Datenpunkte)`);
    } else {
      prices[ingredient.id] = { status: result.status === "error" ? "error" : "not_found" };
      console.log(`--  ${ingredient.id}: ${result.status}${result.httpStatus ? " (HTTP " + result.httpStatus + ")" : ""}`);
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    country: "DE",
    source: "Open Food Facts - Open Prices (https://prices.openfoodfacts.org)",
    okCount,
    total: INGREDIENTS.length,
    prices
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`\n${okCount}/${INGREDIENTS.length} Preise gefunden. Geschrieben nach ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
