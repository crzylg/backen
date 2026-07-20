// Zutatenliste für Kuchen/Torten. baseUnit ist die Einheit, für die der Preis
// berechnet wird (g, ml oder Stück). searchTerm wird für die Preissuche in
// Deutschland verwendet (deutsche Produktbezeichnung).
const INGREDIENTS = [
  { id: "flour", name: { de: "Mehl", uk: "Борошно" }, baseUnit: "g", searchTerm: "Weizenmehl", offCategory: "flours" },
  { id: "sugar", name: { de: "Zucker", uk: "Цукор" }, baseUnit: "g", searchTerm: "Zucker", offCategory: "sugars" },
  { id: "butter", name: { de: "Butter", uk: "Вершкове масло" }, baseUnit: "g", searchTerm: "Butter", offCategory: "butters" },
  { id: "eggs", name: { de: "Eier", uk: "Яйця" }, baseUnit: "piece", searchTerm: "Eier", offCategory: "eggs" },
  { id: "milk", name: { de: "Milch", uk: "Молоко" }, baseUnit: "ml", searchTerm: "Milch", offCategory: "milks" },
  { id: "baking_powder", name: { de: "Backpulver", uk: "Розпушувач" }, baseUnit: "g", searchTerm: "Backpulver", offCategory: "baking-powders" },
  { id: "vanilla_sugar", name: { de: "Vanillezucker", uk: "Ванільний цукор" }, baseUnit: "g", searchTerm: "Vanillezucker", offCategory: "vanilla-sugars" },
  { id: "salt", name: { de: "Salz", uk: "Сіль" }, baseUnit: "g", searchTerm: "Speisesalz", offCategory: "salts" },
  { id: "cocoa", name: { de: "Kakaopulver", uk: "Какао-порошок" }, baseUnit: "g", searchTerm: "Kakaopulver", offCategory: "cocoa-powders" },
  { id: "chocolate", name: { de: "Schokolade", uk: "Шоколад" }, baseUnit: "g", searchTerm: "Schokolade", offCategory: "chocolates" },
  { id: "cream", name: { de: "Sahne", uk: "Вершки" }, baseUnit: "ml", searchTerm: "Schlagsahne", offCategory: "creams" },
  { id: "cream_cheese", name: { de: "Frischkäse", uk: "Вершковий сир" }, baseUnit: "g", searchTerm: "Frischkäse", offCategory: "cream-cheeses" },
  { id: "powdered_sugar", name: { de: "Puderzucker", uk: "Цукрова пудра" }, baseUnit: "g", searchTerm: "Puderzucker", offCategory: "icing-sugars" },
  { id: "oil", name: { de: "Pflanzenöl", uk: "Олія" }, baseUnit: "ml", searchTerm: "Sonnenblumenöl", offCategory: "vegetable-oils" },
  { id: "lemon", name: { de: "Zitrone", uk: "Лимон" }, baseUnit: "piece", searchTerm: "Zitrone", offCategory: "lemons" }
];

const UNIT_LABEL = {
  de: { g: "g", ml: "ml", piece: "Stück" },
  uk: { g: "г", ml: "мл", piece: "шт." }
};

function unitLabel(baseUnit) {
  const lang = getLang();
  return (UNIT_LABEL[lang] && UNIT_LABEL[lang][baseUnit]) || baseUnit;
}
