import { useMemo, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import EventRules from "@/components/events/EventRules";
import { supabase } from "@/lib/supabase";

export type TicketTier = {
  id: string;
  name: string;
  price: number; // in local currency
  currency?: string; // e.g. TRY, USD
  available?: number; // optional stock info
};

export interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  ticketUrl?: string; // external checkout page (e.g. Biletino/Stripe Payment Link)
  tiers: TicketTier[];
}

const TicketPurchaseModal = ({
  isOpen,
  onClose,
  eventTitle,
  eventDate,
  eventLocation,
  ticketUrl,
  tiers,
}: TicketPurchaseModalProps) => {
  const { trigger } = useWebHaptics();
  const [selectedTierId, setSelectedTierId] = useState<string>(tiers[0]?.id ?? "");
  const [quantity, setQuantity] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const isEmailValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email), [email]);
  const [isIssuing, setIsIssuing] = useState<boolean>(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issuedTickets, setIssuedTickets] = useState<
    Array<{ id: string; code: string; qr_public_url: string }>
  >([]);

  const selectedTier = useMemo(() => tiers.find(t => t.id === selectedTierId) ?? tiers[0], [tiers, selectedTierId]);
  const total = useMemo(() => (selectedTier ? selectedTier.price * Math.max(1, quantity) : 0), [selectedTier, quantity]);

  const currency = selectedTier?.currency ?? "TRY";

  const handleCheckout = () => {
    if (!ticketUrl) return;
    try {
      const url = new URL(ticketUrl);
      url.searchParams.set("tier", selectedTier?.id ?? "");
      url.searchParams.set("qty", String(Math.max(1, quantity)));
      if (email) url.searchParams.set("email", email);
      window.open(url.toString(), "_blank");
    } catch {
      trigger('medium');
      window.open(ticketUrl, "_blank");
    }
  };

  const issueFreeTickets = async () => {
    setIsIssuing(true);
    setIssueError(null);
    setIssuedTickets([]);
    try {
      if (!supabase) throw new Error("Supabase is not configured");
      const { data: sessionRes } = await supabase.auth.getSession();
      const accessToken = sessionRes?.session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { data, error } = await supabase.functions.invoke("issue-ticket", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: {
          email: email || undefined,
          eventTitle,
          eventDate,
          eventLocation,
          tierId: selectedTier?.id ?? undefined,
          tierName: selectedTier?.name ?? undefined,
          quantity: Math.max(1, quantity),
          price: selectedTier?.price ?? 0,
          currency,
          verifyBaseUrl: window.location.origin,
        },
      });

      if (error) throw error as unknown as Error;

      const tickets = (data as any)?.tickets as Array<{
        id: string;
        code: string;
        qr_public_url: string;
      }>;
      if (!tickets || tickets.length === 0) throw new Error("No tickets returned");
      trigger('success');
      setIssuedTickets(tickets);
    } catch (err: any) {
      trigger('error');
      setIssueError(err?.message ?? "Failed to issue ticket");
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-2xl border border-white/10 bg-black/70 text-white shadow-2xl"
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 8, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">{eventTitle}</h3>
                {(eventDate || eventLocation) && (
                  <p className="mt-1 text-sm text-gray-300">
                    {eventDate ? `${eventDate}` : ""}
                    {eventDate && eventLocation ? " • " : ""}
                    {eventLocation ? `${eventLocation}` : ""}
                  </p>
                )}
              </div>
              <button aria-label="Close" onClick={() => { trigger('light'); onClose(); }} className="rounded-full p-2 text-white/80 hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm sm:text-base text-gray-300">Ticket type</label>
                <div className="space-y-3">
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => {
                        trigger('light');
                        setSelectedTierId(tier.id);
                      }}
                      className={`w-full rounded-xl border p-4 text-left transition min-h-[56px] ${(selectedTier?.id ?? "") === tier.id ? "border-white/60 bg-white/10" : "border-white/10 hover:border-white/20"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm sm:text-base">{tier.name}</div>
                          {typeof tier.available === "number" && (
                            <div className="text-xs text-gray-400">{tier.available} left</div>
                          )}
                        </div>
                        <div className="text-right text-sm sm:text-base text-gray-200">
                          {tier.price === 0 ? "0 Turkish Lira" : new Intl.NumberFormat(undefined, { style: "currency", currency }).format(tier.price)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="ticket-quantity" className="mb-2 block text-sm sm:text-base text-gray-300">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      className="rounded-lg border border-white/10 px-4 py-3 text-lg hover:border-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      onClick={() => {
                        trigger('light');
                        setQuantity((q) => Math.max(1, q - 1));
                      }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      id="ticket-quantity"
                      aria-label="Ticket quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="w-20 sm:w-24 rounded-lg border border-white/10 bg-transparent p-3 text-center outline-none focus:border-white/20 min-h-[44px] text-sm sm:text-base"
                    />
                    <button
                      className="rounded-lg border border-white/10 px-4 py-3 text-lg hover:border-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      onClick={() => {
                        trigger('light');
                        setQuantity((q) => q + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="ticket-email" className="mb-2 block text-sm sm:text-base text-gray-300">Email (for receipt)</label>
                  <input
                    type="email"
                    id="ticket-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-transparent p-3 outline-none placeholder:text-white/40 focus:border-white/20 min-h-[44px] text-sm sm:text-base"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="text-sm sm:text-base text-gray-300">
                    Total
                  </div>
                  <div className="text-lg sm:text-xl font-semibold">
                    {total === 0 ? "0 Turkish Lira" : new Intl.NumberFormat(undefined, { style: "currency", currency }).format(total)}
                  </div>
                </div>

                {issueError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                    {issueError}
                  </div>
                )}

                {issuedTickets.length > 0 && (
                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-white/90">Your ticket is ready</div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {issuedTickets.map((t) => (
                        <a key={t.id} href={t.qr_public_url} target="_blank" rel="noreferrer" className="group rounded-lg border border-white/10 p-3 hover:border-white/20">
                          <img src={t.qr_public_url} alt="Ticket QR" className="w-full rounded-md" />
                          <div className="mt-2 truncate text-xs text-white/70 group-hover:text-white/90">Code: {t.code}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  disabled={(total === 0 && !isEmailValid) || (total > 0 && !ticketUrl) || isIssuing}
                  onClick={() => {
                    if (total === 0) {
                      trigger('medium');
                      issueFreeTickets();
                    } else {
                      trigger('medium');
                      handleCheckout();
                    }
                  }}
                  className={`w-full rounded-xl px-5 py-4 font-medium transition min-h-[52px] text-sm sm:text-base ${(total === 0 ? (isEmailValid ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white/50 cursor-not-allowed") : (ticketUrl ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white/50 cursor-not-allowed"))
                    }`}
                >
                  {isIssuing ? "Issuing..." : total === 0 ? (isEmailValid ? "Get Free Ticket" : "Enter email to get ticket") : "Continue to checkout"}
                </button>

                <details className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
                  <summary className="cursor-pointer select-none text-sm text-white/90">Rules</summary>
                  <div className="pt-3">
                    <EventRules />
                  </div>
                </details>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TicketPurchaseModal;


