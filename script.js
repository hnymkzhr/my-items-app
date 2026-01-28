// 変数の管理

let currentGenre = null;
let currentCategory = null;
let collapsedCategories = new Set();

// 初期表示
function loadItems() {
  renderCategoryList();
  renderGenreList();
  const items = getItems();
  const genres = Object.keys(items);
  if (genres.length > 0) {
    selectGenre(genres[0]);
  } else {
    renderGenreTabs(items);
  }
}

// アイテムの追加
function addItem() {
  const genre = document.getElementById("genreInput").value.trim();
  const category = document.getElementById("categoryInput").value.trim();
  const text = document.getElementById("itemInput").value.trim();
  if (!genre || !category || !text) return;

  const genres = getGenres();
  if (!genres.includes(genre)) { genres.push(genre); saveGenres(genres); renderGenreList(); }
  const categories = getCategories();
  if (!categories.includes(category)) { categories.push(category); saveCategories(categories); renderCategoryList(); }

  const items = getItems();
  if (!items[genre]) items[genre] = {};
  if (!items[genre][category]) items[genre][category] = [];
  items[genre][category].push(text);
  saveItems(items);

  currentGenre = genre;
  currentCategory = category;
  
  const updatedItems = getItems();
  renderGenreTabs(updatedItems);
  renderCategoryTabs(updatedItems, genre);
  renderList();
  document.getElementById("itemInput").value = "";
}

// アイテムの編集
function editItem(genre, category, index) {
  const items = getItems();
  const oldText = items[genre][category][index];
  const newText = prompt("アイテム名を編集:", oldText);
  if (newText === null || newText.trim() === "") return;

  items[genre][category][index] = newText.trim();
  saveItems(items);
  renderList();
}

// アイテムの削除
function deleteItem(genre, category, index) {

  // 確認ダイアログを表示
  if (!confirm("このアイテムを削除してもよろしいですか？")) {
    return; // キャンセルなら何もしない
  }

  const items = getItems();
  const genres = getGenres();
  const categories = getCategories();

  items[genre][category].splice(index, 1);

  if (items[genre][category].length === 0) {
    delete items[genre][category];
    const isCategoryStillUsed = Object.values(items).some(catMap => category in catMap);
    if (!isCategoryStillUsed) {
      const cIdx = categories.indexOf(category);
      if (cIdx !== -1) { categories.splice(cIdx, 1); saveCategories(categories); renderCategoryList(); }
    }
  }

  if (Object.keys(items[genre]).length === 0) {
    delete items[genre];
    if (currentGenre === genre) currentGenre = null;
    const gIdx = genres.indexOf(genre);
    if (gIdx !== -1) { genres.splice(gIdx, 1); saveGenres(genres); renderGenreList(); }
  }

  saveItems(items);
  const updatedItems = getItems();
  renderGenreTabs(updatedItems);
  renderCategoryTabs(updatedItems, currentGenre);
  renderList();
}

// 【新規】全データ削除機能
function clearAllData() {
  if (confirm("【警告】すべてのデータが消去されます。元に戻せませんがよろしいですか？")) {
    localStorage.clear(); // ストレージを空にする
    
    // 変数もリセット
    currentGenre = null;
    currentCategory = null;
    collapsedCategories.clear();
    
    // 画面を再読み込み（初期状態に戻る）
    location.reload();
  }
}

// ジャンルの選択
function selectGenre(genre) {
  currentGenre = genre;
  collapsedCategories.clear();
  const items = getItems();
  renderGenreTabs(items);
  renderCategoryTabs(items, genre);
  renderList();
}

// カテゴリの選択（折りたたみ）
function selectCategory(category) {
  if (collapsedCategories.has(category)) {
    collapsedCategories.delete(category);
  } else {
    collapsedCategories.add(category);
  }
  const items = getItems();
  renderCategoryTabs(items, currentGenre);
  renderList();
}

// イベント登録
// 全削除ボタンのイベント登録
const clearBtn = document.getElementById("clearAllBtn");

// clickイベントだけでなく、iPhone用の touchend も考慮
const clearAllHandler = (e) => {
  e.preventDefault(); // 重複実行防止
  
  // 標準のダイアログ
  const result = window.confirm("【警告】すべてのデータが消去されます。よろしいですか？");
  
  if (result) {
    // 確実に消去するためにキーを個別に指定して消す
    localStorage.removeItem("my_items");
    localStorage.removeItem("my_categories");
    localStorage.removeItem("my_genres");
    
    // 変数もリセット
    currentGenre = null;
    currentCategory = null;
    collapsedCategories.clear();
    
    // 強制的にトップページへリダイレクト（リロードの代わり）
    window.location.href = window.location.pathname;
  }
};

clearBtn.addEventListener("click", clearAllHandler);

// 実行
loadItems();