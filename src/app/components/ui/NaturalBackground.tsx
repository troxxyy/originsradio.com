'use client'

/**
 * NaturalBackground - A warm, atmospheric background with natural earthy tones.
 * Use this component to create a consistent look across pages.
 */
export default function NaturalBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Deep warm dark base */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-stone-950 to-zinc-950"></div>
      
      {/* Subtle warm undertone */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-transparent to-stone-900/30"></div>
      
      {/* Top left - warm amber glow */}
      <div className="absolute -left-20 -top-20 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-amber-700/15 to-orange-800/10 blur-[100px] transform-gpu"></div>
      
      {/* Top right - soft terracotta glow */}
      <div className="absolute -right-20 top-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-l from-orange-900/12 to-amber-900/8 blur-[80px] transform-gpu"></div>
      
      {/* Center - warm neutral glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-stone-700/10 via-neutral-600/8 to-stone-700/10 blur-[120px] transform-gpu"></div>
      
      {/* Bottom left - earthy olive tint */}
      <div className="absolute -left-20 bottom-1/4 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-stone-600/10 to-neutral-700/8 blur-[80px] transform-gpu"></div>
      
      {/* Bottom right - warm copper glow */}
      <div className="absolute -right-10 -bottom-20 w-[450px] h-[450px] rounded-full bg-gradient-to-l from-amber-800/12 via-orange-900/10 to-stone-800/8 blur-[100px] transform-gpu"></div>
      
      {/* Subtle noise/grain overlay for organic texture */}
      <div className="absolute inset-0 opacity-[0.025] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]"></div>
    </div>
  );
}

