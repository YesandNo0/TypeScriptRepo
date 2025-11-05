export type ModalSelectors = {
    modal: string;          // #modal
    openBtn: string;        // #openModalBtn
    closeBtn: string;       // #closeModalBtn
};

export function setupModal(selectors: ModalSelectors): void {
    const modalEl = document.querySelector<HTMLElement>(selectors.modal);
    const openBtn = document.querySelector<HTMLButtonElement>(selectors.openBtn);
    const closeBtn = document.querySelector<HTMLButtonElement>(selectors.closeBtn);

    if (!modalEl) return;

    const openModal = (_e: MouseEvent): void => {
        modalEl.setAttribute("aria-hidden", "false");
    };

    const closeModal = (_e?: MouseEvent): void => {
        modalEl.setAttribute("aria-hidden", "true");
    };

    openBtn?.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);

    // клік по підложці
    modalEl.addEventListener("click", (e: MouseEvent): void => {
        if (e.target === modalEl) closeModal();
    });
}
