"use strict";
/* =========================
 * КРОК 1. Типи товарів
 * ========================= */
Object.defineProperty(exports, "__esModule", { value: true });
exports.books = exports.clothing = exports.electronics = exports.calculateTotal = exports.addToCart = exports.filterByPrice = exports.findProduct = void 0;
exports.isValidPrice = isValidPrice;
exports.isValidProduct = isValidProduct;
/* =========================
 * Утиліти типів та перевірок
 * ========================= */
/** Перевірка коректності ціни */
function isValidPrice(price) {
    return Number.isFinite(price) && price >= 0;
}
/** Узагальнена перевірка товару (базова) */
function isValidProduct(p) {
    return !!p && typeof p.id === "number" && typeof p.name === "string" && isValidPrice(p.price);
}
/* =========================
 * КРОК 2. Пошук і фільтрація
 * ========================= */
/**
 * Пошук товару за id у масиві будь-якого типу T, який розширює BaseProduct.
 * @param products Масив товарів
 * @param id Ідентифікатор
 * @returns Знайдений товар або undefined
 */
const findProduct = (products, id) => {
    if (!Array.isArray(products))
        return undefined;
    return products.find((p) => p.id === id);
};
exports.findProduct = findProduct;
/**
 * Фільтрація за максимальною ціною (включно).
 * @param products Масив товарів
 * @param maxPrice Максимальна ціна (>= 0)
 * @returns Новий масив товарів з ціною <= maxPrice
 */
const filterByPrice = (products, maxPrice) => {
    if (!Array.isArray(products) || !isValidPrice(maxPrice))
        return [];
    return products.filter((p) => isValidPrice(p.price) && p.price <= maxPrice);
};
exports.filterByPrice = filterByPrice;
/**
 * Додати товар у кошик. Якщо товар уже є — збільшити кількість.
 * Повертає новий масив (іммутабельність).
 */
const addToCart = (cart, product, quantity) => {
    if (!Array.isArray(cart))
        cart = [];
    if (!isValidProduct(product))
        return cart; // ігноруємо невалідний товар
    if (!Number.isFinite(quantity) || quantity <= 0)
        return cart;
    const idx = cart.findIndex((ci) => ci.product.id === product.id);
    if (idx === -1) {
        return [...cart, { product, quantity }];
    }
    // merge
    const updated = cart.slice();
    updated[idx] = { product: cart[idx].product, quantity: cart[idx].quantity + quantity };
    return updated;
};
exports.addToCart = addToCart;
/**
 * Підрахунок загальної вартості кошика.
 * Повертає суму у тих самих грошових одиницях, що й product.price.
 */
const calculateTotal = (cart) => {
    if (!Array.isArray(cart))
        return 0;
    return cart.reduce((sum, item) => {
        const q = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 0;
        const price = isValidPrice(item.product.price) ? item.product.price : 0;
        return sum + price * q;
    }, 0);
};
exports.calculateTotal = calculateTotal;
/* =========================
 * КРОК 4. Тестові дані та приклади
 * ========================= */
// Приклад даних (ціни у копійках/центах, для точності):
exports.electronics = [
    {
        id: 1,
        name: "Смартфон Nova X",
        price: 259990, // 2599.90
        inStock: true,
        brand: "Futura",
        description: "6.5\" OLED, 128GB",
        category: "electronics",
        warrantyMonths: 24,
        powerWatts: 20
    },
    {
        id: 2,
        name: "Навушники AirBeat",
        price: 49990, // 499.90
        inStock: true,
        brand: "Sonic",
        category: "electronics",
        warrantyMonths: 12
    }
];
exports.clothing = [
    {
        id: 10,
        name: "Футболка Basic",
        price: 8990, // 89.90
        inStock: true,
        category: "clothing",
        size: "M",
        material: "Cotton",
        brand: "WearIt"
    },
    {
        id: 11,
        name: "Кросівки Runner Pro",
        price: 199990, // 1999.90
        inStock: false,
        category: "clothing",
        size: "L",
        material: "Mesh",
        brand: "StepUp"
    }
];
exports.books = [
    {
        id: 20,
        name: "Clean TypeScript",
        price: 74990, // 749.90
        inStock: true,
        category: "book",
        author: "A. Dev",
        pages: 380,
        isbn: "978-1-23456-789-7"
    }
];
/* ===== Демонстрація використання (можна видалити у проді) ===== */
// 1) Пошук
const phone = (0, exports.findProduct)(exports.electronics, 1); // Electronics | undefined
const tee = (0, exports.findProduct)(exports.clothing, 10); // Clothing | undefined
const novel = (0, exports.findProduct)(exports.books, 20); // Book | undefined
// 2) Фільтр за ціною
const under100k = (0, exports.filterByPrice)(exports.electronics, 100000);
// 3) Кошик
let cart = [];
cart = (0, exports.addToCart)(cart, phone, 1);
cart = (0, exports.addToCart)(cart, tee, 2);
cart = (0, exports.addToCart)(cart, novel, 1);
// Додавання того самого товару ще раз збільшить кількість:
cart = (0, exports.addToCart)(cart, phone, 1);
// 4) Сума
const total = (0, exports.calculateTotal)(cart);
// Для наочності вивід у консоль (прибери, якщо не треба):
/* eslint-disable no-console */
console.log("Знайдений телефон:", phone);
console.log("Електроніка до 1000.00:", under100k);
console.log("Кошик:", cart);
console.log("Сума (у копійках/оцінках):", total, "  (~", (total / 100).toFixed(2), "за умови, що price у копійках)");
/* eslint-enable no-console */
