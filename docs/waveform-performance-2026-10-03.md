# Artist set waveform previews

The old preview created a WaveSurfer audio player for each visible set. Missing or empty peaks triggered a complete audio download and browser decoding. Even valid previews carried around 60,000 samples in JSON files as large as 1.2 MB. Of the 34 set records checked, 15 had no peaks URL and nine pointed to empty peak arrays; all durations were null.

## Change

- A responsive canvas renders precomputed peaks independently of playback. Viewing a waveform makes only a JSON request. The parent audio player still owns playback and seeking.
- Generated actual previews from all 33 distinct audio recordings in the verified local backup using FFmpeg. Each contains 1,200 amplitude peaks and the recording duration. All 33 files together are 274,220 bytes; the largest is 8,330 bytes.
- Published immutable previews under R2 `waveforms/compact-v1/`, verified full hashes and public CORS delivery, then updated all 34 set rows using original-value predicates. Only `peaks_url` and `duration` changed. Original recordings and old waveform objects remain.
- Previews initialize near the viewport, use a small optional local cache and cancel pending requests on unmount. Missing data shows a truthful unavailable state. Mouse and keyboard seeking call the existing player directly.
- Future admin-generated peaks are bounded to 1,200 values and four decimal places. Set cards display stored duration before playback.

## Validation

- 28 tests passed, including malformed/empty legacy peaks, silence, narrow transients, bounded data size and URL handling. Typecheck and production build passed.
- All 34 records expose the new peaks URL and duration through the anonymous public reader. Every new R2 object passed full byte/hash and public-delivery checks before the database update.
- Desktop browser preview for AL2 became ready in 1,203 ms in one cold sample, with one tiny JSON request and no audio constructed before playback. This is a sample, not a universal loading-time guarantee.
- Playback advanced; clicking halfway and pressing ArrowRight moved the actual player to about 55%. Desktop and 390-pixel mobile layouts were checked, including Iggy Bunn, whose old peaks were empty.

`scripts/prepare-waveform-previews.cjs` generates locally by default. `--apply` validates the unchanged source rows before publishing and updating. Source rows, generated previews, the plan and per-row update receipts are retained in gitignored `tmp/waveform-optimization-2026-10-03/`. Any rollback should restore only rows that still match the applied peaks URL and duration.
