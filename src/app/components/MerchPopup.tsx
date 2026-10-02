'use client'

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

export default function MerchPopup() {
  const pathname = usePathname();
  const { trigger } = useWebHaptics();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setIsOpen(false);
      return;
    }

    const timer = window.setTimeout(() => setIsOpen(true), 1300);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const closePopup = () => {
    trigger("light");
    setIsOpen(false);
  };

  if (!isOpen || pathname !== "/") return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/72 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-[820px] overflow-hidden rounded-[8px] border border-white/12 bg-[#02040a] shadow-[0_30px_120px_rgba(0,0,0,0.7)]">
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/40 text-white/70 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
          aria-label="Close merch popup"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <div className="grid min-h-[520px] lg:grid-cols-[1.02fr_0.98fr]">
          <Link
            href="/merch"
            onClick={closePopup}
            className="relative block min-h-[300px] overflow-hidden bg-[#001327]"
          >
            <Image
              src="/merch/acid-bass-303.jpg"
              alt="OriginsRadio 303 Acid Bass merch cap"
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02040a]/86 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-full border border-white/12 bg-black/35 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/70 backdrop-blur-xl">
              No.303 capsule
            </div>
          </Link>

          <div className="flex flex-col justify-center px-6 py-9 sm:px-9">
            <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#69d8ff]">
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.7} />
              merch soon
            </p>
            <h2 className="font-newake text-5xl uppercase leading-[0.88] text-white sm:text-7xl">
              OriginsRadio
              <span className="block text-[#d6ec43]">Merch Drop</span>
            </h2>
            <p className="mt-5 text-sm leading-6 text-white/60 sm:text-base">
              Afterhours headwear drop is coming soon.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/merch"
                onClick={closePopup}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-[#d6ec43]"
              >
                Enter merch preview
              </Link>
              <button
                type="button"
                onClick={closePopup}
                className="inline-flex items-center justify-center rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
