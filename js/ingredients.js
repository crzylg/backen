// Zutatenliste für Kuchen/Torten. baseUnit ist die Einheit, für die der Preis
// berechnet wird (g, ml oder Stück). searchTerm/offCategory werden für die
// automatische Preissuche in Deutschland verwendet (siehe priceApi.js).
//
// offCategoryFallbacks: weitere, breitere Open-Food-Facts-Kategorien, die der
// Reihe nach probiert werden, wenn offCategory keine ausreichenden Preise
// liefert (siehe scripts/fetch-prices.mjs). Ein Treffer über eine Fallback-
// Kategorie wird in der UI klar als "weite Kategorie" gekennzeichnet — nie
// unterschiedslos wie ein Treffer in der genauen Kategorie dargestellt.
//
// defaultPricePerUnit: recherchierter Richtwert in EUR je Basis-Einheit,
// Stand DEFAULT_PRICES_DATE. Quelle: reguläre Aldi-/Lidl-Eigenmarkenpreise
// (Stichproben-Websuche, siehe Commit-Historie). Kein Live-Scraping, kein
// erfundener Wert — dient nur als Startpunkt, bis echte Live-Daten von
// Open Food Facts vorliegen oder der Nutzer den Preis manuell anpasst.
const DEFAULT_PRICES_DATE = "2026-07-20";

