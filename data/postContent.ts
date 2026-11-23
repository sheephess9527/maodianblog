const contentLoaders = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

export async function loadPostContent(slug: string): Promise<string> {
  const load = contentLoaders[`../content/posts/${slug}.md`];
  if (!load) return '';
  const raw = await load();
  const m = /^---[\s\S]*?\n---\r?\n?([\s\S]*)$/.exec(raw);
  return m ? m[1].trim() : raw;
}
