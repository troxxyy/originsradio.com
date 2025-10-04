import { useMemo, useState, useEffect, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import { useOurWorkProjects } from "@/hooks/use-supabase";
import { Calendar, MapPin, Tag, Ticket, ArrowLeft, Share2 } from "lucide-react";
import TicketPurchaseModal, { TicketTier } from "@/components/events/TicketPurchaseModal";
import EventRules from "@/components/events/EventRules";
import { getOurWorkProjectBySlug } from "@/lib/supabase-utils";

type UiProject = {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  date?: string;
  upcoming?: boolean;
  location?: string;
  ticketUrl?: string;
  tiers?: TicketTier[];
  formUrl?: string;
  price?: number;
};

const EventDetail = () => {
  const { eventSlug } = useParams();
  const [project, setProject] = useState<UiProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      if (!eventSlug) {
        setProject(null);
        setIsLoading(false);
        return;
      }

      try {
        const projectData = await getOurWorkProjectBySlug(eventSlug);
        if (projectData) {
          const rawPrice = (projectData as any).price;
          const parsedPrice = rawPrice === null || rawPrice === undefined || rawPrice === '' ? undefined : Number(rawPrice);
          setProject({
            title: projectData.title,
            description: projectData.description,
            imageUrl: projectData.image_url,
            tags: projectData.tags || [],
            date: projectData.date || undefined,
            upcoming: projectData.upcoming,
            location: (projectData as any).location,
            ticketUrl: (projectData as any).ticket_url,
            tiers: (projectData as any).tiers,
            formUrl: (projectData as any).form_url,
            price: Number.isFinite(parsedPrice as number) ? (parsedPrice as number) : undefined,
          });
        } else {
          setProject(null);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [eventSlug]);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bgStyle, setBgStyle] = useState<CSSProperties | undefined>(undefined);

  const ticketPriceLabel = useMemo(() => {
    const tiers = project?.tiers;
    if (!tiers || tiers.length === 0) {
      // Use single price when available
      if (typeof project?.price === 'number' && Number.isFinite(project.price)) {
        const value = project.price;
        return value === 0 ? "₺0.00" : new Intl.NumberFormat(undefined, { style: "currency", currency: "TRY" }).format(value);
      }
      // For upcoming events without tiers, show ₺0.00
      if (project?.upcoming) {
        return "₺0.00";
      }
      return null;
    }
    const validTiers = tiers.filter((t) => typeof t.price === "number");
    if (validTiers.length === 0) return "₺0.00";
    const minTier = validTiers.reduce((a, b) => (a.price <= b.price ? a : b));
    const maxTier = validTiers.reduce((a, b) => (a.price >= b.price ? a : b));
    const currency = (minTier.currency ?? validTiers[0]?.currency) || "TRY";
    const fmt = (v: number) =>
      v === 0 ? "₺0.00" : new Intl.NumberFormat(undefined, { style: "currency", currency }).format(v);
    if (minTier.price === maxTier.price) return fmt(minTier.price);
    return `${fmt(minTier.price)}–${fmt(maxTier.price)}`;
  }, [project?.tiers, project?.upcoming, project?.price]);

  const availabilityLabel = useMemo(() => {
    const tiers = project?.tiers;
    if (!tiers || tiers.length === 0) return null;
    const availabilities = tiers
      .map((t) => (typeof t.available === "number" ? t.available : null))
      .filter((v): v is number => v !== null);
    if (availabilities.length === 0) return null;
    const totalLeft = availabilities.reduce((a, b) => a + b, 0);
    if (totalLeft <= 0) return "Sold out";
    const minLeft = Math.min(...availabilities);
    return minLeft <= 10 ? `${totalLeft} left (low stock)` : `${totalLeft} left`;
  }, [project?.tiers]);

  const tiersCountLabel = useMemo(() => {
    const count = project?.tiers?.length ?? 0;
    if (count <= 1) return null;
    return `${count} tiers`;
  }, [project?.tiers]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [eventSlug]);

  useEffect(() => {
    if (!project?.imageUrl) {
      setBgStyle(undefined);
      return;
    }

    let isCancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = project.imageUrl;
    image.onload = () => {
      try {
        const targetWidth = 40;
        const targetHeight = 40;
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
        const { data } = ctx.getImageData(0, 0, targetWidth, targetHeight);
        let rSum = 0,
          gSum = 0,
          bSum = 0,
          count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 8) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Skip near-white pixels to avoid washed-out backgrounds
          if (r > 240 && g > 240 && b > 240) continue;
          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }
        if (count === 0) return;
        const r = Math.round(rSum / count);
        const g = Math.round(gSum / count);
        const b = Math.round(bSum / count);

        // Boost saturation and slightly lower lightness for more emphasis
        const rgbToHsl = (rr: number, gg: number, bb: number) => {
          const r1 = rr / 255;
          const g1 = gg / 255;
          const b1 = bb / 255;
          const max = Math.max(r1, g1, b1);
          const min = Math.min(r1, g1, b1);
          let h = 0, s = 0;
          const l = (max + min) / 2;
          const d = max - min;
          if (d !== 0) {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r1:
                h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
                break;
              case g1:
                h = (b1 - r1) / d + 2;
                break;
              case b1:
                h = (r1 - g1) / d + 4;
                break;
            }
            h /= 6;
          }
          return { h, s, l };
        };
        const hslToRgb = (h: number, s: number, l: number) => {
          let r2: number, g2: number, b2: number;
          if (s === 0) {
            r2 = g2 = b2 = l; // achromatic
          } else {
            const hue2rgb = (p: number, q: number, t: number) => {
              if (t < 0) t += 1;
              if (t > 1) t -= 1;
              if (t < 1 / 6) return p + (q - p) * 6 * t;
              if (t < 1 / 2) return q;
              if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
              return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r2 = hue2rgb(p, q, h + 1 / 3);
            g2 = hue2rgb(p, q, h);
            b2 = hue2rgb(p, q, h - 1 / 3);
          }
          return {
            r: Math.round(r2 * 255),
            g: Math.round(g2 * 255),
            b: Math.round(b2 * 255),
          };
        };

        const { h, s, l } = rgbToHsl(r, g, b);
        const sBoost = Math.min(1, s * 1.35 + 0.05);
        const lTweak = Math.max(0, Math.min(1, l * 0.9));
        const boosted = hslToRgb(h, sBoost, lTweak);
        const rd = boosted.r;
        const gd = boosted.g;
        const bd = boosted.b;

        if (!isCancelled) {
          setBgStyle({
            background:
              [
                `radial-gradient(65% 55% at 50% 0%, rgba(${rd}, ${gd}, ${bd}, 0.75) 0%, rgba(${rd}, ${gd}, ${bd}, 0.35) 52%, rgba(0, 0, 0, 0.96) 100%)`,
                `radial-gradient(60% 50% at 80% 100%, rgba(${rd}, ${gd}, ${bd}, 0.35) 0%, rgba(0, 0, 0, 0.98) 60%)`,
                `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%)`,
                `#000`,
              ].join(", "),
          });
        }
      } catch (e) {
        // Likely a CORS-tainted canvas; fall back silently
        if (!isCancelled) setBgStyle(undefined);
      }
    };
    image.onerror = () => {
      if (!isCancelled) setBgStyle(undefined);
    };

    return () => {
      isCancelled = true;
    };
  }, [project?.imageUrl]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen grid place-items-center text-white">Loading...</div>
      </PageLayout>
    );
  }

  if (!project) {
    return (
      <PageLayout>
        <div className="min-h-screen grid place-items-center text-white">
          Event not found
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      customBackground={bgStyle ? undefined : "bg-gradient-to-br from-black via-gray-900 to-black"}
      customBackgroundStyle={bgStyle}
    >
      <div className="min-h-screen">
        {/* Top section with back button */}
        <div className="relative px-6 pt-28 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <button
              onClick={() => navigate(-1)}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </div>
        </div>

        {/* Main content section */}
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            {/* Fancy gradient divider */}
            <div className="mb-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Event content grid */}
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Image section */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl border border-white/10"
              >
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </motion.div>

              {/* Content section */}
              <div className="flex flex-col justify-center space-y-8">
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.5 }}
                  className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                >
                  {project.title}
                </motion.h1>

                {/* Event metadata */}
                <div className="flex flex-wrap items-center gap-4 text-gray-300">
                  {project.date && (
                    <span className="inline-flex items-center gap-2">
                      <Calendar size={18} /> {project.date}
                    </span>
                  )}
                  {project.location && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 underline-offset-2 hover:underline"
                    >
                      <MapPin size={18} /> {project.location}
                    </a>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1600);
                      });
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-white transition-colors hover:border-white/20"
                  >
                    <Share2 size={14} /> {copied ? "Copied" : "Share"}
                  </button>
                </div>

                {/* Description */}
                <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
                  {project.description}
                </p>



                {/* Professional Ticket Section */}
                {project.upcoming && (
                  <div className="pt-6">
                    <div className="glass backdrop-blur-sm rounded-2xl border border-white/20 p-6 bg-white/5">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Price and Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {ticketPriceLabel && (
                            <div className="flex items-center gap-2">
                              <div className="text-2xl font-bold text-white">
                                <span className="mr-2 text-base font-normal text-gray-300">starts from</span>
                                {ticketPriceLabel}
                              </div>
                              {tiersCountLabel && (
                                <span className="text-sm text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                                  {tiersCountLabel}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Availability Status */}
                          {availabilityLabel && (
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                availabilityLabel.includes('Sold out') 
                                  ? 'bg-red-500' 
                                  : availabilityLabel.includes('low stock') 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                              }`} />
                              <span className="text-sm text-gray-300">{availabilityLabel}</span>
                            </div>
                          )}
                        </div>

                        {/* Professional Buy Button */}
                        <button
                          onClick={() => {
                            const url = project.formUrl || project.ticketUrl;
                            if (url && /^https?:\/\//i.test(url)) {
                              window.open(url, '_blank', 'noopener');
                            } else {
                              setIsTicketModalOpen(true);
                            }
                          }}
                          className="group relative inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-white to-gray-100 px-8 py-4 font-semibold text-black transition-all duration-300 hover:from-gray-100 hover:to-white hover:shadow-[0_8px_25px_rgba(255,255,255,0.3)] transform-gpu hover:scale-105"
                        >
                          <Ticket className="h-5 w-5 transition-transform group-hover:scale-110" />
                          <span className="text-lg">Get Tickets</span>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span>Secure Payment</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Instant Delivery</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>Mobile Tickets</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with event rules */}
        <div className="mt-20 px-6 pb-24 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <EventRules />
          </div>
        </div>

        <TicketPurchaseModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          eventTitle={project.title}
          eventDate={project.date}
          eventLocation={project.location}
          ticketUrl={project.formUrl || project.ticketUrl}
          tiers={project.tiers ?? [{ id: "general", name: "General Admission", price: 0, currency: "TRY" }]}
        />
      </div>
    </PageLayout>
  );
};

export default EventDetail;


