import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { getSupabaseClient } from "@/lib/supabase";

interface TicketRow {
  email: string | null;
  event_title: string;
  event_date: string | null;
  event_location: string | null;
}

export default function TicketVerify() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketRow | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("tickets")
          .select("email, event_title, event_date, event_location")
          .eq("code", code)
          .single();
        if (error) throw error;
        setTicket(data as TicketRow);
      } catch (e: any) {
        setError(e?.message ?? "Could not load ticket");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [code]);

  return (
    <PageLayout>
      <div className="min-h-screen px-6 pt-28 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl">
          {loading && <div>Loading...</div>}
          {!loading && error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-200">{error}</div>}
          {!loading && !error && ticket && (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold">Ticket</h1>
              <div className="rounded-xl border border-white/10 p-4">
                <div className="text-sm text-white/70">Event</div>
                <div className="text-lg">{ticket.event_title}</div>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <div className="text-sm text-white/70">Email</div>
                <div className="text-lg">{ticket.email ?? "—"}</div>
              </div>
              {ticket.event_date && (
                <div className="rounded-xl border border-white/10 p-4">
                  <div className="text-sm text-white/70">Date</div>
                  <div className="text-lg">{ticket.event_date}</div>
                </div>
              )}
              {ticket.event_location && (
                <div className="rounded-xl border border-white/10 p-4">
                  <div className="text-sm text-white/70">Location</div>
                  <div className="text-lg">{ticket.event_location}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
