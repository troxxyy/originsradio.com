import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function sseWrite(controller: ReadableStreamDefaultController, data: unknown, event?: string) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  const named = event ? `event: ${event}\n${payload}` : payload;
  controller.enqueue(new TextEncoder().encode(named));
}

function computeBassHighFrame(amplitude: number, state: { lp: number }): { bass: number; high: number } {
  const clamped = Math.max(0, Math.min(1, amplitude));
  const alpha = 0.06;
  state.lp = state.lp + alpha * (clamped - state.lp);
  const bass = state.lp;
  const highRaw = clamped - state.lp;
  const high = Math.max(0, Math.min(1, (highRaw + 0.5) * 1.2));
  return { bass, high };
}

async function fetchPeaksArray(url: string): Promise<number[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch peaks: ${res.status}`);
  const json = await res.json().catch(() => null);
  if (Array.isArray(json)) return json as number[];
  if (json && Array.isArray(json.peaks)) return json.peaks as number[];
  if (json && Array.isArray(json.data)) return json.data as number[];
  throw new Error("Unsupported peaks JSON format");
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const setIdParam = url.searchParams.get("set_id");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      sseWrite(controller, { ok: true, message: "connected" }, "open");

      try {
        let peaksUrl: string | null = null;
        let effectiveSetId: string | null = null;

        if (supabaseUrl && supabaseAnon) {
          const supabase = createClient(supabaseUrl, supabaseAnon);
          let setRow: any | null = null;

          if (setIdParam) {
            const { data, error } = await supabase
              .from("sets")
              .select("id,title,peaks_url,release_date")
              .eq("id", setIdParam)
              .single();
            if (error) throw error;
            setRow = data;
          } else {
            const { data, error } = await supabase
              .from("sets")
              .select("id,title,peaks_url,release_date")
              .order("release_date", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (error) throw error;
            setRow = data;
          }

          if (!setRow) throw new Error("No set found");
          effectiveSetId = setRow.id;
          peaksUrl = setRow.peaks_url ?? null;
          sseWrite(controller, { setId: effectiveSetId, release_date: setRow.release_date }, "meta");
        } else {
          if (!setIdParam) throw new Error("Missing set_id and no server credentials available");
          throw new Error("Server not configured with SUPABASE_URL/KEY to resolve peaks_url");
        }

        if (!peaksUrl) throw new Error("Selected set has no peaks_url");

        const peaks = await fetchPeaksArray(peaksUrl);
        if (!peaks.length) throw new Error("Empty peaks array");

        const state = { lp: 0 };
        let i = 0;
        const fps = 20;
        const intervalMs = Math.round(1000 / fps);

        const timer = setInterval(() => {
          const amp = peaks[i % peaks.length];
          const frame = computeBassHighFrame(typeof amp === "number" ? amp : 0, state);
          sseWrite(controller, frame);
          i += 1;
        }, intervalMs);

        const keepAlive = setInterval(() => {
          sseWrite(controller, { t: Date.now() }, "ka");
        }, 15000);

        (req as any).signal?.addEventListener?.("abort", () => {
          clearInterval(timer);
          clearInterval(keepAlive);
          try { controller.close(); } catch (_) {}
        });
      } catch (err) {
        sseWrite(controller, { error: (err as Error).message }, "error");
        try { controller.close(); } catch (_) {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "*",
    },
  });
});


