// Verbindet UI, Preisdaten und Rezeptspeicher.
const quantities = {};
const currencyFormatter = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

function formatEUR(value) {
  return currencyFormatter.format(value);
}

function displayUnitPrice(ingredient, pricePerUnit) {
  if (ingredient.baseUnit === "piece") {
    return { value: pricePerUnit, suffix: getLang() === "uk" ? "/шт." : "/Stück" };
  }
  const per100 = pricePerUnit * 100;
  const unit = unitLabel(ingredient.baseUnit);
  return { value: per100, suffix: `/100${unit}` };
}

function ingredientName(ingredient) {
  const lang = getLang();
  return ingredient.name[lang] || ingredient.name.de;
}

function renderIngredientsTable() {
  const cache = loadPriceCache();
  const tbody = document.getElementById("ingredients-tbody");
  tbody.innerHTML = "";

  getAllIngredients().forEach((ingredient) => {
    const tr = document.createElement("tr");
    tr.dataset.id = ingredient.id;

    const nameTd = document.createElement("td");
    nameTd.textContent = ingredientName(ingredient);
    tr.appendChild(nameTd);

    const qtyTd = document.createElement("td");
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "0";
    qtyInput.step = "any";
    qtyInput.className = "qty-input";
    qtyInput.value = quantities[ingredient.id] || "";
    qtyInput.addEventListener("input", () => {
      quantities[ingredient.id] = parseFloat(qtyInput.value) || 0;
      updateRowCost(ingredient.id);
      updateTotal();
    });
    qtyTd.appendChild(qtyInput);
    const unitSpan = document.createElement("span");
    unitSpan.className = "unit-label";
    unitSpan.textContent = unitLabel(ingredient.baseUnit);
    qtyTd.appendChild(unitSpan);
    tr.appendChild(qtyTd);

    const priceTd = document.createElement("td");
    priceTd.id = `price-cell-${ingredient.id}`;
    tr.appendChild(priceTd);

    const costTd = document.createElement("td");
    costTd.id = `cost-cell-${ingredient.id}`;
    costTd.textContent = formatEUR(0);
    tr.appendChild(costTd);

    const sourceTd = document.createElement("td");
    sourceTd.id = `source-cell-${ingredient.id}`;
    tr.appendChild(sourceTd);

    tbody.appendChild(tr);
    renderPriceCell(ingredient, cache[ingredient.id]);
    updateRowCost(ingredient.id);
  });

  updateTotal();
}

function renderPriceCell(ingredient, entry) {
  const priceTd = document.getElementById(`price-cell-${ingredient.id}`);
  const sourceTd = document.getElementById(`source-cell-${ingredient.id}`);
  priceTd.innerHTML = "";
  sourceTd.innerHTML = "";

  if (entry && entry.status === "ok" && typeof entry.pricePerUnit === "number") {
    const { value, suffix } = displayUnitPrice(ingredient, entry.pricePerUnit);
    priceTd.textContent = `${formatEUR(value)} ${suffix}`;

    const badge = document.createElement("span");
    if (entry.source === "manual") {
      badge.className = "badge badge-manual";
      badge.textContent = t("ingredients.manual");
    } else if (entry.source === "default") {
      badge.className = "badge badge-default";
      badge.textContent = t("ingredients.defaultSource");
    } else if (entry.source === "live") {
      badge.className = "badge badge-live";
      badge.textContent = t("ingredients.liveSource");
    } else {
      badge.className = "badge badge-ok";
      badge.textContent = t("ingredients.offSource");
    }
    sourceTd.appendChild(badge);

    if ((entry.source === "off" || entry.source === "live") && entry.sampleCount) {
      const small = document.createElement("small");
      small.className = "sample-count";
      small.textContent = ` (${entry.sampleCount} ${t("ingredients.samples")})`;
      sourceTd.appendChild(small);
    } else if (entry.source === "default") {
      const small = document.createElement("small");
      small.className = "sample-count";
      const dateStr = new Date(entry.fetchedAt).toLocaleDateString(getLang() === "uk" ? "uk-UA" : "de-DE");
      small.textContent = ` (${dateStr})`;
      sourceTd.appendChild(small);
    }
  } else {
    priceTd.textContent = t("ingredients.notFound");
    priceTd.classList.add("not-found");
  }

  if (ingredient.custom) {
    const badgeCustom = document.createElement("span");
    badgeCustom.className = "badge badge-custom";
    badgeCustom.textContent = t("ingredients.customBadge");
    sourceTd.appendChild(badgeCustom);

    const searchBtn = document.createElement("button");
    searchBtn.type = "button";
    searchBtn.className = "manual-link";
    searchBtn.textContent = t("ingredients.searchPrice");
    searchBtn.addEventListener("click", () => handleSearchPrice(ingredient, searchBtn));
    sourceTd.appendChild(searchBtn);
  }

  const manualBtn = document.createElement("button");
  manualBtn.type = "button";
  manualBtn.className = "manual-link";
  manualBtn.textContent = t("ingredients.enterManually");
  manualBtn.addEventListener("click", () => promptManualPrice(ingredient));
  sourceTd.appendChild(manualBtn);

  if (ingredient.custom) {
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "manual-link manual-link-delete";
    deleteBtn.textContent = t("ingredients.deleteIngredient");
    deleteBtn.addEventListener("click", () => {
      deleteCustomIngredient(ingredient.id);
      delete quantities[ingredient.id];
      renderIngredientsTable();
    });
    sourceTd.appendChild(deleteBtn);
  }
}

