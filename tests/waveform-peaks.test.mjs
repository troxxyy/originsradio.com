import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/app/lib/waveform-peaks.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { compactWaveformPeaks, compactWaveformUrl } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

test('empty and malformed legacy previews are rejected instead of decoding audio', () => {
  for (const input of [null, { peaks: [] }, [NaN], [Infinity], ['0.5'], { peaks: 'invalid' }]) assert.equal(compactWaveformPeaks(input), null)
})
test('compaction keeps narrow transients and signed sample magnitudes', () => {
  const peaks = Array(60000).fill(0)
  peaks[49] = -0.9; peaks[59999] = 0.8
  const result = compactWaveformPeaks({ peaks })
  assert.equal(result.length, 1200)
  assert.equal(result[0], 0.9)
  assert.equal(result.at(-1), 0.8)
  assert.ok(Buffer.byteLength(JSON.stringify(result)) < 10000)
})
test('actual silence remains a valid waveform', () => {
  assert.deepEqual(compactWaveformPeaks({ peaks: [0, 0, 0] }), [0, 0, 0])
})
test('compact delivery preserves encoded names and avoids unrelated hosts', () => {
  const base = 'https://originsradio-media.sinacetin.workers.dev'
  assert.equal(compactWaveformUrl(`${base}/waveforms/My%20set.json`), `${base}/waveforms/compact-v1/My%20set.json`)
  assert.equal(compactWaveformUrl(`${base}/waveforms/compact-v1/abc.json`), `${base}/waveforms/compact-v1/abc.json`)
  assert.equal(compactWaveformUrl('https://example.com/waveforms/set.json'), 'https://example.com/waveforms/set.json')
})
