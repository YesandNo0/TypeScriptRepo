/* =========================
 * КРОК 1. Типи товарів
 * ========================= */

/** Базовий товар */
export type BaseProduct = {
    id: number;
    name: string;
    price: number; // у копійках або найменшій одиниці валюти (краще для точності)
    inStock: boolean;
    brand?: string;
    description?: string;
};

/** Електроніка */
export type Electronics = BaseProduct & {
    category: "electronics";
    warrantyMonths: number;
    powerWatts?: number;
};

/** Одяг */
export type Clothing = BaseProduct & {
    category: "clothing";
    size: "XS" | "S" | "M" | "L" | "XL";
    material: string;
    gender?: "men" | "women" | "unisex";
};

/** Книга */
export type Book = BaseProduct & {
    category: "book";
    author: string;
    pages: number;
    isbn?: string;
};

/* Узагальнений союз для демо */
export type AnyProduct = Electronics | Clothing | Book;

/* =========================
 * Утиліти типів та перевірок
 * ========================= */

/** Перевірка коректності ціни */
export function isValidPrice(price: number): boolean {
    return Number.isFinite(price) && price >= 0;
}

/** Узагальнена перевірка товару (базова) */
export function isValidProduct<T extends BaseProduct>(p: T | undefined | null): p is T {
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
export const findProduct = <T extends BaseProduct>(products: T[], id: number): T | undefined => {
    if (!Array.isArray(products)) return undefined;
    return products.find((p) => p.id === id);
};

/**
 * Фільтрація за максимальною ціною (включно).
 * @param products Масив товарів
 * @param maxPrice Максимальна ціна (>= 0)
 * @returns Новий масив товарів з ціною <= maxPrice
 */
export const filterByPrice = <T extends BaseProduct>(products: T[], maxPrice: number): T[] => {
    if (!Array.isArray(products) || !isValidPrice(maxPrice)) return [];
    return products.filter((p) => isValidPrice(p.price) && p.price <= maxPrice);
};

/* =========================
 * КРОК 3. Кошик
 * ========================= */

/** Елемент кошика */
export type CartItem<T extends BaseProduct> = {
    product: T;
    quantity: number; // > 0
};

/**
 * Додати товар у кошик. Якщо товар уже є — збільшити кількість.
 * Повертає новий масив (іммутабельність).
 */
export const addToCart = <T extends BaseProduct>(
    cart: CartItem<T>[],
    product: T | undefined,
    quantity: number
): CartItem<T>[] => {
    if (!Array.isArray(cart)) cart = [];
    if (!isValidProduct(product)) return cart; // ігноруємо невалідний товар
    if (!Number.isFinite(quantity) || quantity <= 0) return cart;

    const idx = cart.findIndex((ci) => ci.product.id === product.id);
    if (idx === -1) {
        return [...cart, { product, quantity }];
    }
    // merge
    const updated = cart.slice();
    updated[idx] = { product: cart[idx].product, quantity: cart[idx].quantity + quantity };
    return updated;
};

/**
 * Підрахунок загальної вартості кошика.
 * Повертає суму у тих самих грошових одиницях, що й product.price.
 */
export const calculateTotal = <T extends BaseProduct>(cart: CartItem<T>[]): number => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((sum, item) => {
        const q = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 0;
        const price = isValidPrice(item.product.price) ? item.product.price : 0;
        return sum + price * q;
    }, 0);
};

/* =========================
 * КРОК 4. Тестові дані та приклади
 * ========================= */

// Приклад даних (ціни у копійках/центах, для точності):
export const electronics: Electronics[] = [
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

export const clothing: Clothing[] = [
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

export const books: Book[] = [
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
const phone = findProduct(electronics, 1); // Electronics | undefined
const tee = findProduct(clothing, 10); // Clothing | undefined
const novel = findProduct(books, 20); // Book | undefined

// 2) Фільтр за ціною
const under100k = filterByPrice<Electronics>(electronics, 100000);

// 3) Кошик
let cart: CartItem<AnyProduct>[] = [];
cart = addToCart(cart, phone, 1);
cart = addToCart(cart, tee, 2);
cart = addToCart(cart, novel, 1);

// Додавання того самого товару ще раз збільшить кількість:
cart = addToCart(cart, phone, 1);

// 4) Сума
const total = calculateTotal(cart);

// Для наочності вивід у консоль (прибери, якщо не треба):
/* eslint-disable no-console */
console.log("Знайдений телефон:", phone);
console.log("Електроніка до 1000.00:", under100k);
console.log("Кошик:", cart);
console.log(
    "Сума (у копійках/оцінках):",
    total,
    "  (~",
    (total / 100).toFixed(2),
    "за умови, що price у копійках)"
);
/* eslint-enable no-console */
