import { useEffect } from 'react';

const SITE = 'https://www.maodian.uk';
const DEFAULT_TITLE = '锚点 · Anchor';
const DEFAULT_DESC = '用系统对抗混乱，用逻辑重塑日常。';
const DEFAULT_IMG = `${SITE}/icons/icon-512.png`;

interface MetaOptions {
  title?: string;
  description?: string;
  image?: string;
  slug?: string;
  type?: 'website' | 'article';
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export function useDocumentMeta({ title, description, image, slug, type = 'website' }: MetaOptions) {
  useEffect(() => {
    const t = title ? `${title} · 锚点` : DEFAULT_TITLE;
    const d = description ?? DEFAULT_DESC;
    const img = image ?? DEFAULT_IMG;
    const url = slug ? `${SITE}/post/${slug}` : SITE;

    document.title = t;
    setMeta('name', 'description', d);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', t);
    setMeta('property', 'og:description', d);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', t);
    setMeta('name', 'twitter:description', d);
    setMeta('name', 'twitter:image', img);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('property', 'og:type', 'website');
      setMeta('property', 'og:title', DEFAULT_TITLE);
      setMeta('property', 'og:description', DEFAULT_DESC);
      setMeta('property', 'og:image', DEFAULT_IMG);
      setMeta('property', 'og:url', SITE);
      setMeta('name', 'twitter:title', DEFAULT_TITLE);
      setMeta('name', 'twitter:description', DEFAULT_DESC);
      setMeta('name', 'twitter:image', DEFAULT_IMG);
      setMeta('name', 'twitter:card', 'summary_large_image');
    };
  }, [title, description, image, slug, type]);
}