const INGREDIENTS = [
  { id: "flour", name: { de: "Mehl", uk: "Борошно" }, baseUnit: "g", searchTerm: "Mehl", offCategory: "flours", offCategoryFallbacks: ["cereals-and-their-products", "cereals-and-potatoes"], defaultPricePerUnit: 0.00079 },
  { id: "sugar", name: { de: "Zucker", uk: "Цукор" }, baseUnit: "g", searchTerm: "Zucker", offCategory: "sugars", offCategoryFallbacks: ["sweeteners"], defaultPricePerUnit: 0.00089 },
  { id: "butter", name: { de: "Butter", uk: "Вершкове масло" }, baseUnit: "g", searchTerm: "Butter", offCategory: "butters", offCategoryFallbacks: ["fats", "dairies"], defaultPricePerUnit: 0.00476 },
  { id: "eggs", name: { de: "Eier", uk: "Яйця" }, baseUnit: "piece", searchTerm: "Eier", offCategory: "eggs", offCategoryFallbacks: [], defaultPricePerUnit: 0.249 },
  { id: "milk", name: { de: "Milch", uk: "Молоко" }, baseUnit: "ml", searchTerm: "Milch", offCategory: "milks", offCategoryFallbacks: ["dairies"], defaultPricePerUnit: 0.00095 },
  { id: "baking_powder", name: { de: "Backpulver", uk: "Розпушувач" }, baseUnit: "g", searchTerm: "Backpulver", offCategory: "baking-powders", offCategoryFallbacks: ["raising-agents"], defaultPricePerUnit: 0.00882 },
  { id: "vanilla_sugar", name: { de: "Vanillezucker", uk: "Ванільний цукор" }, baseUnit: "g", searchTerm: "Vanillezucker", offCategory: "vanilla-sugars", offCategoryFallbacks: ["sugars"], defaultPricePerUnit: 0.01625 },
  { id: "salt", name: { de: "Salz", uk: "Сіль" }, baseUnit: "g", searchTerm: "Salz", offCategory: "salts", offCategoryFallbacks: ["condiments"], defaultPricePerUnit: 0.00058 },
  { id: "cocoa", name: { de: "Kakaopulver", uk: "Какао-порошок" }, baseUnit: "g", searchTerm: "Kakaopulver", offCategory: "cocoa-powders", offCategoryFallbacks: ["cocoa-and-chocolate-powders"], defaultPricePerUnit: 0.00596 },
  { id: "chocolate", name: { de: "Schokolade", uk: "Шоколад" }, baseUnit: "g", searchTerm: "Schokolade", offCategory: "chocolates", offCategoryFallbacks: ["cocoa-and-chocolate-products"], defaultPricePerUnit: 0.0099 },
  { id: "cream", name: { de: "Sahne", uk: "Вершки" }, baseUnit: "ml", searchTerm: "Sahne", offCategory: "creams", offCategoryFallbacks: ["dairies"], defaultPricePerUnit: 0.00445 },
  { id: "cream_cheese", name: { de: "Frischkäse", uk: "Вершковий сир" }, baseUnit: "g", searchTerm: "Frischkäse", offCategory: "cream-cheeses", offCategoryFallbacks: ["cheeses", "dairies"], defaultPricePerUnit: 0.00475 },
  { id: "powdered_sugar", name: { de: "Puderzucker", uk: "Цукрова пудра" }, baseUnit: "g", searchTerm: "Puderzucker", offCategory: "icing-sugars", offCategoryFallbacks: ["sugars"], defaultPricePerUnit: 0.00158 },
  { id: "oil", name: { de: "Pflanzenöl", uk: "Олія" }, baseUnit: "ml", searchTerm: "Sonnenblumenöl", offCategory: "vegetable-oils", offCategoryFallbacks: ["oils-and-fats"], defaultPricePerUnit: 0.00179 },
  { id: "lemon", name: { de: "Zitrone", uk: "Лимон" }, baseUnit: "piece", searchTerm: "Zitrone", offCategory: "lemons", offCategoryFallbacks: ["citrus-fruits", "fruits"], defaultPricePerUnit: 0.49 },
  { id: "couverture", name: { de: "Kuvertüre", uk: "Кувертюр (шоколадна глазур)" }, baseUnit: "g", searchTerm: "Kuvertüre", offCategory: "chocolates", offCategoryFallbacks: ["cocoa-and-chocolate-products"], defaultPricePerUnit: 0.01095 },
  { id: "gelatine", name: { de: "Gelatine (Blatt)", uk: "Желатин (листовий)" }, baseUnit: "piece", searchTerm: "Gelatine", offCategory: "gelling-agents", offCategoryFallbacks: [], defaultPricePerUnit: 0.1 },
  { id: "cream_stiffener", name: { de: "Sahnesteif", uk: "Стабілізатор для вершків" }, baseUnit: "g", searchTerm: "Sahnesteif", offCategory: "whipped-cream-stabilisers", offCategoryFallbacks: [], defaultPricePerUnit: 0.01875 },
  { id: "fresh_yeast", name: { de: "Frischhefe", uk: "Свіжі дріжджі" }, baseUnit: "g", searchTerm: "Frischhefe", offCategory: "yeasts", offCategoryFallbacks: [], defaultPricePerUnit: 0.00595 },
  { id: "dry_yeast", name: { de: "Trockenhefe", uk: "Суха дріжджі" }, baseUnit: "g", searchTerm: "Trockenhefe", offCategory: "yeasts", offCategoryFallbacks: [], defaultPricePerUnit: 0.02 },
  { id: "baking_soda", name: { de: "Natron", uk: "Харчова сода" }, baseUnit: "g", searchTerm: "Natron", offCategory: "raising-agents", offCategoryFallbacks: [], defaultPricePerUnit: 0.00356 },
  { id: "cinnamon", name: { de: "Zimt (gemahlen)", uk: "Кориця (мелена)" }, baseUnit: "g", searchTerm: "Zimt", offCategory: "spices", offCategoryFallbacks: [], defaultPricePerUnit: 0.022 },
  { id: "vanilla_extract", name: { de: "Vanilleextrakt", uk: "Ванільний екстракт" }, baseUnit: "ml", searchTerm: "Vanilleextrakt", offCategory: "flavourings", offCategoryFallbacks: [], defaultPricePerUnit: 0.034 },
  { id: "ground_almonds", name: { de: "Mandeln (gemahlen)", uk: "Мигдаль (мелений)" }, baseUnit: "g", searchTerm: "Mandeln", offCategory: "almond-flours", offCategoryFallbacks: ["nuts", "dried-fruits"], defaultPricePerUnit: 0.01395 },
  { id: "honey", name: { de: "Honig", uk: "Мед" }, baseUnit: "g", searchTerm: "Honig", offCategory: "honeys", offCategoryFallbacks: [], defaultPricePerUnit: 0.00658 },
  { id: "raisins", name: { de: "Rosinen", uk: "Родзинки" }, baseUnit: "g", searchTerm: "Rosinen", offCategory: "raisins", offCategoryFallbacks: ["dried-fruits"], defaultPricePerUnit: 0.00595 },
  { id: "coconut_flakes", name: { de: "Kokosraspeln", uk: "Кокосова стружка" }, baseUnit: "g", searchTerm: "Kokosraspeln", offCategory: "shredded-coconuts", offCategoryFallbacks: ["coconuts"], defaultPricePerUnit: 0.00545 },
  { id: "cornstarch", name: { de: "Speisestärke", uk: "Кукурудзяний крохмаль" }, baseUnit: "g", searchTerm: "Stärke", offCategory: "corn-starches", offCategoryFallbacks: ["starches"], defaultPricePerUnit: 0.00198 },
  { id: "buttermilk", name: { de: "Buttermilch", uk: "Маслянка" }, baseUnit: "ml", searchTerm: "Buttermilch", offCategory: "buttermilks", offCategoryFallbacks: ["dairies"], defaultPricePerUnit: 0.00158 },
  { id: "yogurt", name: { de: "Naturjoghurt", uk: "Натуральний йогурт" }, baseUnit: "g", searchTerm: "Joghurt", offCategory: "yogurts", offCategoryFallbacks: ["dairies"], defaultPricePerUnit: 0.00158 },
  { id: "quark", name: { de: "Quark", uk: "Кварк (кисломолочний сир)" }, baseUnit: "g", searchTerm: "Quark", offCategory: "quarks", offCategoryFallbacks: ["cheeses", "dairies"], defaultPricePerUnit: 0.0019 },
  { id: "mascarpone", name: { de: "Mascarpone", uk: "Маскарпоне" }, baseUnit: "g", searchTerm: "Mascarpone", offCategory: "mascarpones", offCategoryFallbacks: ["cheeses", "dairies"], defaultPricePerUnit: 0.00676 },
  { id: "marzipan", name: { de: "Marzipan (Rohmasse)", uk: "Марципан (сира маса)" }, baseUnit: "g", searchTerm: "Marzipan", offCategory: "marzipans", offCategoryFallbacks: [], defaultPricePerUnit: 0.01395 }
];

const UNIT_LABEL = {
  de: { g: "g", ml: "ml", piece: "Stück" },
  uk: { g: "г", ml: "мл", piece: "шт." }
};

function unitLabel(baseUnit) {
  const lang = getLang();
  return (UNIT_LABEL[lang] && UNIT_LABEL[lang][baseUnit]) || baseUnit;
}

// Erlaubt das Wiederverwenden dieser Liste im Node-Skript (scripts/fetch-prices.mjs),
// ohne die Browser-Nutzung als globales <script> zu verändern.
if (typeof module !== "undefined") {
  module.exports = { INGREDIENTS };
}
