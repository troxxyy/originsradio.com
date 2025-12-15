'use client'

import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Users, Ticket, Clock, Wrench } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import NaturalBackground from "@/components/ui/NaturalBackground";
import { useThisWeekEventsByDate, useOurWorkProjects } from "@/hooks/use-supabase";

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
  id: ClubIdentifier | string;
  name: string;
  location: string;
  lineup?: string[];
  estimatedPriceTry?: number; // Turkish Lira
  notes?: string;
  logoSrc?: string;
  eventUrl?: string;
  eventImageUrl?: string;
  isOurEvent?: boolean; // Flag to identify our events
  description?: string; // For our events
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

  // Avoid startDate > endDate when visiting on Saturday.
  if (day === 6) {
    const saturday = new Date(now);
    const friday = new Date(now);
    friday.setDate(now.getDate() - 1);
    return { friday, saturday };
  }

  // On Sundays, jump to the next weekend.
  if (day === 0) {
    const friday = new Date(now);
    friday.setDate(now.getDate() + 5);
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + 6);
    return { friday, saturday };
  }

  // Default: current week's upcoming Friday/Saturday.
  const daysUntilFriday = 5 - day; // Friday=5
  const daysUntilSaturday = 6 - day; // Saturday=6

  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFriday);

  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);

  return { friday, saturday };
};

// Normalized assets mapping for known clubs
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
  { id: "backyardsecrets", name: "Backyard Secrets", location: "", logoSrc: "/clublogos/backyard_ankara.jpg" },
  { id: "carbone", name: "Carbone", location: "", logoSrc: "/clublogos/carbone_ankara.png" },
  { id: "pixel", name: "Pixel", location: "", logoSrc: "/clublogos/pixel_ankara.png" },
  { id: "kite", name: "Kite", location: "", logoSrc: "/clublogos/kite_ankara.jpg" },
  { id: "guushouse", name: "Guus House", location: "", logoSrc: "/clublogos/guus_ankara.jpeg" },
  { id: "leporte", name: "Le Porte", location: "", logoSrc: "/clublogos/leporte_ankara.jpeg" },
  { id: "amykitchen", name: "Amy Kitchen", location: "", logoSrc: "/clublogos/amy_ankara.jpeg" },
  { id: "shades", name: "Shades", location: "", logoSrc: "/clublogos/shades_ankara.png" },
  { id: "riff", name: "Riff", location: "", logoSrc: "/clublogos/riff_ankara.jpeg" },
  { id: "stir", name: "Stir", location: "", logoSrc: "/clublogos/stir_ankara.jpg" },
];

type CityKey = "ankara" | "istanbul" | "izmir" | "antalya";

