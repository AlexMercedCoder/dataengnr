// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://dataengnr.com',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
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
