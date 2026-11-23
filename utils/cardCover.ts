export function cardCover(cover: string): string {
  return cover.replace(/^(https:\/\/picsum\.photos\/seed\/[^/]+)\/1200\/800(?=[?#]|$)/, '$1/600/400');
}
