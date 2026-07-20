// Speichert Rezepte (Name, Notizen, hochgeladene Datei) lokal im Browser über
// IndexedDB. Keine Cloud, kein Server, keine Kosten. Funktioniert offline.
const RECIPES_DB_NAME = "pastaci_db";
const RECIPES_DB_VERSION = 1;
const RECIPES_STORE = "recipes";

function openRecipesDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(RECIPES_DB_NAME, RECIPES_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECIPES_STORE)) {
        db.createObjectStore(RECIPES_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveRecipe({ name, notes, file }) {
  const db = await openRecipesDb();
  const record = {
    name: name || "",
    notes: notes || "",
    fileBlob: file || null,
    fileName: file ? file.name : null,
    fileType: file ? file.type : null,
    createdAt: new Date().toISOString()
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECIPES_STORE, "readwrite");
    tx.objectStore(RECIPES_STORE).add(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllRecipes() {
  const db = await openRecipesDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECIPES_STORE, "readonly");
    const request = tx.objectStore(RECIPES_STORE).getAll();
    request.onsuccess = () => {
      const rows = request.result || [];
      rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(rows);
    };
    request.onerror = () => reject(request.error);
  });
}

async function deleteRecipe(id) {
  const db = await openRecipesDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECIPES_STORE, "readwrite");
    tx.objectStore(RECIPES_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
