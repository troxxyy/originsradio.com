import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'

const bundle = await build({ entryPoints: ['src/app/lib/radio-schedule-data.ts'], bundle: true, platform: 'node', format: 'esm', write: false })
const { getRadioWeekKeys, fetchWeeklyRadioSchedule } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`)

test('Sunday night in UTC uses the new Istanbul week and keeps the legacy UTC key', () => {
  assert.deepEqual(getRadioWeekKeys(new Date('2026-10-04T21:30:00Z')), { weekMondayIstanbul: '2026-10-05', weekMondayUtc: '2026-09-28' })
  assert.deepEqual(getRadioWeekKeys(new Date('2026-10-05T00:30:00Z')), { weekMondayIstanbul: '2026-10-05', weekMondayUtc: '2026-10-05' })
})

test('week keys retain the correct year at New Year', () => {
  assert.deepEqual(getRadioWeekKeys(new Date('2027-01-01T12:00:00Z')), { weekMondayIstanbul: '2026-12-28', weekMondayUtc: '2026-12-28' })
})

test('failed schedule reads reject instead of replacing real programme data with an empty list', async () => {
  const error = new Error('temporary upstream outage')
  const query = { select: () => query, eq: () => query, in: () => query, order: () => query, then: resolve => Promise.resolve({ data: null, error }).then(resolve) }
  await assert.rejects(fetchWeeklyRadioSchedule({ from: () => query }, getRadioWeekKeys()), /temporary upstream outage/)
})
