// Zutatenliste für Kuchen/Torten. baseUnit ist die Einheit, für die der Preis
// berechnet wird (g, ml oder Stück). searchTerm wird für die Preissuche in
// Deutschland verwendet (deutsche Produktbezeichnung).
const INGREDIENTS = [
  { id: "flour", name: { de: "Mehl", uk: "Борошно" }, baseUnit: "g", searchTerm: "Mehl", offCategory: "flours" },
  { id: "sugar", name: { de: "Zucker", uk: "Цукор" }, baseUnit: "g", searchTerm: "Zucker", offCategory: "sugars" },
  { id: "butter", name: { de: "Butter", uk: "Вершкове масло" }, baseUnit: "g", searchTerm: "Butter", offCategory: "butters" },
  { id: "eggs", name: { de: "Eier", uk: "Яйця" }, baseUnit: "piece", searchTerm: "Eier", offCategory: "eggs" },
  { id: "milk", name: { de: "Milch", uk: "Молоко" }, baseUnit: "ml", searchTerm: "Milch", offCategory: "milks" },
  { id: "baking_powder", name: { de: "Backpulver", uk: "Розпушувач" }, baseUnit: "g", searchTerm: "Backpulver", offCategory: "baking-powders" },
  { id: "vanilla_sugar", name: { de: "Vanillezucker", uk: "Ванільний цукор" }, baseUnit: "g", searchTerm: "Vanillezucker", offCategory: "vanilla-sugars" },
  { id: "salt", name: { de: "Salz", uk: "Сіль" }, baseUnit: "g", searchTerm: "Salz", offCategory: "salts" },
  { id: "cocoa", name: { de: "Kakaopulver", uk: "Какао-порошок" }, baseUnit: "g", searchTerm: "Kakaopulver", offCategory: "cocoa-powders" },
  { id: "chocolate", name: { de: "Schokolade", uk: "Шоколад" }, baseUnit: "g", searchTerm: "Schokolade", offCategory: "chocolates" },
  { id: "cream", name: { de: "Sahne", uk: "Вершки" }, baseUnit: "ml", searchTerm: "Sahne", offCategory: "creams" },
  { id: "cream_cheese", name: { de: "Frischkäse", uk: "Вершковий сир" }, baseUnit: "g", searchTerm: "Frischkäse", offCategory: "cream-cheeses" },
  { id: "powdered_sugar", name: { de: "Puderzucker", uk: "Цукрова пудра" }, baseUnit: "g", searchTerm: "Puderzucker", offCategory: "icing-sugars" },
  { id: "oil", name: { de: "Pflanzenöl", uk: "Олія" }, baseUnit: "ml", searchTerm: "Sonnenblumenöl", offCategory: "vegetable-oils" },
  { id: "lemon", name: { de: "Zitrone", uk: "Лимон" }, baseUnit: "piece", searchTerm: "Zitrone", offCategory: "lemons" },
  { id: "couverture", name: { de: "Kuvertüre", uk: "Кувертюр (шоколадна глазур)" }, baseUnit: "g", searchTerm: "Kuvertüre", offCategory: "chocolates" },
  { id: "gelatine", name: { de: "Gelatine (Blatt)", uk: "Желатин (листовий)" }, baseUnit: "piece", searchTerm: "Gelatine", offCategory: "gelling-agents" },
  { id: "cream_stiffener", name: { de: "Sahnesteif", uk: "Стабілізатор для вершків" }, baseUnit: "g", searchTerm: "Sahnesteif", offCategory: "whipped-cream-stabilisers" },
  { id: "fresh_yeast", name: { de: "Frischhefe", uk: "Свіжі дріжджі" }, baseUnit: "g", searchTerm: "Frischhefe", offCategory: "yeasts" },
  { id: "dry_yeast", name: { de: "Trockenhefe", uk: "Суха дріжджі" }, baseUnit: "g", searchTerm: "Trockenhefe", offCategory: "yeasts" },
  { id: "baking_soda", name: { de: "Natron", uk: "Харчова сода" }, baseUnit: "g", searchTerm: "Natron", offCategory: "raising-agents" },
  { id: "cinnamon", name: { de: "Zimt (gemahlen)", uk: "Кориця (мелена)" }, baseUnit: "g", searchTerm: "Zimt", offCategory: "spices" },
  { id: "vanilla_extract", name: { de: "Vanilleextrakt", uk: "Ванільний екстракт" }, baseUnit: "ml", searchTerm: "Vanilleextrakt", offCategory: "flavourings" },
  { id: "ground_almonds", name: { de: "Mandeln (gemahlen)", uk: "Мигдаль (мелений)" }, baseUnit: "g", searchTerm: "Mandeln", offCategory: "almond-flours" },
  { id: "honey", name: { de: "Honig", uk: "Мед" }, baseUnit: "g", searchTerm: "Honig", offCategory: "honeys" },
  { id: "raisins", name: { de: "Rosinen", uk: "Родзинки" }, baseUnit: "g", searchTerm: "Rosinen", offCategory: "raisins" },
  { id: "coconut_flakes", name: { de: "Kokosraspeln", uk: "Кокосова стружка" }, baseUnit: "g", searchTerm: "Kokosraspeln", offCategory: "shredded-coconuts" },
  { id: "cornstarch", name: { de: "Speisestärke", uk: "Кукурудзяний крохмаль" }, baseUnit: "g", searchTerm: "Stärke", offCategory: "corn-starches" },
  { id: "buttermilk", name: { de: "Buttermilch", uk: "Маслянка" }, baseUnit: "ml", searchTerm: "Buttermilch", offCategory: "buttermilks" },
  { id: "yogurt", name: { de: "Naturjoghurt", uk: "Натуральний йогурт" }, baseUnit: "g", searchTerm: "Joghurt", offCategory: "yogurts" },
  { id: "quark", name: { de: "Quark", uk: "Кварк (кисломолочний сир)" }, baseUnit: "g", searchTerm: "Quark", offCategory: "quarks" },
  { id: "mascarpone", name: { de: "Mascarpone", uk: "Маскарпоне" }, baseUnit: "g", searchTerm: "Mascarpone", offCategory: "mascarpones" },
  { id: "marzipan", name: { de: "Marzipan (Rohmasse)", uk: "Марципан (сира маса)" }, baseUnit: "g", searchTerm: "Marzipan", offCategory: "marzipans" }
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
