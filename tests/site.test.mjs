import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const docs = join(root, 'docs');
const onlineRepository = process.env.GITHUB_REPOSITORY?.toLowerCase().endsWith('/playtogrow.online') || basename(root).toLowerCase() === 'playtogrow.online';
const slugs = ['about', 'how-it-works', 'for-parents', 'for-children', 'for-psychologists', 'pilot', 'methodology', 'safety', 'contact', 'faq', 'updates'];
const text = path => readFileSync(path, 'utf8');

test('Russian and English knowledge pages have stable canonical pairs', () => {
  for (const slug of slugs) {
    const ruPath = join(docs, slug, 'index.html');
    const enPath = join(docs, 'en', slug, 'index.html');
    assert.equal(existsSync(ruPath), true, `missing Russian page ${slug}`);
    assert.equal(existsSync(enPath), true, `missing English page ${slug}`);
    const ru = text(ruPath);
    const en = text(enPath);
    const ruUrl = `https://playtogrow.ru/${slug}/`;
    const enUrl = `https://playtogrow.online/en/${slug}/`;
    assert.match(ru, /<html lang="ru">/);
    assert.match(en, /<html lang="en">/);
    assert.ok(ru.includes(`<link rel="canonical" href="${ruUrl}">`));
    assert.ok(en.includes(`<link rel="canonical" href="${enUrl}">`));
    for (const markup of [ru, en]) {
      assert.ok(markup.includes(`hreflang="ru" href="${ruUrl}"`));
      assert.ok(markup.includes(`hreflang="en" href="${enUrl}"`));
      assert.match(markup, /<script type="application\/ld\+json">\{.+<\/script>/s);
      assert.match(markup, /meta name="robots" content="index,follow/);
    }
  }
});

test('landing pages contain crawlable content in their initial language', () => {
  const ru = text(join(docs, 'index.html'));
  const en = text(join(docs, 'en', 'index.html'));
  assert.ok(ru.includes('Превращаем интерес к играм в движущую силу развития ребенка'));
  assert.ok(en.includes("Turning an interest in games into a driving force for a child&#x27;s development"));
  assert.ok(ru.includes('<link rel="canonical" href="https://playtogrow.ru/">'));
  assert.ok(en.includes('<link rel="canonical" href="https://playtogrow.online/en/">'));
  assert.ok(ru.includes('href="https://playtogrow.online/en/"'));
  assert.ok(en.includes('href="https://playtogrow.ru/"'));
});

test('public explanations describe visible game progress instead of a time cap', () => {
  const ruLanding = text(join(docs, 'index.html'));
  const enLanding = text(join(docs, 'en', 'index.html'));
  const ruHow = text(join(docs, 'how-it-works', 'index.html'));
  const enHow = text(join(docs, 'en', 'how-it-works', 'index.html'));
  const ruMethod = text(join(docs, 'methodology', 'index.html'));
  assert.ok(ruLanding.includes('Время игры отмечается для понимания контекста, но не используется как жесткий лимит'));
  assert.ok(enLanding.includes('Play time is logged as context, not used as a hard limit'));
  assert.ok(ruHow.includes('Игровой прогресс'));
  assert.ok(enHow.includes('In-game progress'));
  assert.equal(ruHow.includes('дополнительное игровое время'), false);
  assert.equal(enHow.includes('extra game time'), false);
  assert.ok(ruMethod.includes('Нет скрытых штрафов'));
});

test('demo is excluded from indexing without blocking link discovery', () => {
  const demo = text(join(docs, 'demo.html'));
  const robots = text(join(docs, 'robots.txt'));
  const sitemap = text(join(docs, 'sitemap.xml'));
  assert.match(demo, /meta name="robots" content="noindex,follow,noarchive"/);
  assert.equal(robots.includes('Disallow: /demo.html'), false);
  assert.equal(sitemap.includes('demo.html'), false);
});

test('crawler policy separates search retrieval from model development', () => {
  const robots = text(join(docs, 'robots.txt'));
  for (const agent of ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User']) {
    assert.ok(robots.includes(`User-agent: ${agent}\nAllow: /`), `${agent} must be allowed`);
  }
  for (const agent of ['GPTBot', 'ClaudeBot', 'Google-Extended']) {
    assert.ok(robots.includes(`User-agent: ${agent}\nDisallow: /`), `${agent} must be disallowed`);
  }
});

test('sitemap and machine-readable guides list canonical public pages', () => {
  const sitemap = text(join(docs, 'sitemap.xml'));
  const llms = text(join(docs, 'llms.txt'));
  const base = onlineRepository ? 'https://playtogrow.online/en' : 'https://playtogrow.ru';
  assert.ok(sitemap.includes(`<loc>${base}/</loc>`));
  for (const slug of slugs) assert.ok(sitemap.includes(`<loc>${base}/${slug}/</loc>`));
  assert.ok(llms.includes('https://playtogrow.online/en/'));
  assert.ok(llms.includes('not a diagnostic or medical service'));
});

test('FAQ structured data matches all visible questions', () => {
  for (const languagePath of [join(docs, 'faq', 'index.html'), join(docs, 'en', 'faq', 'index.html')]) {
    const markup = text(languagePath);
    const visibleQuestions = [...markup.matchAll(/<section class="faq-item"><h2>(.*?)<\/h2>/g)].map(match => match[1]);
    const block = markup.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
    assert.ok(block);
    const schema = JSON.parse(block);
    assert.equal(schema['@type'], 'FAQPage');
    assert.deepEqual(schema.mainEntity.map(item => item.name), visibleQuestions);
  }
});