async function handleSearchPrice(ingredient, buttonEl) {
  const statusEl = document.getElementById("update-status");
  const proxy = getProxyUrl();
  if (!proxy) {
    statusEl.className = "update-status status-fail";
    statusEl.textContent = `❌ ${t("ingredients.noProxyConfigured")}`;
    return;
  }

  const originalText = buttonEl.textContent;
  buttonEl.disabled = true;
  buttonEl.textContent = t("ingredients.searching");

  const result = await liveSearchPrice(ingredient);

  if (result.status === "ok" && typeof result.pricePerUnit === "number") {
    const cache = setLivePrice(ingredient.id, result.pricePerUnit, result.sampleCount);
    renderPriceCell(ingredient, cache[ingredient.id]);
    updateRowCost(ingredient.id);
    updateTotal();
    statusEl.className = "update-status status-ok";
    statusEl.textContent = `✅ ${ingredientName(ingredient)}: ${t("ingredients.liveSource")}`;
  } else if (result.status === "not_found") {
    statusEl.className = "update-status status-partial";
    statusEl.textContent = `⚠️ ${ingredientName(ingredient)}: ${t("ingredients.liveNotFound")}`;
  } else {
    statusEl.className = "update-status status-fail";
    statusEl.textContent = `❌ ${ingredientName(ingredient)}: ${t("ingredients.liveError")}`;
  }

  buttonEl.disabled = false;
  buttonEl.textContent = originalText;
}

function promptManualPrice(ingredient) {
  const { suffix } = displayUnitPrice(ingredient, 1);
  const label = ingredient.baseUnit === "piece"
    ? `${t("ingredients.table.pricePerUnit")} ${suffix} (EUR)`
    : `${t("ingredients.table.pricePerUnit")} ${suffix} (EUR)`;
  const input = window.prompt(`${ingredientName(ingredient)} — ${label}`);
  if (input === null) return;
  const parsed = parseFloat(input.replace(",", "."));
  if (isNaN(parsed) || parsed <= 0) return;

  const perBaseUnit = ingredient.baseUnit === "piece" ? parsed : parsed / 100;
  const cache = setManualPrice(ingredient.id, perBaseUnit);
  renderPriceCell(ingredient, cache[ingredient.id]);
  updateRowCost(ingredient.id);
  updateTotal();
}

function updateRowCost(ingredientId) {
  const cache = loadPriceCache();
  const entry = cache[ingredientId];
  const costTd = document.getElementById(`cost-cell-${ingredientId}`);
  const qty = quantities[ingredientId] || 0;
  if (entry && entry.status === "ok" && typeof entry.pricePerUnit === "number") {
    costTd.textContent = formatEUR(qty * entry.pricePerUnit);
  } else {
    costTd.textContent = "–";
  }
}

function updateTotal() {
  const cache = loadPriceCache();
  let total = 0;
  getAllIngredients().forEach((ingredient) => {
    const entry = cache[ingredient.id];
    const qty = quantities[ingredient.id] || 0;
    if (entry && entry.status === "ok" && typeof entry.pricePerUnit === "number") {
      total += qty * entry.pricePerUnit;
    }
  });
  document.getElementById("total-cost").textContent = formatEUR(total);
}

function renderLastUpdated() {
  const el = document.getElementById("last-updated");
  const ts = getLastUpdatedTimestamp();
  if (!ts) {
    el.textContent = t("ingredients.neverUpdated");
    return;
  }
  const date = new Date(ts);
  el.textContent = `${t("ingredients.lastUpdated")}: ${date.toLocaleString(getLang() === "uk" ? "uk-UA" : "de-DE")}`;
}

