# Media and public-file maintenance — 2 October 2026

## Changes and measured sizes

The complete 70.5-second home background has been re-encoded for desktop and
mobile. Both renditions use H.264, 20 fps, no audio and MP4 faststart (the `moov`
header precedes media data). The original remains in
`assets/video/home-background-original.mp4` for future exports.

| File | Bytes | MiB | Reduction from original |
| --- | ---: | ---: | ---: |
| Original 1920 × 1080 video | 11,175,550 | 10.66 | — |
| Desktop 1280 × 720 video | 3,968,821 | 3.78 | 64.5% |
| Mobile 854 × 480 video | 2,128,239 | 2.03 | 81.0% |
| Initial JPEG poster | 30,783 | 0.03 | — |

Home chooses one rendition before loading, rather than fetching desktop media
and switching after hydration. The poster appears before playback. Reduced
motion or Save-Data uses the poster without assigning a video source. Hidden
tabs and a fully faded video pause playback. Original and compressed sample
frames were visually compared at 23 seconds.

The two standalone Spline projects have moved from `public/orbvol1` and
`public/orbvol2` to `assets/spline/`. Source, lockfiles and both scene variants
are retained; 884 installed dependency files (82,389,728 bytes) were removed.
Only the active scene and its two Draco runtime files are published at
`public/3d/orb-v1/`. These three files match their originals byte for byte.
Both the Orb component and resource preloader reference the new location.

The public directory decreased from **356,612,597 to 268,709,774 bytes**:
87,902,823 bytes (83.83 MiB) removed from the public deployment payload.
This measures filesystem payload, not bytes every visitor previously downloaded.

Versioned home media and Orb files receive one-year immutable cache headers.
Changing them requires new version filenames/directories. The radio schedule's
requested image quality of 60 is now allowed alongside 75 in Next's image
configuration; it previously fell back to 75.

## Verification

- Desktop and 390 px mobile home render with no horizontal overflow.
- Desktop video plays at 1280 × 720; mobile requests only the mobile MP4.
- Reduced-motion browser requests no background MP4 and keeps the poster.
- Both video durations are 70.5 seconds and both have MP4 faststart.
- Six new media/runtime endpoints return HTTP 200 with immutable cache headers.
- Video byte-range request returns 206; the old public dependency URL returns 404.
- Scoped lint and TypeScript pass; Orb retains its existing cleanup-ref warning.
- Production build passes using `npm run build -- --webpack`. The default
  Turbopack build encountered this execution environment's subprocess port
  restriction (`Operation not permitted`) before compilation completed.

Re-export video with `bash scripts/optimize_home_video.sh v2`, then update Home's
filenames. No load-time percentage or Lighthouse score is claimed; the measured
improvements here are file size, request selection and cache behavior.

Changes are local; no commit, push or deployment was performed.
