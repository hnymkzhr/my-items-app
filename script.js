const STORAGE_KEY = "my_items";
const CATEGORY_KEY = "my_categories"; // ← これを追加
const GENRE_KEY = "my_genres"; // ★追加

// アイテム取得
function getItems() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

// アイテムの保存
function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// カテゴリの取得
function getCategories() {
  const data = localStorage.getItem(CATEGORY_KEY);
  return data ? JSON.parse(data) : [];
}

// カテゴリの保存
function saveCategories(categories) {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

// ジャンルの取得
function getGenres() {
  const data = localStorage.getItem(GENRE_KEY);
  return data ? JSON.parse(data) : [];
}

// ジャンルの保存
function saveGenres(genres) {
  localStorage.setItem(GENRE_KEY, JSON.stringify(genres));
}

// 初期表示
function loadItems() {
  renderCategoryList(); // ← 追加
  renderGenreList(); // ★追加
  renderList();
}

// 追加
function addItem() {
  const genreInput = document.getElementById("genreInput");
  const categoryInput = document.getElementById("categoryInput");
  const itemInput = document.getElementById("itemInput");

  const genre = genreInput.value.trim();
  const category = categoryInput.value.trim();
  const text = itemInput.value.trim();

  if (genre === "" || category === "" || text === "") return;
  
    const genres = getGenres();
  if (!genres.includes(genre)) {
    genres.push(genre);
    saveGenres(genres);
    renderGenreList();
  }

  const categories = getCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    saveCategories(categories);
    renderCategoryList();
  }
  
  const items = getItems();

  if (!items[genre]) {
    items[genre] = {};
  }
  if (!items[genre][category]) {
    items[genre][category] = [];
  }

  items[genre][category].push(text);
  saveItems(items);

  renderList();

  itemInput.value = "";
}

// 表示
function renderList() {
  const list = document.getElementById("itemList");
  list.innerHTML = "";

  const items = getItems();

  for (const genre in items) {
    const h2 = document.createElement("h2");
    h2.textContent = genre;
    list.appendChild(h2);

    for (const category in items[genre]) {
      const h3 = document.createElement("h3");
      h3.textContent = category;
      list.appendChild(h3);

      const ul = document.createElement("ul");

      items[genre][category].forEach((item, index) => {
        addItemToList(ul, genre, category, item, index);
      });

      list.appendChild(ul);
    }
  }
}

// カテゴリ候補を表示
function renderCategoryList() {
  const list = document.getElementById("categoryList");
  list.innerHTML = "";

  const categories = getCategories();

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    list.appendChild(option);
  });
}

// ジャンル候補を表示
function renderGenreList() {
  const list = document.getElementById("genreList");
  list.innerHTML = "";

  const genres = getGenres();

  genres.forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    list.appendChild(option);
  });
}

// li生成
function addItemToList(ul, genre, category, text, index) {
  const li = document.createElement("li");
  li.textContent = text + " ";

  const btn = document.createElement("button");
  btn.textContent = "×";
  btn.className = "delete-btn";
  btn.onclick = () => deleteItem(genre,category, index);

  li.appendChild(btn);
  ul.appendChild(li);
}

// 削除処理
function deleteItem(genre, category, index) {
  const items = getItems();
  const genres = getGenres();
  const categories = getCategories();

  // 1. アイテムを配列から削除
  items[genre][category].splice(index, 1);

  // 2. カテゴリ内が空になった場合の処理
  if (items[genre][category].length === 0) {
    delete items[genre][category];

    // 全体のデータ（items）を走査して、同じカテゴリ名が他の場所に残っていないか確認
    const isCategoryStillUsed = Object.values(items).some(catMap => category in catMap);

    // どこにも使われていなければ、datalist用のカテゴリ一覧から削除
    if (!isCategoryStillUsed) {
      const catIdx = categories.indexOf(category);
      if (catIdx !== -1) {
        categories.splice(catIdx, 1);
        saveCategories(categories);
        renderCategoryList();
      }
    }
  }

  // 3. ジャンル内が空になった場合の処理
  if (Object.keys(items[genre]).length === 0) {
    delete items[genre];

    const genreIdx = genres.indexOf(genre);
    if (genreIdx !== -1) {
      genres.splice(genreIdx, 1);
      saveGenres(genres);
      renderGenreList();
    }
  }

  saveItems(items);
  renderList();
}

// 要素をあらかじめ取得しておく
const addBtn = document.getElementById("addBtn");
const itemInput = document.getElementById("itemInput");
const categoryInput = document.getElementById("categoryInput"); // これも追加

// 初期表示の実行
loadItems();

// クリックイベントの設定
addBtn.addEventListener("click", addItem);

// Enterキーの設定（これで正しく動きます！）
itemInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addItem();
  }
});


