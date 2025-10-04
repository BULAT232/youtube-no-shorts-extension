// Быстрые CSS-скрытия
const css = `
  ytd-reel-shelf-renderer,
  ytd-reel-video-renderer,
  ytd-rich-shelf-renderer[is-shorts],
  ytd-mini-guide-entry-renderer a[href^="/shorts"],
  ytd-guide-entry-renderer a[href^="/shorts"],
  a[title="Shorts"],
  a[aria-label="Shorts"] {
    display: none !important;
  }
`;
const style = document.createElement('style');
style.textContent = css;
document.documentElement.appendChild(style);

// Жёсткая зачистка любых узлов с ссылками на /shorts
function removeShortsNodes(root = document) {
    // ссылки и контейнеры
    root.querySelectorAll('a[href*="/shorts"]').forEach((a) => {
        // скрываем саму ссылку
        a.style.display = 'none';
        // и пытаемся скрыть родительские карточки/контейнеры
        let p = a.parentElement;
        for (let i = 0; i < 5 && p; i++) {
            if (p.tagName && /YTD-|RENDERER/i.test(p.tagName)) {
                p.style.display = 'none';
                break;
            }
            p = p.parentElement;
        }
    });

    // известные шортс-компоненты
    [
        'ytd-reel-shelf-renderer',
        'ytd-reel-video-renderer',
        'ytd-rich-shelf-renderer[is-shorts]',
        '#shorts-container'
    ].forEach(sel => {
        root.querySelectorAll(sel).forEach(n => n.remove());
    });
}

// Первичный проход и наблюдатель за мутациями
removeShortsNodes();
const obs = new MutationObserver((muts) => {
    for (const m of muts) {
        if (m.addedNodes && m.addedNodes.length) {
            m.addedNodes.forEach((n) => {
                if (n.nodeType === 1) removeShortsNodes(n);
            });
        }
    }
});
obs.observe(document.documentElement, { childList: true, subtree: true });

// Доп. защита: если кто-то крутит history API (SPA-роутинг YouTube)
window.addEventListener('yt-page-data-updated', () => removeShortsNodes(), true);
window.addEventListener('yt-navigate-finish', () => removeShortsNodes(), true);
