export function setupScrollToTop(linkSelector, threshold = 250) {
    const link = document.querySelector(linkSelector);
    if (!link)
        return;
    const onScroll = () => {
        const y = window.scrollY;
        if (y > threshold)
            link.classList.add("is-visible");
        else
            link.classList.remove("is-visible");
    };
    window.addEventListener("scroll", onScroll);
    onScroll(); // початковий стан
    link.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
export function setupRevealOnScroll(boxSelector, offset = 80) {
    const box = document.querySelector(boxSelector);
    if (!box)
        return;
    const onScroll = () => {
        const rect = box.getBoundingClientRect();
        const vh = window.innerHeight;
        const visible = rect.top < vh - offset;
        if (visible)
            box.classList.add("is-visible");
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
}
