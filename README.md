# Origins Radio

Origins Radio website: Next.js App Router, React 18, TypeScript, Tailwind CSS and Supabase.

## Local setup

Use Node.js 22 LTS or newer and npm. Install the exact dependency versions in the lockfile:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Fill in your own public Supabase settings in `.env.local` to load artists, events and the radio schedule. Missing settings can show empty states or historical fallback content; they do not provide a working backend.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public canonical origin; defaults to `https://originsradio.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous API key; data access must be restricted by RLS |
| `NEXT_PUBLIC_AUDIO_PROXY_ORIGIN` | Optional Cloudflare audio proxy for CORS/Range support |
| `NEXT_PUBLIC_BASE_PATH` | Optional application subdirectory |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged operations; never use a `NEXT_PUBLIC_` prefix |
| `RESEND_API_KEY` | Server-only email delivery for Open Spectrum applications |

Keep secrets in local environment files or deployment settings. Do not commit credentials. Legacy `VITE_` names are not consumed by this Next.js application.

The existing admin interface and database policies need a separate authorization review; the client-side admin gate is not an authorization boundary. See the maintenance report for observed findings.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

Lint currently has legacy warnings, recorded in the maintenance report. Build performs static generation and reads configured Supabase content. Browser verification should cover the home page, artists, events, radio schedule and mobile navigation.

The tests cover event date classification and anonymous browser identity, including disabled storage. They do not write to the production database.

## Routing and SEO

- Metadata and the sitemap share `src/app/lib/site.ts`.
- `src/app/sitemap.ts` serves `/sitemap.xml`; do not run the legacy `scripts/generate-sitemap.js`, which writes competing static files.
- `/robots.txt` permits framework assets so crawlers can render pages.
- Snow Sessions home lives at `/snow` locally. `src/proxy.ts` rewrites `/` on `snow.originsradio.com` to it. Other Snow pages keep their existing paths.
- Snow domain/DNS setup is managed separately from the local code.

## Audio

The optional Cloudflare Worker lives in `cloudflare/supabase-audio-proxy`. Configure `NEXT_PUBLIC_AUDIO_PROXY_ORIGIN` to wrap audio URLs through it. The website player and the VPS YouTube stream are separate systems.

## Release

Review the diff, complete the checks above, and review database security findings before releasing. Publishing and production database changes require an explicit release decision. No deployment is performed by the maintenance scripts.
