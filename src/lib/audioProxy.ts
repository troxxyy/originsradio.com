export function buildProxiedUrl(rawUrl: string): string {
  const base = import.meta.env.VITE_AUDIO_PROXY_ORIGIN as string | undefined;
  if (!base) return rawUrl;

  const separator = base.endsWith("?") || base.includes("?") ? "" : "?";
  return `${base}${separator}url=${encodeURIComponent(rawUrl)}`;
}


