# Supabase Audio Proxy (Cloudflare Worker)

Minimal Worker that adds CORS and Range support for Supabase Storage audio.

## Deploy

```
npm install -g wrangler
wrangler login
wrangler publish
```

Deployed URL example:

```
https://supabase-audio-proxy.<your-account>.workers.dev
```

## Usage

Set in frontend env:

```
VITE_AUDIO_PROXY_ORIGIN=https://supabase-audio-proxy.<your-account>.workers.dev/
```

Proxied request format:

```
<worker>/?url=<encoded_supabase_storage_url>
```

The Worker responds with CORS headers and supports Range requests for seeking and analysis.