export default function ThisWeekPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [city, setCity] = useState<CityKey>("ankara");

  const { friday, saturday } = useMemo(() => getUpcomingFridayAndSaturday(), []);

  // Get date range for this week's events
  const fridayKey = formatYyyyMmDd(friday);
  const saturdayKey = formatYyyyMmDd(saturday);
  const startDate = fridayKey;
  const endDate = saturdayKey;

  // Fetch this week's events from Supabase
  const { data: thisWeekEvents, isLoading: isLoadingEvents } = useThisWeekEventsByDate(startDate, endDate);
  
  // Fetch our work projects for our events
  const { data: ourWorkProjects, isLoading: isLoadingOurWork } = useOurWorkProjects();

  // Process events and create schedule
  const schedule: DaySchedule[] = useMemo(() => {
    const byDay = new Map<string, ClubScheduleItem[]>();
    byDay.set(fridayKey, []);
    byDay.set(saturdayKey, []);

    // Process this week's club events
    if (thisWeekEvents) {
      for (const event of thisWeekEvents) {
        const eventDate = parseSheetDate(event.event_date);
        if (!eventDate) continue;
        const key = formatYyyyMmDd(eventDate);
        if (!byDay.has(key)) continue; // only show Fri/Sat

        const normalized = normalizeClubName(event.club_name);
        const assets = clubAssetsByNormalizedName[normalized];
        if (!assets) continue; // skip unknown clubs

        const priceRaw = (event.price ?? "").toString().trim();
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
          location: "",
          lineup: event.event_artist ? [event.event_artist] : undefined,
          estimatedPriceTry: Number.isFinite(priceNum as number) ? (priceNum as number) : undefined,
          logoSrc: assets.logoSrc,
          eventUrl: event.event_url || undefined,
          eventImageUrl: event.image_url || undefined,
          isOurEvent: false,
        };

        byDay.get(key)!.push(item);
      }
    }

    // Process our work projects (our events)
    if (ourWorkProjects) {
      // Normalize target day timestamps (midnight) for distance comparisons
      const fridayTs = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate()).getTime()
      const saturdayTs = new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate()).getTime()

      for (const project of ourWorkProjects) {
        if (!project.upcoming) continue;

        // Determine which day bucket to place the event into
        let bucketKey = fridayKey; // default to Friday so it always shows

        const projectDate = project.date ? parseSheetDate(project.date) : null;
        if (projectDate) {
          const pTs = new Date(projectDate.getFullYear(), projectDate.getMonth(), projectDate.getDate()).getTime()
          if (formatYyyyMmDd(projectDate) === fridayKey) {
            bucketKey = fridayKey
          } else if (formatYyyyMmDd(projectDate) === saturdayKey) {
            bucketKey = saturdayKey
          } else {
            // Choose the closer of Friday/Saturday
            const df = Math.abs(pTs - fridayTs)
            const ds = Math.abs(pTs - saturdayTs)
            bucketKey = df <= ds ? fridayKey : saturdayKey
          }
        }

        const item: ClubScheduleItem = {
          id: `our-event-${project.id}`,
          name: project.title,
          location: (project as any).location || "",
          description: project.description as string,
          estimatedPriceTry: (project as any).price || 0,
          eventUrl: (project as any).ticket_url || (project as any).form_url || undefined,
          eventImageUrl: project.image_url,
          isOurEvent: true,
        };

        if (!byDay.has(bucketKey)) {
          byDay.set(bucketKey, [])
        }
        byDay.get(bucketKey)!.push(item);
      }
    }

    // If no events for a day, show base clubs
    const fridayItems = byDay.get(fridayKey)!.length > 0 ? byDay.get(fridayKey)! : baseClubs;
    const saturdayItems = byDay.get(saturdayKey)!.length > 0 ? byDay.get(saturdayKey)! : baseClubs;

    return [
      {
        label: "Friday",
        dateDisplay: formatDateForDisplay(friday),
        items: fridayItems,
      },
      {
        label: "Saturday",
        dateDisplay: formatDateForDisplay(saturday),
        items: saturdayItems,
      },
    ];
  }, [thisWeekEvents, ourWorkProjects, friday, saturday, fridayKey, saturdayKey]);

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
    <PageLayout>
      {/* Natural warm background */}
      <NaturalBackground />
      
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 mb-3">
            <Clock className="w-3.5 h-3.5" />
            Updated weekly
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">This Week</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Friday and Saturday events.</p>
        </div>

        {/* City Tabs */}
        <div className="mb-8 flex items-center justify-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 overflow-x-auto max-w-full whitespace-nowrap scrollbar-hide">
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
          <div className="space-y-6 sm:space-y-10">
            {schedule.map((day) => (
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
                      <div key={`${day.label}-${item.id}`} className={`group rounded-2xl border transition-all overflow-hidden ${
                        item.isOurEvent 
                          ? "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:bg-gradient-to-br hover:from-orange-500/15 hover:to-orange-600/10 hover:shadow-[0_0_30px_rgba(255,165,0,0.15)]" 
                          : "border-white/10 bg-white/[0.06] hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                      }`}>
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
                          {item.isOurEvent && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-0.5 rounded-md bg-orange-500/90 backdrop-blur border border-orange-400/30 text-xs text-white font-semibold">
                                Our Event
                              </span>
                            </div>
                          )}
                          {typeof item.estimatedPriceTry !== 'undefined' && (
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur border border-white/10 text-xs text-white/90">
                                {item.estimatedPriceTry === 0 ? '0.00 Turkish Lira' : `${item.estimatedPriceTry?.toLocaleString(undefined, { maximumFractionDigits: 0 })} Turkish Lira`}
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
                            {item.isOurEvent && item.description ? (
                              <div className="text-sm text-gray-300 line-clamp-3">
                                {item.description}
                              </div>
                            ) : (
                              <Lineup names={item.lineup} />
                            )}
                            {item.eventUrl && (
                              <div>
                                <a
                                  href={item.eventUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`inline-flex items-center gap-2 text-sm px-3 py-1 rounded-md border transition-colors ${
                                    item.isOurEvent
                                      ? "text-orange-100 bg-orange-500/20 border-orange-400/30 hover:bg-orange-500/30"
                                      : "text-white/90 bg-white/10 border-white/10 hover:bg-white/15"
                                  }`}
                                >
                                  {item.isOurEvent ? "Get Tickets" : "View event"}
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
          Club events and our own events updated from our Supabase database. Orange cards are our events.
        </p>
      </div>
    </PageLayout>
  );
}


