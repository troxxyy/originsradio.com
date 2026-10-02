import { isMediaUrl, resolveMediaUrl } from './media-url'

export function buildProxiedUrl(rawUrl: string): string {
  const mediaUrl = resolveMediaUrl(rawUrl)
  if (mediaUrl !== rawUrl || isMediaUrl(rawUrl)) return mediaUrl
  const base = process.env.NEXT_PUBLIC_AUDIO_PROXY_ORIGIN as string | undefined;
  if (!base) return rawUrl;

  const separator = base.endsWith("?") || base.includes("?") ? "" : "?";
  return `${base}${separator}url=${encodeURIComponent(rawUrl)}`;
}

