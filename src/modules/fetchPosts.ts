import type { Post } from "../types/post.js";
import { escapeHtml } from "../utils/escapeHtml.js";

export type FetchOptions = {
    apiUrl: string;
    button: string;      // селектор кнопки
    list: string;        // селектор UL
};

export function setupPostsLoader(opts: FetchOptions): void {
    const btn = document.querySelector<HTMLButtonElement>(opts.button);
    const list = document.querySelector<HTMLUListElement>(opts.list);
    if (!btn || !list) return;

    const loadPosts = async (_e?: MouseEvent): Promise<void> => {
        list.innerHTML = "Завантаження…";
        try {
            const res: Response = await fetch(opts.apiUrl);
            const data: Post[] = await res.json();
            list.innerHTML = data.map(renderItem).join("");
        } catch (err: unknown) {
            list.innerHTML = "Помилка завантаження 😢";
            console.error(err);
        }
    };

    btn.addEventListener("click", loadPosts);
}

function renderItem(p: Post): string {
    return `<li>
    <strong>${escapeHtml(p.title)}</strong><br/>
    <small>#${p.id}</small>
    <p>${escapeHtml(p.body)}</p>
  </li>`;
}
