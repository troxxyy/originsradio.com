# Spline source exports

The original `orbvol1` and `orbvol2` exports are retained here for editing. They
contain the project source and lockfiles, without installed `node_modules`.
Install dependencies inside an export only when working on its standalone scene.

The site uses the `orbvol2` scene. Only its three runtime files are published in
`public/3d/orb-v1/`: `scene.splinecode`, `draco_decoder.wasm`, and
`draco_wasm_wrapper.js`. `Orb.tsx` and the resource preloader share this location.
When replacing runtime files, publish a new version directory and update both
references, because the versioned files have immutable cache headers.
