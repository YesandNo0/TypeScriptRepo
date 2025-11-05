"use strict";
// Прості типи
let isModalOpen = false;
const apiUrl = "https://jsonplaceholder.typicode.com/posts?_limit=5";
// Типи для елементів DOM
const openModalBtn = document.querySelector("#openModalBtn");
const closeModalBtn = document.querySelector("#closeModalBtn");
const modalEl = document.querySelector("#modal");
const loadPostsBtn = document.querySelector("#loadPostsBtn");
const postsList = document.querySelector("#postsList");
const boxEl = document.querySelector(".box");
const toTopLink = document.querySelector("#toTop");
// ---- МОДАЛКА ----
function openModal(_e) {
    if (!modalEl)
        return;
    modalEl.setAttribute("aria-hidden", "false");
    isModalOpen = true;
}
function closeModal(_e) {
    if (!modalEl)
        return;
    modalEl.setAttribute("aria-hidden", "true");
    isModalOpen = false;
}
openModalBtn?.addEventListener("click", openModal);
closeModalBtn?.addEventListener("click", closeModal);
modalEl?.addEventListener("click", function (e) {
    const target = e.target;
    if (target === modalEl)
        closeModal.call(this, e);
});
toTopLink?.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
});
// SCROLL: показати кёнопку "До верху" і анімацію
window.addEventListener("scroll", () => {
    const y = window.scrollY;
    // Показ/приховування кнопки "вгору"
    if (toTopLink) {
        if (y > 250) {
            toTopLink.classList.add("is-visible");
        }
        else {
            toTopLink.classList.remove("is-visible");
        }
    }
    // Анімація блоку
    if (boxEl) {
        const rect = boxEl.getBoundingClientRect();
        const vh = window.innerHeight;
        const visible = rect.top < vh - 80;
        if (visible)
            boxEl.classList.add("is-visible");
    }
});
// FЕTCH ПОСТІВ
async function loadPosts(_e) {
    if (!postsList)
        return;
    postsList.innerHTML = "Завантаження…";
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        postsList.innerHTML = data
            .map((p) => `<li>
            <strong>${escapeHtml(p.title)}</strong>
            <br/>
            <small>#${p.id}</small>
            <p>${escapeHtml(p.body)}</p>
          </li>`)
            .join("");
    }
    catch (err) {
        postsList.innerHTML = "Помилка завантаження 😢";
        console.error(err);
    }
}
// Запуск завантаження по кліку
loadPostsBtn?.addEventListener("click", loadPosts);
// Захист від вставки HTML → XSS
function escapeHtml(s) {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
