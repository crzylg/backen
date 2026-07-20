// Vom Nutzer selbst hinzugefügte Zutaten, nur lokal im Browser gespeichert
// (kein Server, keine Kosten). Diese Zutaten sind dem täglichen
// GitHub-Actions-Preissync nicht bekannt — ihr Preis kommt entweder aus der
// Live-Suche (liveSearch.js, benötigt eine konfigurierte Proxy-URL) oder aus
// manueller Eingabe.
const CUSTOM_INGREDIENTS_KEY = "pastaci_custom_ingredients";

function loadCustomIngredients() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_INGREDIENTS_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function saveCustomIngredients(list) {
  localStorage.setItem(CUSTOM_INGREDIENTS_KEY, JSON.stringify(list));
}

function addCustomIngredient(name, baseUnit) {
  const list = loadCustomIngredients();
  const ingredient = {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: { de: name, uk: name },
    baseUnit,
    searchTerm: name,
    custom: true
  };
  list.push(ingredient);
  saveCustomIngredients(list);
  return ingredient;
}

function deleteCustomIngredient(id) {
  saveCustomIngredients(loadCustomIngredients().filter((i) => i.id !== id));
}

// Eingebaute + eigene Zutaten zusammen, in dieser Reihenfolge fürs Rendern.
function getAllIngredients() {
  return [...INGREDIENTS, ...loadCustomIngredients()];
}
