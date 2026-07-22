// Übersetzungswörterbuch / Словник перекладів (Deutsch / Українська)
const I18N = {
  de: {
    "app.title": "Konditor-Rechner",
    "app.subtitle": "Berechne die Kosten für Kuchen und Torten",
    "lang.de": "DE",
    "lang.uk": "UA",
    "nav.ingredients": "Zutaten",
    "nav.recipes": "Rezepte",
    "ingredients.heading": "Zutaten und Mengen",
    "ingredients.intro": "Trage die Menge ein. Die App rechnet die Kosten für dich aus.",
    "ingredients.updateButton": "Preise aktualisieren",
    "ingredients.updating": "Bitte warten …",
    "ingredients.lastUpdated": "Letzte Aktualisierung",
    "ingredients.neverUpdated": "Noch keine Aktualisierung",
    "ingredients.status.ok": "Super! Wir haben alle Preise aus Deutschland gefunden.",
    "ingredients.status.partial": "Wir haben einige Preise gefunden.",
    "ingredients.status.fail": "Wir haben keine neuen Preise gefunden.",
    "ingredients.table.name": "Zutat",
    "ingredients.table.quantity": "Menge",
    "ingredients.table.pricePerUnit": "Preis",
    "ingredients.table.cost": "Kosten",
    "ingredients.table.source": "Woher?",
    "ingredients.notFound": "Kein Preis gefunden",
    "ingredients.manual": "selbst eingetragen",
    "ingredients.offSource": "Open Food Facts (DE)",
    "ingredients.defaultSource": "Beispiel-Preis",
    "ingredients.enterManually": "Preis selbst eintragen",
    "ingredients.samples": "Preise gefunden",
    "ingredients.total": "Summe",
    "ingredients.disclaimer": "Die Preise kommen von Open Food Facts. Das ist eine kostenlose Datenbank. Menschen aus Deutschland tragen dort echte Preise ein. Jeden Tag prüfen wir neue Preise. Gibt es noch keinen Preis? Dann zeigen wir einen Beispiel-Preis (von Aldi oder Lidl, mit Datum). Wir erfinden keine Preise. Du kannst jeden Preis selbst ändern.",
    "ingredients.newNamePlaceholder": "Neue Zutat, zum Beispiel Himbeeren",
    "ingredients.addButton": "+ Zutat hinzufügen",
    "ingredients.customBadge": "eigene Zutat",
    "ingredients.searchPrice": "Preis suchen",
    "ingredients.searching": "Wir suchen …",
    "ingredients.liveSource": "Live-Suche",
    "ingredients.deleteIngredient": "Löschen",
    "ingredients.noProxyConfigured": "Das ist noch nicht eingerichtet. Sieh dir die Einstellungen unten an.",
    "ingredients.liveNotFound": "Wir haben keinen Preis gefunden.",
    "ingredients.liveError": "Die Suche hat nicht funktioniert.",
    "ingredients.priceWarning": "Preis prüfen! Er weicht stark vom Beispiel-Preis ab.",
    "settings.title": "Einstellungen für eigene Zutaten",
    "settings.proxyHelp": "Das ist nicht Pflicht. Trage hier eine Adresse ein. Dann funktioniert die Preis-Suche für neue Zutaten. Die Anleitung dazu steht in der Datei cloudflare-worker/README.md.",
    "settings.proxyPlaceholder": "https://dein-worker.workers.dev",
    "settings.save": "Speichern",
    "settings.saved": "Gespeichert.",
    "recipes.heading": "Rezepte",
    "recipes.intro": "Lade ein Foto oder eine Datei von deinem Handy hoch. Speichere dein Rezept.",
    "recipes.uploadLabel": "Datei auswählen (Foto, PDF, …)",
    "recipes.nameLabel": "Name vom Rezept",
    "recipes.nameSample": "zum Beispiel Schokoladentorte",
    "recipes.notesLabel": "Notizen (nicht Pflicht)",
    "recipes.saveButton": "Rezept speichern",
    "recipes.savedHeading": "Deine Rezepte",
    "recipes.empty": "Du hast noch kein Rezept gespeichert.",
    "recipes.delete": "Löschen",
    "recipes.open": "Öffnen",
    "recipes.savedAt": "Gespeichert am",
    "recipes.savedOk": "Rezept gespeichert.",
    "recipes.needFileOrName": "Bitte trage einen Namen ein oder wähle eine Datei aus.",
    "footer.storageNote": "Deine Rezepte bleiben nur auf diesem Handy. Keine Cloud, keine Kosten."
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
    "ingredients.defaultSource": "Орієнтовна ціна",
    "ingredients.enterManually": "ввести вручну",
    "ingredients.samples": "точок даних",
    "ingredients.total": "Загальна вартість",
    "ingredients.disclaimer": "Джерело цін: Open Food Facts – Open Prices (безкоштовні ціни з Німеччини, надані спільнотою), автоматично оновлюється щодня. Там, де ще немає живих даних, показуємо досліджену орієнтовну ціну (аналіз цін Aldi/Lidl, дата вказана) замість «Ціну не знайдено». Жодні ціни не вигадуються — ви можете будь-коли змінити значення вручну.",
    "ingredients.newNamePlaceholder": "Новий інгредієнт, напр. Малина",
    "ingredients.addButton": "+ Додати інгредієнт",
    "ingredients.customBadge": "власний інгредієнт",
    "ingredients.searchPrice": "Шукати ціну",
    "ingredients.searching": "Пошук триває…",
    "ingredients.liveSource": "Живий пошук",
    "ingredients.deleteIngredient": "Видалити",
    "ingredients.noProxyConfigured": "Proxy-URL не налаштовано (див. налаштування нижче).",
    "ingredients.liveNotFound": "Живий пошук: ціну не знайдено.",
    "ingredients.liveError": "Живий пошук не вдався.",
    "ingredients.priceWarning": "Перевірте ціну! Вона сильно відрізняється від орієнтовної.",
    "settings.title": "Налаштування: живий пошук цін для власних інгредієнтів",
    "settings.proxyHelp": "Необов'язково: вкажіть Proxy-URL, щоб «Шукати ціну» працювало для доданих вами інгредієнтів. Інструкція: cloudflare-worker/README.md у проєкті.",
    "settings.proxyPlaceholder": "https://your-worker.workers.dev",
    "settings.save": "Зберегти",
    "settings.saved": "Збережено.",
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
