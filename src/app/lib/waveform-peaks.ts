/** Keep the loudest sample in each bin; bound preview work and cache size. */
export function compactWaveformPeaks(input: unknown, limit = 1200): number[] | null {
  const values = Array.isArray(input) ? input : input && typeof input === 'object' && 'peaks' in input ? (input as { peaks: unknown }).peaks : null;
  if (!Array.isArray(values) || !values.length || !values.every(value => typeof value === 'number' && Number.isFinite(value))) return null;
  const length = Math.min(values.length, Math.max(1, Math.floor(limit)));
  const result = new Array<number>(length);
  for (let index = 0; index < length; index++) {
    const from = Math.floor(index * values.length / length), to = Math.floor((index + 1) * values.length / length);
    let amplitude = 0;
    for (let sample = from; sample < to; sample++) amplitude = Math.max(amplitude, Math.abs(values[sample]));
    result[index] = Math.round(amplitude * 10000) / 10000;
  }
  return result;
}

export function compactWaveformUrl(source: string): string {
  try {
    const url = new URL(source);
    if (url.hostname !== 'originsradio-media.sinacetin.workers.dev' || !url.pathname.startsWith('/waveforms/') || url.pathname.startsWith('/waveforms/compact-v1/')) return source;
    url.pathname = url.pathname.replace('/waveforms/', '/waveforms/compact-v1/');
    return url.href;
  } catch { return source; }
}
