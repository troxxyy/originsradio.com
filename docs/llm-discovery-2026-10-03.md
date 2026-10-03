# LLM discovery support

- `/llms.txt` provides a concise bilingual introduction and canonical public sources.
- `/llms-full.txt` contains artist biographies, published article summaries and event descriptions from the same anonymous public content readers used by the site. It revalidates every five minutes. It is a text catalogue, not a complete transcript of all pages or DJ recordings.
- HTTP `Link: </llms.txt>; rel="describedby"` advertises the guide. Both text endpoints return UTF-8 plain text. Supplementary text representations have `noindex, follow`; the canonical HTML sources remain indexable.
- Existing wildcard robots permission remains in place, including private-route exclusions. No AI training or other crawler policy was changed.
- The catalogue omits private routes and unpublished articles, preserves source date wording, and labels archive entries. It makes no claims of current ticket availability or uninterrupted broadcasting.

Validation: `node scripts/audit_llm_discovery.mjs <origin>` checks status, media type, discovery headers, canonical sitemap membership, coverage of public profile/article/event links, private-path exclusions and source HTML access with three synthetic AI-search user agents. Typecheck, focused lint and a production build also verify the implementation.

Synthetic user agents do not verify real provider crawling, published-IP access through the CDN, indexing or citations. `llms.txt` is an optional community proposal, not an inclusion guarantee. Actual discovery should be measured through real crawler requests and source citations when they occur.

References: https://llmstxt.org/ and https://developers.openai.com/api/docs/bots
