import { escapeHtml } from "../utils/escapeHtml.js";
export function setupPostsLoader(opts) {
    const btn = document.querySelector(opts.button);
    const list = document.querySelector(opts.list);
    if (!btn || !list)
        return;
    const loadPosts = async (_e) => {
        list.innerHTML = "Завантаження…";
        try {
            const res = await fetch(opts.apiUrl);
            const data = await res.json();
            list.innerHTML = data.map(renderItem).join("");
        }
        catch (err) {
            list.innerHTML = "Помилка завантаження 😢";
            console.error(err);
        }
    };
    btn.addEventListener("click", loadPosts);
}
function renderItem(p) {
    return `<li>
    <strong>${escapeHtml(p.title)}</strong><br/>
    <small>#${p.id}</small>
    <p>${escapeHtml(p.body)}</p>
  </li>`;
}
