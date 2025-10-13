export function buildProxiedUrl(rawUrl: string): string {
  const base = process.env.NEXT_PUBLIC_AUDIO_PROXY_ORIGIN as string | undefined;
  if (!base) return rawUrl;

  const separator = base.endsWith("?") || base.includes("?") ? "" : "?";
  return `${base}${separator}url=${encodeURIComponent(rawUrl)}`;
}


