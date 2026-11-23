export function loadFullFonts() {
  const link = document.querySelector<HTMLLinkElement>('#site-fonts');
  if (link?.dataset.fullHref && link.href !== link.dataset.fullHref) {
    link.href = link.dataset.fullHref;
  }
}
