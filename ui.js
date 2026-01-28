// 画面への描画・HTML生成専門
// render... で始まる関数をここに集めます。

// ジャンルタブの描画
function renderGenreTabs(items) {
  const tabs = document.getElementById("genreTabs");
  tabs.innerHTML = "";
  Object.keys(items).forEach(genre => {
    const totalCount = Object.values(items[genre]).reduce((sum, arr) => sum + arr.length, 0);
    const btn = document.createElement("button");
    btn.textContent = `${genre} (${totalCount})`;
    if (genre === currentGenre) btn.className = "active";
    btn.onclick = () => selectGenre(genre);
    tabs.appendChild(btn);
  });
}

// カテゴリタブの描画
function renderCategoryTabs(items, genre) {
  const tabs = document.getElementById("categoryTabs");
  tabs.innerHTML = "";
  if (!genre || !items[genre]) return;
  Object.keys(items[genre]).forEach(cat => {
    const count = items[genre][cat].length;
    const btn = document.createElement("button");
    btn.textContent = `${cat} (${count})`;
    if (!collapsedCategories.has(cat)) btn.className = "active";
    btn.onclick = () => selectCategory(cat);
    tabs.appendChild(btn);
  });
}

// アイテムリストの表示
function renderList() {
  const list = document.getElementById("itemList");
  if (!list) return;
  list.innerHTML = "";
  if (!currentGenre) return;
  const items = getItems();
  const genreData = items[currentGenre] || {};

  for (const category in genreData) {
    const section = document.createElement("div");
    section.className = "category-section";
    const h3 = document.createElement("h3");
    h3.textContent = (collapsedCategories.has(category) ? "▶ " : "▼ ") + category + ` (${genreData[category].length})`;
    h3.style.cursor = "pointer";
    h3.onclick = () => selectCategory(category);
    section.appendChild(h3);

    if (!collapsedCategories.has(category)) {
      const ul = document.createElement("ul");
      genreData[category].forEach((item, index) => addItemToList(ul, currentGenre, category, item, index));
      section.appendChild(ul);
    }
    list.appendChild(section);
  }
}

// datalistの更新
function renderCategoryList() {
  const list = document.getElementById("categoryList");
  list.innerHTML = "";
  getCategories().forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    list.appendChild(option);
  });
}

function renderGenreList() {
  const list = document.getElementById("genreList");
  list.innerHTML = "";
  getGenres().forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    list.appendChild(option);
  });
}

// li要素の生成
function addItemToList(ul, genre, category, text, index) {
  const li = document.createElement("li");
  const textSpan = document.createElement("span");
  textSpan.textContent = text;
  li.appendChild(textSpan);

  const btnArea = document.createElement("div");
  const editBtn = document.createElement("button");
  editBtn.textContent = "✎";
  editBtn.className = "edit-btn";
  editBtn.onclick = () => editItem(genre, category, index);
  
  const delBtn = document.createElement("button");
  delBtn.textContent = "×";
  delBtn.className = "delete-btn";
  delBtn.onclick = () => deleteItem(genre, category, index);

  btnArea.appendChild(editBtn);
  btnArea.appendChild(delBtn);
  li.appendChild(btnArea);
  ul.appendChild(li);
}