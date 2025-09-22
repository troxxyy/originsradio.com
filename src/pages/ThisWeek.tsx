import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Users, Ticket, Clock, Wrench } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { fetchThisWeekRows, ThisWeekSheetRow } from "@/lib/thisweek";

type ClubIdentifier =
  | "backyardsecrets"
  | "carbone"
  | "pixel"
  | "kite"
  | "guushouse"
  | "leporte"
  | "amykitchen"
  | "shades"
  | "riff"
  | "stir";

interface ClubScheduleItem {
  id: ClubIdentifier;
  name: string;
  location: string;
  lineup?: string[];
  estimatedPriceTry?: number; // Turkish Lira
  notes?: string;
  logoSrc?: string;
  eventUrl?: string;
  eventImageUrl?: string;
}

interface DaySchedule {
  label: string;
  dateDisplay: string;
  items: ClubScheduleItem[];
}

const formatDateForDisplay = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const getUpcomingFridayAndSaturday = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun ... 6=Sat

  const daysUntilFriday = (5 - day + 7) % 7; // Friday=5
  const daysUntilSaturday = (6 - day + 7) % 7; // Saturday=6

  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFriday);

  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);

  return { friday, saturday };
};

// Normalized assets mapping for known Ankara clubs
const clubAssetsByNormalizedName: Record<string, { id: ClubIdentifier; name: string; logoSrc: string }> = {
  "backyard secrets": { id: "backyardsecrets", name: "Backyard Secrets", logoSrc: "/clublogos/backyard_ankara.jpg" },
  "carbone": { id: "carbone", name: "Carbone", logoSrc: "/clublogos/carbone_ankara.png" },
  "pixel": { id: "pixel", name: "Pixel", logoSrc: "/clublogos/pixel_ankara.png" },
  "kite": { id: "kite", name: "Kite", logoSrc: "/clublogos/kite_ankara.jpg" },
  "guus house": { id: "guushouse", name: "Guus House", logoSrc: "/clublogos/guus_ankara.jpeg" },
  "le porte": { id: "leporte", name: "Le Porte", logoSrc: "/clublogos/leporte_ankara.jpeg" },
  "amy kitchen": { id: "amykitchen", name: "Amy Kitchen", logoSrc: "/clublogos/amy_ankara.jpeg" },
  "shades": { id: "shades", name: "Shades", logoSrc: "/clublogos/shades_ankara.png" },
  "riff": { id: "riff", name: "Riff", logoSrc: "/clublogos/riff_ankara.jpeg" },
  "stir": { id: "stir", name: "Stir", logoSrc: "/clublogos/stir_ankara.jpg" },
};

