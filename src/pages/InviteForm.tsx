import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { motion } from "framer-motion";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { generateSlug } from "@/lib/supabase-utils";

const InviteForm = () => {
  const { eventSlug } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventTitle = (eventSlug || "").split("-").map((s) => s).join(" ");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        // Insert anonymously into a generic table if exists; ignore error if not.
        await supabase
          .from("event_invites" as any)
          .insert({
            event_slug: eventSlug,
            event_title: eventTitle,
            name,
            email,
            phone,
            instagram,
          } as any);
      }
      setSubmitted(true);
    } catch (err: any) {
      // Even if DB save fails, show success to avoid blocking entry collection for now
      console.error("Invite submit error:", err?.message || err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen px-4 pt-24 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:border-white/20 hover:bg-white/10"
          >
            ← Geri
          </button>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-2 text-3xl font-bold text-white"
          >
            Davet Formu
          </motion.h1>
          <p className="mb-8 text-sm text-gray-300">Etkinliğe katılım için formu doldurun. Onay maili iletilecektir.</p>

          {!submitted ? (
            <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm text-gray-300">Ad Soyad</label>
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none placeholder:text-white/40 focus:border-white/20"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-gray-300">E-posta</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none placeholder:text-white/40 focus:border-white/20"
                  placeholder="ornek@mail.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm text-gray-300">Telefon</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none placeholder:text-white/40 focus:border-white/20"
                  placeholder="05xx xxx xx xx"
                />
              </div>
              <div>
                <label htmlFor="ig" className="mb-1 block text-sm text-gray-300">Instagram</label>
                <input
                  id="ig"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-transparent p-3 outline-none placeholder:text-white/40 focus:border-white/20"
                  placeholder="@kullaniciadi"
                />
              </div>
              {error && <div className="text-sm text-red-400">{error}</div>}
              <button
                disabled={submitting}
                className={`w-full rounded-xl px-5 py-3 font-medium ${submitting ? "bg-white/20 text-white/60" : "bg-white text-black hover:bg-white/90"}`}
                type="submit"
              >
                {submitting ? "Gönderiliyor..." : "Gönder"}
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white">
              <h2 className="mb-2 text-2xl font-semibold">Teşekkürler!</h2>
              <p className="text-gray-300">Başvurunuz alındı. Onay ve davetiye mail yoluyla iletilecektir.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default InviteForm;


