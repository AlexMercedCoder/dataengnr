// /llms.txt: generated from the content collection so it never drifts from the
// site. Follows the llmstxt.org shape: H1, blockquote summary, then link
// sections of `- [name](url): description`.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://dataengnr.com';

export const GET: APIRoute = async () => {
  const terms = await getCollection('terms');
  terms.sort((a: any, b: any) => a.data.title.localeCompare(b.data.title));

  const termLines = terms
    .map((t: any) => `- [${t.data.title}](${SITE}/terms/${t.id}/): ${t.data.description}`)
    .join('\n');

  const body = `# DataEngr.com

> A data engineering knowledge base: ${terms.length} terms covering pipelines, storage, modeling,
> orchestration, governance, and the lakehouse and AI architectures they connect to. Each entry
> opens with a one-paragraph definition and then explains how the idea works in practice.

Written and maintained by Alex Merced, Open Lakehouse & AI Advocate, Author and Technologist, and
co-author of "Apache Iceberg: The Definitive Guide". Content is free to read and free to cite;
attribution to dataengnr.com is appreciated.

## Main pages

- [Home](${SITE}/): starting points, common questions, and curated reading.
- [Knowledge Base](${SITE}/terms/): every term, A to Z.
- [Video explainers](${SITE}/videos): eight short silent animated explainers on core topics.
- [Blogroll](${SITE}/blogroll/): recent articles aggregated from datalakehousehub.com.
- [Books](${SITE}/books/): books by Alex Merced on Iceberg, lakehouse architecture and AI.
- [Search](${SITE}/search/): full-text search across the site.

## Knowledge base terms

${termLines}

## Related sites

- [Alex Merced](https://whoisalexmerced.com): author biography and background.
- [Data Lakehouse Hub](https://datalakehousehub.com): longer-form articles and a blog aggregator.
- [Books by Alex Merced](https://books.alexmerced.com): full catalog, including free titles.

## Events

- [Agentic Lakehouse Events](https://luma.com/agenticlakehouse): global meetups and webinars on agentic analytics.
- [Data Lakehouse Hub Events](https://luma.com/DataLakehouseHub): global lakehouse meetups, linkups and webinars.

## Community

- [Data Lakehouse Hub Slack](https://join.slack.com/t/thedatalakehousehub/shared_invite/zt-274yc8sza-mI2zhCW8LGkOh1uxuf8T5Q): practitioner community for lakehouse architecture.
- [Data Events Slack](https://join.slack.com/t/data-events/shared_invite/zt-38vgrooy9-U9ral_gr3NAz_Siih1QwmQ): announcements for data conferences and meetups.
- [Data & Tech Slack](https://join.slack.com/t/datatechcommunity/shared_invite/zt-12xrk4qmd-y~6jUFFd7kdaLhgLURKwoA): broader data and technology community.
- [r/datalakehouseandai](https://www.reddit.com/r/datalakehouseandai/): subreddit for data lakehouse and AI discussion.
- [Data Lakehouse Hub on LinkedIn](https://www.linkedin.com/company/data-lakehouse-hub/): company page for the Data Lakehouse Hub.
- [Alex Merced Tech on YouTube](https://www.youtube.com/@AlexMercedCoder): software development and engineering channel.
- [Alex Merced Data & AI on YouTube](https://www.youtube.com/@alexmerceddata): data lakehouse and AI channel.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
