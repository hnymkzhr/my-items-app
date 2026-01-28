// データの保存・取得専門
// LocalStorageとのやり取りだけをまとめます。

const STORAGE_KEY = "my_items";
const CATEGORY_KEY = "my_categories";
const GENRE_KEY = "my_genres";

const getItems = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
const saveItems = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

const getCategories = () => JSON.parse(localStorage.getItem(CATEGORY_KEY)) || [];
const saveCategories = (categories) => localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));

const getGenres = () => JSON.parse(localStorage.getItem(GENRE_KEY)) || [];
const saveGenres = (genres) => localStorage.setItem(GENRE_KEY, JSON.stringify(genres));