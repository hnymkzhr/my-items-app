const STORAGE_KEY = "my_items";

// データ取得
function getItems() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

// 保存
function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// 初期表示
function loadItems() {
  renderList();
}

// 追加
function addItem() {
  const categoryInput = document.getElementById("categoryInput");
  const itemInput = document.getElementById("itemInput");

  const category = categoryInput.value;
  const text = itemInput.value;
  if (category === "" || text === "") return;

  const items = getItems();

  if (!items[category]) {
    items[category] = [];
  }

  items[category].push(text);
  saveItems(items);

  renderList();
  itemInput.value = "";
}

// 表示
function renderList() {
  const list = document.getElementById("itemList");
  list.innerHTML = "";

  const items = getItems();

  for (const category in items) {
    const h3 = document.createElement("h3");
    h3.textContent = category;
    list.appendChild(h3);

    const ul = document.createElement("ul");

    items[category].forEach((item, index) => {
      addItemToList(ul, category, item, index);
    });

    list.appendChild(ul);
  }
}

// li生成
function addItemToList(ul, category, text, index) {
  const li = document.createElement("li");
  li.textContent = text + " ";

  const btn = document.createElement("button");
  btn.textContent = "×";
  btn.className = "delete-btn";
  btn.onclick = () => deleteItem(category, index);

  li.appendChild(btn);
  ul.appendChild(li);
}

// 削除
function deleteItem(category, index) {
  const items = getItems();

  items[category].splice(index, 1);
  if (items[category].length === 0) {
    delete items[category];
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


