export function setupScrollToTop(linkSelector: string, threshold: number = 250): void {
    const link = document.querySelector<HTMLAnchorElement>(linkSelector);
    if (!link) return;

    const onScroll = (): void => {
        const y: number = window.scrollY;
        if (y > threshold) link.classList.add("is-visible");
        else link.classList.remove("is-visible");
    };

    window.addEventListener("scroll", onScroll);
    onScroll(); // початковий стан

    link.addEventListener("click", (e: MouseEvent): void => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

export function setupRevealOnScroll(boxSelector: string, offset: number = 80): void {
    const box = document.querySelector<HTMLElement>(boxSelector);
    if (!box) return;

    const onScroll = (): void => {
        const rect: DOMRect = box.getBoundingClientRect();
        const vh: number = window.innerHeight;
        const visible: boolean = rect.top < vh - offset;
        if (visible) box.classList.add("is-visible");
    };

    window.addEventListener("scroll", onScroll);
    onScroll();
}
