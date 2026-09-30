// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { latestModified } from './src/lib/git-dates.mjs';

// Source files behind each non-term URL, for git-derived <lastmod>.
const PAGE_SOURCES = {
  '/': ['src/pages/index.astro'],
  '/terms/': ['src/pages/terms/index.astro', 'src/content/terms/'],
  '/videos/': ['src/pages/videos.astro', 'src/data/videos.json'],
  '/blogroll/': ['src/pages/blogroll.astro'],
  '/books/': ['src/pages/books.astro', 'src/data/books.json'],
};

// https://astro.build/config
export default defineConfig({
  site: 'https://dataengnr.com',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // /search/ is a utility page (noindex), so it stays out of the sitemap.
      filter: (page) => !/\/search\/?$/.test(new URL(page).pathname),
      // Term pages are the substance of the site; the hubs are how they're found.
      serialize(item) {
        const url = new URL(item.url);
        if (url.pathname === '/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (url.pathname.startsWith('/terms/') && url.pathname !== '/terms/') {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.6;
          item.changefreq = 'weekly';
        }
        const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
        const termSlug = path.match(/^\/terms\/([^/]+)\/$/)?.[1];
        const sources = termSlug ? [`src/content/terms/${termSlug}.md`] : PAGE_SOURCES[path];
        const lastmod = sources && latestModified(sources);
        if (lastmod) item.lastmod = new Date(lastmod).toISOString();
        return item;
      },
    }),
  ],
  markdown: {
    // Term bodies are authored in Markdown, so image and link attributes have to
    // be added here rather than in the template.
    rehypePlugins: [
      () => (tree) => {
        const visit = (node) => {
          if (node.type === 'element') {
            if (node.tagName === 'img') {
              node.properties.loading ??= 'lazy';
              node.properties.decoding ??= 'async';
            }
            if (node.tagName === 'a') {
              const href = String(node.properties?.href ?? '');
              if (/^https?:\/\//.test(href) && !href.includes('dataengnr.com')) {
                node.properties.rel ??= 'noopener noreferrer';
              }
            }
          }
          (node.children ?? []).forEach(visit);
        };
        visit(tree);
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
