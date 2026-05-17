# Knowledge Base Writing Process

This document outlines the strict protocol for generating Knowledge Base articles. Read this document before starting any new batch of terms.

## 1. Research Phase
- **Tool**: Use `search_web` and `read_url_content` to gather the latest information.
- **Focus**: Emphasize how the technology relates to Dremio, Apache Iceberg, and modern data architectures. Do not rely on base training data for Dremio-specific implementations.
- **Scope**: Gather enough depth to support a 4,000-word technical deep dive.

## 2. Writing Constraints & Tone
- **No AI-isms**: Avoid cliché phrases (e.g., "In a world of", "Delve into", "Game-changer", "Explore", "Unleash").
- **No Em-Dashes**: Use commas or parentheses instead of em-dashes (-).
- **Voice**: Professional, senior-architect tone. Objective and natural. Explain mechanics over features.
- **Visuals**: Include 1 or 2 generated AI images (saved to `public/images/terms/`) to visualize architectures or workflows. Do NOT use Mermaid diagrams.

## 3. Iterative Generation (4,000 Word Requirement)
Because 4,000 words exceeds typical single-pass generation limits, the article must be written iteratively:
1.  **Outline**: Generate a detailed outline with word count targets per section.
2.  **Drafting**: Write the article section by section, appending to the target markdown file.
3.  **Compilation**: Ensure seamless transitions between sections.

## 4. Audit Phase
- Read through the completed article.
- Search for any accidental em-dashes or forbidden AI phrases.
- Verify the word count is close to 4,000 words.
- Ensure the formatting matches the Astro Content Collection schema.
