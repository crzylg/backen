// Übersetzungswörterbuch / Словник перекладів (Deutsch / Українська)
const I18N = {
  de: {
    "app.title": "Konditor-Rechner",
    "app.subtitle": "Zutatenkosten für Kuchen & Torten berechnen",
    "lang.de": "DE",
    "lang.uk": "UA",
    "nav.ingredients": "Zutaten",
    "nav.recipes": "Rezepte",
    "ingredients.heading": "Zutaten & Mengen",
    "ingredients.intro": "Menge eintragen — die Kosten werden automatisch berechnet.",
    "ingredients.updateButton": "Preise aktualisieren",
    "ingredients.updating": "Preise werden abgerufen …",
    "ingredients.lastUpdated": "Zuletzt aktualisiert",
    "ingredients.neverUpdated": "Noch nie aktualisiert",
    "ingredients.status.ok": "OK — alle Preise aus Deutschland gefunden",
    "ingredients.status.partial": "Teilweise OK",
    "ingredients.status.fail": "NICHT OK — keine Preise gefunden",
    "ingredients.table.name": "Zutat",
    "ingredients.table.quantity": "Menge",
    "ingredients.table.pricePerUnit": "Preis/Einheit",
    "ingredients.table.cost": "Kosten",
    "ingredients.table.source": "Quelle",
    "ingredients.notFound": "Kein Preis gefunden",
    "ingredients.manual": "manuell",
    "ingredients.offSource": "Open Food Facts (DE)",
    "ingredients.enterManually": "manuell eingeben",
    "ingredients.samples": "Datenpunkte",
    "ingredients.total": "Gesamtkosten",
    "ingredients.disclaimer": "Preisquelle: Open Food Facts – Open Prices (kostenlose, von der Community gemeldete Preise aus Deutschland). Keine Preise werden erfunden: Wird nichts gefunden, erscheint „Kein Preis gefunden“ und du kannst den Preis manuell eintragen.",
    "recipes.heading": "Rezepte",
    "recipes.intro": "Foto oder Datei eines Rezepts von deinem Handy hochladen und speichern.",
    "recipes.uploadLabel": "Datei auswählen (Foto, PDF, …)",
    "recipes.nameLabel": "Rezeptname",
    "recipes.nameSample": "z. B. Schokoladentorte",
    "recipes.notesLabel": "Notizen (optional)",
    "recipes.saveButton": "Rezept speichern",
    "recipes.savedHeading": "Gespeicherte Rezepte",
    "recipes.empty": "Noch keine Rezepte gespeichert.",
    "recipes.delete": "Löschen",
    "recipes.open": "Öffnen",
    "recipes.savedAt": "Gespeichert am",
    "recipes.savedOk": "Rezept gespeichert.",
    "recipes.needFileOrName": "Bitte Namen und/oder Datei angeben.",
    "footer.storageNote": "Rezepte werden nur lokal auf diesem Gerät gespeichert (keine Cloud, keine Kosten)."
  },
  uk: {
    "app.title": "Калькулятор кондитера",
    "app.subtitle": "Розрахунок вартості інгредієнтів для тортів і випічки",
    "lang.de": "DE",
    "lang.uk": "UA",
    "nav.ingredients": "Інгредієнти",
    "nav.recipes": "Рецепти",
    "ingredients.heading": "Інгредієнти та кількість",
    "ingredients.intro": "Введіть кількість — вартість розрахується автоматично.",
    "ingredients.updateButton": "Оновити ціни",
    "ingredients.updating": "Отримання цін…",
    "ingredients.lastUpdated": "Востаннє оновлено",
    "ingredients.neverUpdated": "Ще не оновлювалося",
    "ingredients.status.ok": "OK — усі ціни з Німеччини знайдено",
    "ingredients.status.partial": "Частково OK",
    "ingredients.status.fail": "НЕ OK — ціни не знайдено",
    "ingredients.table.name": "Інгредієнт",
    "ingredients.table.quantity": "Кількість",
    "ingredients.table.pricePerUnit": "Ціна/одиниця",
    "ingredients.table.cost": "Вартість",
    "ingredients.table.source": "Джерело",
    "ingredients.notFound": "Ціну не знайдено",
    "ingredients.manual": "вручну",
    "ingredients.offSource": "Open Food Facts (DE)",
    "ingredients.enterManually": "ввести вручну",
    "ingredients.samples": "точок даних",
    "ingredients.total": "Загальна вартість",
    "ingredients.disclaimer": "Джерело цін: Open Food Facts – Open Prices (безкоштовні ціни з Німеччини, надані спільнотою). Жодні ціни не вигадуються: якщо нічого не знайдено, з'являється «Ціну не знайдено», і ви можете ввести ціну вручну.",
    "recipes.heading": "Рецепти",
    "recipes.intro": "Завантажте фото або файл рецепта з телефону та збережіть його.",
    "recipes.uploadLabel": "Обрати файл (фото, PDF, …)",
    "recipes.nameLabel": "Назва рецепта",
    "recipes.nameSample": "напр. Шоколадний торт",
    "recipes.notesLabel": "Нотатки (необов'язково)",
    "recipes.saveButton": "Зберегти рецепт",
    "recipes.savedHeading": "Збережені рецепти",
    "recipes.empty": "Поки що немає збережених рецептів.",
    "recipes.delete": "Видалити",
    "recipes.open": "Відкрити",
    "recipes.savedAt": "Збережено",
    "recipes.savedOk": "Рецепт збережено.",
    "recipes.needFileOrName": "Будь ласка, вкажіть назву та/або файл.",
    "footer.storageNote": "Рецепти зберігаються лише локально на цьому пристрої (без хмари, безкоштовно)."
  }
};

const LANG_STORAGE_KEY = "pastaci_lang";

function getLang() {
  return localStorage.getItem(LANG_STORAGE_KEY) || "de";
}

function setLang(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

function t(key) {
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.de[key] || key;
}

function applyTranslations() {
  document.documentElement.lang = getLang() === "uk" ? "uk" : "de";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
}
