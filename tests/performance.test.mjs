import assert from 'node:assert/strict';
import { test } from 'node:test';
import { homeSections } from '../utils/homeSections.ts';
import { cardCover } from '../utils/cardCover.ts';
import { loadFullFonts } from '../utils/loadFullFonts.ts';

test('home sections preserve order, exclude the lead and deduplicate shared tags', () => {
  const lead = { slug: 'lead', tags: ['系统思维'] };
  const shared = { slug: 'shared', tags: ['系统思维', '决策'] };
  const rest = Array.from({ length: 5 }, (_, i) => ({ slug: `post-${i}`, tags: ['决策'] }));
  const sections = homeSections([lead, shared, ...rest]);
  assert.deepEqual(sections.map((s) => s.section), ['系统思维', '决策', '效率', '思考']);
  assert.deepEqual(sections[0].posts, [shared]);
  assert.deepEqual(sections[1].posts, rest.slice(0, 3));
  assert.deepEqual(homeSections([]).flatMap((s) => s.posts), []);
  assert.deepEqual(homeSections([{ slug: 'unknown', tags: [] }]).flatMap((s) => s.posts), []);
});

test('card covers resize only matching Picsum URLs and preserve parameters', () => {
  assert.equal(cardCover('https://picsum.photos/seed/846/1200/800?x=1'), 'https://picsum.photos/seed/846/600/400?x=1');
  for (const url of ['', 'invalid', 'https://example.com/seed/846/1200/800', 'https://picsum.photos/seed/846/800/1200']) {
    assert.equal(cardCover(url), url);
  }
});

test('full fonts replace the subset once and tolerate missing links', () => {
  let updates = 0;
  const link = {
    dataset: { fullHref: 'https://fonts.example/full' },
    get href() { return updates ? this.dataset.fullHref : 'https://fonts.example/subset'; },
    set href(value) { assert.equal(value, this.dataset.fullHref); updates++; },
  };
  globalThis.document = { querySelector: () => link };
  loadFullFonts();
  loadFullFonts();
  assert.equal(updates, 1);
  globalThis.document = { querySelector: () => null };
  assert.doesNotThrow(loadFullFonts);
  delete globalThis.document;
});
