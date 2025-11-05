// Прості типи
let isModalOpen: boolean = false;
const apiUrl: string = "https://jsonplaceholder.typicode.com/posts?_limit=5";

// Типи для елементів DOM
const openModalBtn: HTMLButtonElement | null = document.querySelector("#openModalBtn");
const closeModalBtn: HTMLButtonElement | null = document.querySelector("#closeModalBtn");
const modalEl: HTMLElement | null = document.querySelector("#modal");

const loadPostsBtn: HTMLButtonElement | null = document.querySelector("#loadPostsBtn");
const postsList: HTMLUListElement | null = document.querySelector("#postsList");

const boxEl: HTMLElement | null = document.querySelector(".box");
const toTopLink: HTMLAnchorElement | null = document.querySelector("#toTop");

// Тип для даних з API
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

// ---- МОДАЛКА ----
function openModal(this: HTMLButtonElement, _e: MouseEvent): void {
  if (!modalEl) return;
  modalEl.setAttribute("aria-hidden", "false");
  isModalOpen = true;
}

function closeModal(this: HTMLButtonElement, _e: MouseEvent): void {
  if (!modalEl) return;
  modalEl.setAttribute("aria-hidden", "true");
  isModalOpen = false;
}

openModalBtn?.addEventListener("click", openModal);
closeModalBtn?.addEventListener("click", closeModal);

modalEl?.addEventListener("click", function (this: HTMLElement, e: MouseEvent): void {
  const target: HTMLElement = e.target as HTMLElement;
  if (target === modalEl) closeModal.call(this as unknown as HTMLButtonElement, e);
});

toTopLink?.addEventListener("click", (e: MouseEvent): void => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// SCROLL: показати кёнопку "До верху" і анімацію
window.addEventListener("scroll", (): void => {
  const y: number = window.scrollY;

  // Показ/приховування кнопки "вгору"
  if (toTopLink) {
    if (y > 250) {
      toTopLink.classList.add("is-visible");
    } else {
      toTopLink.classList.remove("is-visible");
    }
  }

  // Анімація блоку
  if (boxEl) {
    const rect: DOMRect = boxEl.getBoundingClientRect();
    const vh: number = window.innerHeight;
    const visible: boolean = rect.top < vh - 80;
    if (visible) boxEl.classList.add("is-visible");
  }
});

// FЕTCH ПОСТІВ
async function loadPosts(_e?: MouseEvent): Promise<void> {
  if (!postsList) return;
  postsList.innerHTML = "Завантаження…";

  try {
    const res: Response = await fetch(apiUrl);
    const data: Post[] = await res.json();

    postsList.innerHTML = data
        .map(
            (p: Post): string =>
                `<li>
            <strong>${escapeHtml(p.title)}</strong>
            <br/>
            <small>#${p.id}</small>
            <p>${escapeHtml(p.body)}</p>
          </li>`
        )
        .join("");
  } catch (err: unknown) {
    postsList.innerHTML = "Помилка завантаження 😢";
    console.error(err);
  }
}

// Запуск завантаження по кліку
loadPostsBtn?.addEventListener("click", loadPosts);

// Захист від вставки HTML → XSS
function escapeHtml(s: string): string {
  return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
}
