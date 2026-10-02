'use client'

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import PageLayout from "@/components/layout/PageLayout";
import NaturalBackground from "@/components/ui/NaturalBackground";

const cities = [
  { name: "Ankara", message: "Ankara’da çok yakında." },
  { name: "Istanbul", message: "İstanbul’da çok yakında." },
  { name: "Izmir", message: "İzmir’de çok yakında." },
  { name: "Antalya", message: "Antalya’da çok yakında." },
];

export default function ThisWeekComingSoon() {
  const [city, setCity] = useState(cities[0]);
  const { trigger } = useWebHaptics();

  return (
    <PageLayout>
      <NaturalBackground />
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">This Week</h1>
          <p className="text-gray-300">Şehrin ritmi, çok yakında burada.</p>
        </header>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 overflow-x-auto max-w-full whitespace-nowrap scrollbar-hide" aria-label="Şehir seçimi">
            {cities.map((item) => (
              <button
                key={item.name}
                type="button"
                aria-pressed={city.name === item.name}
                onClick={() => { trigger('light'); setCity(item); }}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${city.name === item.name ? "bg-white/10 text-white" : "text-gray-300 hover:text-white"}`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-14 sm:py-20 text-center max-w-2xl mx-auto" aria-live="polite">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 mb-5">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {city.name}
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white">{city.message}</h2>
        </section>
      </div>
    </PageLayout>
  );
}
