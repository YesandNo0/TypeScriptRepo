import { setupModal } from "./modules/modal.js";
import { setupScrollToTop, setupRevealOnScroll } from "./modules/scroll.js";
import { setupPostsLoader } from "./modules/fetchPosts.js";
// ініціалізація після побудови DOM
window.addEventListener("DOMContentLoaded", () => {
    setupModal({
        modal: "#modal",
        openBtn: "#openModalBtn",
        closeBtn: "#closeModalBtn"
    });
    setupScrollToTop("#toTop", 250);
    setupRevealOnScroll(".box", 80);
    setupPostsLoader({
        apiUrl: "https://jsonplaceholder.typicode.com/posts?_limit=5",
        button: "#loadPostsBtn",
        list: "#postsList"
    });
});
