"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModal = setupModal;
function setupModal(selectors) {
    const modalEl = document.querySelector(selectors.modal);
    const openBtn = document.querySelector(selectors.openBtn);
    const closeBtn = document.querySelector(selectors.closeBtn);
    if (!modalEl)
        return;
    const openModal = (_e) => {
        modalEl.setAttribute("aria-hidden", "false");
    };
    const closeModal = (_e) => {
        modalEl.setAttribute("aria-hidden", "true");
    };
    openBtn?.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);
    // клік по підложці
    modalEl.addEventListener("click", (e) => {
        if (e.target === modalEl)
            closeModal();
    });
}
