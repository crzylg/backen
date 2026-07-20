// Zutatenliste für Kuchen/Torten. baseUnit ist die Einheit, für die der Preis
// berechnet wird (g, ml oder Stück). searchTerm/offCategory werden für die
// automatische Preissuche in Deutschland verwendet (siehe priceApi.js).
//
// defaultPricePerUnit: recherchierter Richtwert in EUR je Basis-Einheit,
// Stand DEFAULT_PRICES_DATE. Quelle: reguläre Aldi-/Lidl-Eigenmarkenpreise
// (Stichproben-Websuche, siehe Commit-Historie). Kein Live-Scraping, kein
// erfundener Wert — dient nur als Startpunkt, bis echte Live-Daten von
// Open Food Facts vorliegen oder der Nutzer den Preis manuell anpasst.
const DEFAULT_PRICES_DATE = "2026-07-20";

const INGREDIENTS = [
  { id: "flour", name: { de: "Mehl", uk: "Борошно" }, baseUnit: "g", searchTerm: "Mehl", offCategory: "flours", defaultPricePerUnit: 0.00079 },
  { id: "sugar", name: { de: "Zucker", uk: "Цукор" }, baseUnit: "g", searchTerm: "Zucker", offCategory: "sugars", defaultPricePerUnit: 0.00089 },
  { id: "butter", name: { de: "Butter", uk: "Вершкове масло" }, baseUnit: "g", searchTerm: "Butter", offCategory: "butters", defaultPricePerUnit: 0.00476 },
  { id: "eggs", name: { de: "Eier", uk: "Яйця" }, baseUnit: "piece", searchTerm: "Eier", offCategory: "eggs", defaultPricePerUnit: 0.249 },
  { id: "milk", name: { de: "Milch", uk: "Молоко" }, baseUnit: "ml", searchTerm: "Milch", offCategory: "milks", defaultPricePerUnit: 0.00095 },
  { id: "baking_powder", name: { de: "Backpulver", uk: "Розпушувач" }, baseUnit: "g", searchTerm: "Backpulver", offCategory: "baking-powders", defaultPricePerUnit: 0.00882 },
  { id: "vanilla_sugar", name: { de: "Vanillezucker", uk: "Ванільний цукор" }, baseUnit: "g", searchTerm: "Vanillezucker", offCategory: "vanilla-sugars", defaultPricePerUnit: 0.01625 },
  { id: "salt", name: { de: "Salz", uk: "Сіль" }, baseUnit: "g", searchTerm: "Salz", offCategory: "salts", defaultPricePerUnit: 0.00058 },
  { id: "cocoa", name: { de: "Kakaopulver", uk: "Какао-порошок" }, baseUnit: "g", searchTerm: "Kakaopulver", offCategory: "cocoa-powders", defaultPricePerUnit: 0.00596 },
  { id: "chocolate", name: { de: "Schokolade", uk: "Шоколад" }, baseUnit: "g", searchTerm: "Schokolade", offCategory: "chocolates", defaultPricePerUnit: 0.0099 },
  { id: "cream", name: { de: "Sahne", uk: "Вершки" }, baseUnit: "ml", searchTerm: "Sahne", offCategory: "creams", defaultPricePerUnit: 0.00445 },
  { id: "cream_cheese", name: { de: "Frischkäse", uk: "Вершковий сир" }, baseUnit: "g", searchTerm: "Frischkäse", offCategory: "cream-cheeses", defaultPricePerUnit: 0.00475 },
  { id: "powdered_sugar", name: { de: "Puderzucker", uk: "Цукрова пудра" }, baseUnit: "g", searchTerm: "Puderzucker", offCategory: "icing-sugars", defaultPricePerUnit: 0.00158 },
  { id: "oil", name: { de: "Pflanzenöl", uk: "Олія" }, baseUnit: "ml", searchTerm: "Sonnenblumenöl", offCategory: "vegetable-oils", defaultPricePerUnit: 0.00179 },
  { id: "lemon", name: { de: "Zitrone", uk: "Лимон" }, baseUnit: "piece", searchTerm: "Zitrone", offCategory: "lemons", defaultPricePerUnit: 0.49 },
  { id: "couverture", name: { de: "Kuvertüre", uk: "Кувертюр (шоколадна глазур)" }, baseUnit: "g", searchTerm: "Kuvertüre", offCategory: "chocolates", defaultPricePerUnit: 0.01095 },
  { id: "gelatine", name: { de: "Gelatine (Blatt)", uk: "Желатин (листовий)" }, baseUnit: "piece", searchTerm: "Gelatine", offCategory: "gelling-agents", defaultPricePerUnit: 0.1 },
  { id: "cream_stiffener", name: { de: "Sahnesteif", uk: "Стабілізатор для вершків" }, baseUnit: "g", searchTerm: "Sahnesteif", offCategory: "whipped-cream-stabilisers", defaultPricePerUnit: 0.01875 },
  { id: "fresh_yeast", name: { de: "Frischhefe", uk: "Свіжі дріжджі" }, baseUnit: "g", searchTerm: "Frischhefe", offCategory: "yeasts", defaultPricePerUnit: 0.00595 },
  { id: "dry_yeast", name: { de: "Trockenhefe", uk: "Суха дріжджі" }, baseUnit: "g", searchTerm: "Trockenhefe", offCategory: "yeasts", defaultPricePerUnit: 0.02 },
  { id: "baking_soda", name: { de: "Natron", uk: "Харчова сода" }, baseUnit: "g", searchTerm: "Natron", offCategory: "raising-agents", defaultPricePerUnit: 0.00356 },
  { id: "cinnamon", name: { de: "Zimt (gemahlen)", uk: "Кориця (мелена)" }, baseUnit: "g", searchTerm: "Zimt", offCategory: "spices", defaultPricePerUnit: 0.022 },
  { id: "vanilla_extract", name: { de: "Vanilleextrakt", uk: "Ванільний екстракт" }, baseUnit: "ml", searchTerm: "Vanilleextrakt", offCategory: "flavourings", defaultPricePerUnit: 0.034 },
  { id: "ground_almonds", name: { de: "Mandeln (gemahlen)", uk: "Мигдаль (мелений)" }, baseUnit: "g", searchTerm: "Mandeln", offCategory: "almond-flours", defaultPricePerUnit: 0.01395 },
  { id: "honey", name: { de: "Honig", uk: "Мед" }, baseUnit: "g", searchTerm: "Honig", offCategory: "honeys", defaultPricePerUnit: 0.00658 },
  { id: "raisins", name: { de: "Rosinen", uk: "Родзинки" }, baseUnit: "g", searchTerm: "Rosinen", offCategory: "raisins", defaultPricePerUnit: 0.00595 },
  { id: "coconut_flakes", name: { de: "Kokosraspeln", uk: "Кокосова стружка" }, baseUnit: "g", searchTerm: "Kokosraspeln", offCategory: "shredded-coconuts", defaultPricePerUnit: 0.00545 },
  { id: "cornstarch", name: { de: "Speisestärke", uk: "Кукурудзяний крохмаль" }, baseUnit: "g", searchTerm: "Stärke", offCategory: "corn-starches", defaultPricePerUnit: 0.00198 },
  { id: "buttermilk", name: { de: "Buttermilch", uk: "Маслянка" }, baseUnit: "ml", searchTerm: "Buttermilch", offCategory: "buttermilks", defaultPricePerUnit: 0.00158 },
  { id: "yogurt", name: { de: "Naturjoghurt", uk: "Натуральний йогурт" }, baseUnit: "g", searchTerm: "Joghurt", offCategory: "yogurts", defaultPricePerUnit: 0.00158 },
  { id: "quark", name: { de: "Quark", uk: "Кварк (кисломолочний сир)" }, baseUnit: "g", searchTerm: "Quark", offCategory: "quarks", defaultPricePerUnit: 0.0019 },
  { id: "mascarpone", name: { de: "Mascarpone", uk: "Маскарпоне" }, baseUnit: "g", searchTerm: "Mascarpone", offCategory: "mascarpones", defaultPricePerUnit: 0.00676 },
  { id: "marzipan", name: { de: "Marzipan (Rohmasse)", uk: "Марципан (сира маса)" }, baseUnit: "g", searchTerm: "Marzipan", offCategory: "marzipans", defaultPricePerUnit: 0.01395 }
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