async function handleUpdatePrices() {
  const btn = document.getElementById("update-prices-btn");
  const statusEl = document.getElementById("update-status");
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = t("ingredients.updating");
  statusEl.className = "update-status";
  statusEl.textContent = t("ingredients.updating");

  try {
    const { okCount, total } = await updateAllPrices((ingredient, entry) => {
      renderPriceCell(ingredient, entry);
      updateRowCost(ingredient.id);
      updateTotal();
    });
    renderIngredientsTable();
    renderLastUpdated();

    if (okCount === total) {
      statusEl.className = "update-status status-ok";
      statusEl.textContent = `✅ ${t("ingredients.status.ok")} (${okCount}/${total})`;
    } else if (okCount > 0) {
      statusEl.className = "update-status status-partial";
      statusEl.textContent = `⚠️ ${t("ingredients.status.partial")} (${okCount}/${total})`;
    } else {
      statusEl.className = "update-status status-fail";
      statusEl.textContent = `❌ ${t("ingredients.status.fail")} (0/${total})`;
    }
  } catch (err) {
    console.error("Preise aktualisieren fehlgeschlagen:", err);
    statusEl.className = "update-status status-fail";
    statusEl.textContent = `❌ ${t("ingredients.status.fail")}`;
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

// ---- Rezepte ----
async function renderRecipeList() {
  const list = document.getElementById("recipe-list");
  list.innerHTML = "";
  const recipes = await getAllRecipes();
  if (recipes.length === 0) {
    const li = document.createElement("li");
    li.className = "recipe-empty";
    li.textContent = t("recipes.empty");
    list.appendChild(li);
    return;
  }
  recipes.forEach((recipe) => {
    const li = document.createElement("li");
    li.className = "recipe-item";

    const info = document.createElement("div");
    info.className = "recipe-info";
    const nameEl = document.createElement("strong");
    nameEl.textContent = recipe.name || "(ohne Namen)";
    info.appendChild(nameEl);

    const meta = document.createElement("div");
    meta.className = "recipe-meta";
    meta.textContent = `${t("recipes.savedAt")}: ${new Date(recipe.createdAt).toLocaleString(getLang() === "uk" ? "uk-UA" : "de-DE")}`;
    info.appendChild(meta);

    if (recipe.notes) {
      const notes = document.createElement("p");
      notes.className = "recipe-notes";
      notes.textContent = recipe.notes;
      info.appendChild(notes);
    }

    if (recipe.fileBlob) {
      const url = URL.createObjectURL(recipe.fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `${t("recipes.open")}: ${recipe.fileName}`;
      link.className = "recipe-file-link";
      info.appendChild(link);
    }

    li.appendChild(info);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = t("recipes.delete");
    deleteBtn.addEventListener("click", async () => {
      await deleteRecipe(recipe.id);
      renderRecipeList();
    });
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

function wireRecipeForm() {
  const form = document.getElementById("recipe-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("recipe-name").value.trim();
    const notes = document.getElementById("recipe-notes").value.trim();
    const fileInput = document.getElementById("recipe-file");
    const file = fileInput.files[0] || null;
    const statusEl = document.getElementById("recipe-status");

    if (!name && !file) {
      statusEl.className = "update-status status-fail";
      statusEl.textContent = t("recipes.needFileOrName");
      return;
    }

    await saveRecipe({ name, notes, file });
    form.reset();
    statusEl.className = "update-status status-ok";
    statusEl.textContent = `✅ ${t("recipes.savedOk")}`;
    renderRecipeList();
  });
}

// ---- Tabs & Sprache ----
function wireTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

function wireLangSwitch() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLang(btn.dataset.lang);
      refreshUiTexts();
    });
  });
}

function refreshUiTexts() {
  applyTranslations();
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === getLang());
  });
  populateUnitSelect();
  renderIngredientsTable();
  renderLastUpdated();
  renderRecipeList();
}

// ---- Neue Zutat hinzufügen ----
function populateUnitSelect() {
  const select = document.getElementById("new-ingredient-unit");
  const current = select.value;
  select.innerHTML = "";
  ["g", "ml", "piece"].forEach((unit) => {
    const option = document.createElement("option");
    option.value = unit;
    option.textContent = unitLabel(unit);
    select.appendChild(option);
  });
  if (current) select.value = current;
}

function wireAddIngredientForm() {
  const form = document.getElementById("add-ingredient-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("new-ingredient-name");
    const unitSelect = document.getElementById("new-ingredient-unit");
    const name = nameInput.value.trim();
    if (!name) return;

    addCustomIngredient(name, unitSelect.value);
    nameInput.value = "";
    renderIngredientsTable();
  });
}

// ---- Einstellungen: Proxy-URL für die Live-Suche ----
function wireProxySettings() {
  const input = document.getElementById("proxy-url-input");
  const saveBtn = document.getElementById("save-proxy-btn");
  const statusEl = document.getElementById("proxy-status");

  input.value = getProxyUrl();
  saveBtn.addEventListener("click", () => {
    setProxyUrl(input.value);
    input.value = getProxyUrl();
    statusEl.className = "update-status status-ok";
    statusEl.textContent = `✅ ${t("settings.saved")}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyTranslations();
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === getLang());
  });
  wireTabs();
  wireLangSwitch();
  wireRecipeForm();
  wireAddIngredientForm();
  wireProxySettings();
  document.getElementById("update-prices-btn").addEventListener("click", handleUpdatePrices);

  ensureDefaultPrices();
  populateUnitSelect();
  renderIngredientsTable();
  renderLastUpdated();
  renderRecipeList();
});
