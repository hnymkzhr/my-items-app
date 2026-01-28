const STORAGE_KEY = "my_items";
const CATEGORY_KEY = "my_categories"; // ← これを追加
const GENRE_KEY = "my_genres"; // ★追加

// 現在の選択状態を管理
let currentGenre = null;
let currentCategory = null;

// 閉じているカテゴリを管理するセット
let collapsedCategories = new Set();

// 初期表示の修正
function loadItems() {
  renderCategoryList(); 
  renderGenreList();
  
  const items = getItems();
  const genres = Object.keys(items);
  
  if (genres.length > 0) {
    // 最初のジャンルを選択（中身の自動選択は selectGenre 内で行われる）
    selectGenre(genres[0]);
  } else {
    renderGenreTabs(items);
  }
}

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

  // 【追加】追加したアイテムのタブを自動で選択して表示
  currentGenre = genre;
  currentCategory = category;
  
  const updatedItems = getItems();
  renderGenreTabs(updatedItems);
  renderCategoryTabs(updatedItems, genre);
  renderList();

  itemInput.value = "";
}


// リスト表示（ジャンル内全表示 + 折りたたみ対応）
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

    // カテゴリ見出し
    const h3 = document.createElement("h3");
    h3.textContent = (collapsedCategories.has(category) ? "▶ " : "▼ ") + category;
    h3.style.cursor = "pointer";
    h3.onclick = () => selectCategory(category);
    section.appendChild(h3);

    // 折りたたまれていない場合のみアイテムリストを表示
    if (!collapsedCategories.has(category)) {
      const ul = document.createElement("ul");
      genreData[category].forEach((item, index) => {
        addItemToList(ul, currentGenre, category, item, index);
      });
      section.appendChild(ul);
    }

    list.appendChild(section);
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
  
  const textSpan = document.createElement("span");
  textSpan.textContent = text;
  li.appendChild(textSpan);

  const btnArea = document.createElement("div");

  // 編集ボタン
  const editBtn = document.createElement("button");
  editBtn.textContent = "✎";
  editBtn.className = "edit-btn";
  editBtn.onclick = () => editItem(genre, category, index);
  btnArea.appendChild(editBtn);
  
  const delBtn = document.createElement("button");
  delBtn.textContent = "×";
  delBtn.className = "delete-btn";
  delBtn.onclick = () => deleteItem(genre,category, index);
  btnArea.appendChild(delBtn);

  li.appendChild(btnArea);
  ul.appendChild(li);
}

// 編集処理
function editItem(genre, category, index) {
  const items = getItems();
  const oldText = items[genre][category][index];
  
  // 入力ダイアログを表示
  const newText = prompt("アイテム名を編集:", oldText);

  // キャンセルされた場合や空文字の場合は何もしない
  if (newText === null || newText.trim() === "") return;

  // データを上書きして保存
  items[genre][category][index] = newText.trim();
  saveItems(items);
  
  // 画面を更新
  renderList();
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
    if (currentCategory === category) currentCategory = null;
  }

  if (Object.keys(items[genre]).length === 0) {
    delete items[genre];
    // ...（ジャンルリストからの削除ロジック）
    if (currentGenre === genre) currentGenre = null;
    // 他のジャンルでこのカテゴリが使われていなければ候補リストから消す
    const isCategoryStillUsed = Object.values(items).some(catMap => category in catMap);
    if (!isCategoryStillUsed) {
      const cIdx = categories.indexOf(category);
      if (cIdx !== -1) {
        categories.splice(cIdx, 1);
        saveCategories(categories);
        renderCategoryList();
      }
    }
  }

  // 3. ジャンル内が空になった場合の処理
  if (Object.keys(items[genre]).length === 0) {
    delete items[genre];
    if (currentGenre === genre) currentGenre = null;

    const gIdx = genres.indexOf(genre);
    if (gIdx !== -1) {
      genres.splice(gIdx, 1);
      saveGenres(genres);
      renderGenreList();
    }
  }

  saveItems(items);

  // 4. 最新のデータで各UIを再描画
  const updatedItems = getItems();
  renderGenreTabs(updatedItems);
  renderCategoryTabs(updatedItems, currentGenre);
  renderList();
}

// ジャンルを選択した時の処理（そのジャンルをすべて表示）
function selectGenre(genre) {
  currentGenre = genre;
  collapsedCategories.clear(); // ジャンル移動時は一旦すべて開く
  const items = getItems();
  
  renderGenreTabs(items);
  renderCategoryTabs(items, genre);
  renderList(); 
}

// カテゴリをクリックした時の処理（表示・非表示の切り替え）
function selectCategory(category) {
  if (collapsedCategories.has(category)) {
    collapsedCategories.delete(category); // 開く
  } else {
    collapsedCategories.add(category);    // 閉じる
  }
  const items = getItems();
  renderCategoryTabs(items, currentGenre);
  renderList();
}

// ジャンルタブの描画（件数表示付き）
function renderGenreTabs(items) {
  const tabs = document.getElementById("genreTabs");
  tabs.innerHTML = "";

  Object.keys(items).forEach(genre => {
    // ジャンル内の全アイテム数を合計
    const totalCount = Object.values(items[genre]).reduce((sum, arr) => sum + arr.length, 0);

    const btn = document.createElement("button");
    btn.textContent = `${genre} (${totalCount})`; // 名前と件数を表示
    if (genre === currentGenre) btn.className = "active";
    btn.onclick = () => selectGenre(genre);
    tabs.appendChild(btn);
  });
}

// カテゴリタブの描画（件数表示付き）
function renderCategoryTabs(items, genre) {
  const tabs = document.getElementById("categoryTabs");
  tabs.innerHTML = "";
  if (!genre || !items[genre]) return;

  Object.keys(items[genre]).forEach(cat => {
    const count = items[genre][cat].length; // カテゴリ内のアイテム数

    const btn = document.createElement("button");
    btn.textContent = `${cat} (${count})`; // 名前と件数を表示
    
    // 折りたたみ状態（collapsedCategories）に合わせて active クラスを制御
    if (!collapsedCategories.has(cat)) {
      btn.className = "active";
    }
    
    btn.onclick = () => selectCategory(cat);
    tabs.appendChild(btn);
  });
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


