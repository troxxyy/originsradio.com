import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import { useOurWorkProjects } from "@/hooks/use-supabase";
import { Calendar, MapPin, Tag, Ticket, ArrowLeft, Share2 } from "lucide-react";
import TicketPurchaseModal, { TicketTier } from "@/components/events/TicketPurchaseModal";
import EventRules from "@/components/events/EventRules";
import { generateSlug } from "@/lib/supabase-utils";

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
};

const EventDetail = () => {
  const { eventSlug } = useParams();
  const { data: remoteProjects, isLoading } = useOurWorkProjects();
  const navigate = useNavigate();

  const project: UiProject | null = useMemo(() => {
    if (!remoteProjects || remoteProjects.length === 0) return null;
    const mapped = remoteProjects.map((p) => ({
      title: p.title,
      description: p.description,
      imageUrl: p.image_url,
      tags: p.tags || [],
      date: p.date || undefined,
      upcoming: p.upcoming,
      location: (p as any).location,
      ticketUrl: (p as any).ticket_url,
      tiers: (p as any).tiers,
      formUrl: (p as any).form_url,
    }));
    return (
      mapped.find((proj) => generateSlug(proj.title) === eventSlug) || null
    );
  }, [remoteProjects, eventSlug]);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [eventSlug]);

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
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
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



                {/* Ticket button */}
                {project.upcoming && (
                  <div className="pt-4">
                    <button
                      onClick={() => setIsTicketModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-white/90"
                    >
                      <Ticket className="h-4 w-4" /> Get Tickets
                    </button>
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