function normalizeClubName(name: string | null | undefined): string {
  return (name || "")
    .toLowerCase()
    .replace(/ankara/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatYyyyMmDd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseSheetDate(value: string | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  // Prefer explicit local parsing for yyyy-mm-dd to avoid UTC timezone shifts
  const isoBare = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoBare) {
    const year = parseInt(isoBare[1], 10);
    const month = parseInt(isoBare[2], 10) - 1;
    const day = parseInt(isoBare[3], 10);
    const dt = new Date(year, month, day);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  // Fallback: native Date parse (may treat ISO as UTC in some browsers)
  const iso = new Date(trimmed);
  if (!Number.isNaN(iso.getTime())) return iso;
  // Try dd-mm-yy or dd-mm-yyyy
  const m = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    let year = parseInt(m[3], 10);
    if (year < 100) year += 2000;
    const dt = new Date(year, month, day);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  return null;
}

const baseClubs: ClubScheduleItem[] = [
  { id: "backyardsecrets", name: "Backyard Secrets", location: "Ankara", logoSrc: "/clublogos/backyard_ankara.jpg" },
  { id: "carbone", name: "Carbone", location: "Ankara", logoSrc: "/clublogos/carbone_ankara.png" },
  { id: "pixel", name: "Pixel", location: "Ankara", logoSrc: "/clublogos/pixel_ankara.png" },
  { id: "kite", name: "Kite", location: "Ankara", logoSrc: "/clublogos/kite_ankara.jpg" },
  { id: "guushouse", name: "Guus House", location: "Ankara", logoSrc: "/clublogos/guus_ankara.jpeg" },
  { id: "leporte", name: "Le Porte", location: "Ankara", logoSrc: "/clublogos/leporte_ankara.jpeg" },
  { id: "amykitchen", name: "Amy Kitchen", location: "Ankara", logoSrc: "/clublogos/amy_ankara.jpeg" },
  { id: "shades", name: "Shades", location: "Ankara", logoSrc: "/clublogos/shades_ankara.png" },
  { id: "riff", name: "Riff", location: "Ankara", logoSrc: "/clublogos/riff_ankara.jpeg" },
  { id: "stir", name: "Stir", location: "Ankara", logoSrc: "/clublogos/stir_ankara.jpg" },
];

type CityKey = "ankara" | "istanbul" | "izmir" | "antalya";

const ThisWeek = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [city, setCity] = useState<CityKey>("ankara");

  const { friday, saturday } = useMemo(() => getUpcomingFridayAndSaturday(), []);

  const [sheetSchedule, setSheetSchedule] = useState<DaySchedule[] | null>(null);

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const rows = await fetchThisWeekRows();
        if (isCancelled) return;

        const fridayKey = formatYyyyMmDd(friday);
        const saturdayKey = formatYyyyMmDd(saturday);

        const byDay = new Map<string, ClubScheduleItem[]>();
        byDay.set(fridayKey, []);
        byDay.set(saturdayKey, []);

        for (const r of rows) {
          const eventDate = parseSheetDate(r.event_date);
          if (!eventDate) continue;
          const key = formatYyyyMmDd(eventDate);
          if (!byDay.has(key)) continue; // only show Fri/Sat

          const normalized = normalizeClubName(r.club_name);
          const assets = clubAssetsByNormalizedName[normalized];
          if (!assets) continue; // skip unknown clubs

          const priceRaw = (r.price ?? "").toString().trim();
          let priceNum: number | undefined = undefined;
          const priceMatch = priceRaw.match(/(\d+(?:[.,]\d+)?)/);
          if (priceMatch) {
            const normalized = priceMatch[1].replace(",", ".");
            const parsed = parseFloat(normalized);
            priceNum = Number.isFinite(parsed) ? Math.round(parsed) : undefined;
          }

          const item: ClubScheduleItem = {
            id: assets.id,
            name: assets.name,
            location: "Ankara",
            lineup: Array.isArray(r.lineup_names) && r.lineup_names.length > 0 ? r.lineup_names : (r.event_artist ? [r.event_artist] : undefined),
            estimatedPriceTry: Number.isFinite(priceNum as number) ? (priceNum as number) : undefined,
            logoSrc: assets.logoSrc,
            eventUrl: r.event_url || undefined,
            eventImageUrl: r.image_url || undefined,
          };

          byDay.get(key)!.push(item);
        }

        const newSchedule: DaySchedule[] = [
          {
            label: "Friday",
            dateDisplay: formatDateForDisplay(friday),
            items: byDay.get(fridayKey)!.length > 0 ? byDay.get(fridayKey)! : baseClubs,
          },
          {
            label: "Saturday",
            dateDisplay: formatDateForDisplay(saturday),
            items: byDay.get(saturdayKey)!.length > 0 ? byDay.get(saturdayKey)! : baseClubs,
          },
        ];

        setSheetSchedule(newSchedule);
      } catch (err) {
        // Silently fallback to base schedule
        console.warn("Failed to fetch ThisWeek sheet:", err);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [friday, saturday]);

  // Placeholder schedules; will be filled by scraper later
  const schedule: DaySchedule[] = useMemo(
    () => [
      {
        label: "Friday",
        dateDisplay: formatDateForDisplay(friday),
        items: baseClubs.map((club) => ({
          ...club,
          lineup: undefined, // to be scraped
          estimatedPriceTry: undefined, // to be scraped
        })),
      },
      {
        label: "Saturday",
        dateDisplay: formatDateForDisplay(saturday),
        items: baseClubs.map((club) => ({
          ...club,
          lineup: undefined,
          estimatedPriceTry: undefined,
        })),
      },
    ],
    [friday, saturday]
  );

  const Price = ({ value }: { value: number | undefined }) => {
    const display =
      value === undefined
        ? "TBD"
        : value === 0
        ? "0.00 Turkish Lira"
        : `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} Turkish Lira`;
    return (
      <div className="flex items-center gap-2 text-sm text-gray-200">
        <Ticket className="w-4 h-4 text-white/80" />
        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{display}</span>
        <span className="text-[11px] text-gray-400">Est.</span>
      </div>
    );
  };

  const Lineup = ({ names }: { names: string[] | undefined }) => (
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <Users className="w-4 h-4 text-white/80" />
      {names && names.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {names.map((n) => (
            <span key={n} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-200">
              {n}
            </span>
          ))}
        </div>
      ) : (
        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">Lineup TBD</span>
      )}
    </div>
  );

  return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 mb-3">
            <Clock className="w-3.5 h-3.5" />
            Updated weekly
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">This Week</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Friday and Saturday lineups in Ankara.</p>
        </div>

        {/* City Tabs */}
        <div className="mb-8 flex items-center justify-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            {[
              { key: "ankara", label: "Ankara" },
              { key: "istanbul", label: "Istanbul" },
              { key: "izmir", label: "Izmir" },
              { key: "antalya", label: "Antalya" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setCity(t.key as CityKey)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  city === (t.key as CityKey)
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weekdays */}
        {city === "ankara" ? (
          <div className="space-y-10">
            {(sheetSchedule ?? schedule).map((day) => (
              <section key={day.label} className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-white/80" />
                    <h2 className="text-xl font-semibold text-white">{day.label}</h2>
                  </div>
                  <span className="text-sm text-gray-300">{day.dateDisplay}</span>
                </header>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {day.items.map((item) => (
                      <div key={`${day.label}-${item.id}`} className="group rounded-2xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all overflow-hidden">
                        {/* Poster */}
                        <div className="relative bg-white/5 border-b border-white/10 aspect-[4/5] overflow-hidden">
                          {item.eventImageUrl ? (
                            <img
                              src={item.eventImageUrl}
                              alt={`${item.name} poster`}
                              className="absolute inset-0 w-full h-full object-contain"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                              {item.logoSrc && (
                                <img
                                  src={item.logoSrc}
                                  alt={`${item.name} logo`}
                                  className="w-16 h-16 rounded-md object-contain bg-white/10 p-2 ring-1 ring-white/10"
                                  loading="lazy"
                                  decoding="async"
                                />
                              )}
                            </div>
                          )}
                          {typeof item.estimatedPriceTry !== 'undefined' && (
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur border border-white/10 text-xs text-white/90">
                                {item.estimatedPriceTry === 0 ? 'Free' : `${item.estimatedPriceTry?.toLocaleString(undefined, { maximumFractionDigits: 0 })} TRY`}
                              </span>
                            </div>
                          )}
                          {item.eventUrl && (
                            <a
                              href={item.eventUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0"
                              aria-label={`Open ${item.name} event`}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {item.logoSrc && (
                              <img
                                src={item.logoSrc}
                                alt={`${item.name} logo`}
                                className="w-10 h-10 rounded-md object-contain bg-white/10 p-1 ring-1 ring-white/10"
                                loading="lazy"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-white truncate">{item.name}</h3>
                              </div>
                              <div className="inline-flex items-center gap-1 text-[12px] text-gray-400">
                                <MapPin className="w-3.5 h-3.5" />
                                {item.location}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
                            <Lineup names={item.lineup} />
                            {item.eventUrl && (
                              <div>
                                <a
                                  href={item.eventUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 text-sm text-white/90 px-3 py-1 rounded-md bg-white/10 border border-white/10 hover:bg-white/15"
                                >
                                  View event
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 mb-3">
                <Wrench className="w-3.5 h-3.5" />
                Under maintenance
              </div>
              <p className="text-gray-300">
                We are preparing schedules for {city.charAt(0).toUpperCase() + city.slice(1)}. Please check back soon.
              </p>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-xs text-gray-400 mt-8 text-center">
          Data updates weekly from our Supabase database.
        </p>
      </div>
    </PageLayout>
  );
};

export default ThisWeek;


