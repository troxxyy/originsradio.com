import { getSupabaseClient } from "@/lib/supabase";

export interface ThisWeekSheetRow {
  id: string | null;
  event_artist: string | null;
  price: string | number | null;
  image_url: string | null;
  club_name: string | null;
  event_url: string | null;
  event_date: string | null; // expected in YYYY-MM-DD
  lineup_names?: string[] | null;
}

export async function fetchThisWeekRows(): Promise<ThisWeekSheetRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("thisweek")
    .select("id,club_name,event_artist,price,image_url,event_date,event_url")
    .order("event_date", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []).map((row: any) => ({
    id: row.id ?? null,
    club_name: row.club_name ?? null,
    event_artist: row.event_artist ?? null,
    price: row.price ?? null,
    image_url: row.image_url ?? null,
    event_date: row.event_date ?? null,
    event_url: row.event_url ?? null,
    lineup_names: null as string[] | null,
  }));

  // Build lineup map via join table if available
  const eventIds = rows.map((r) => r.id).filter(Boolean) as string[];
  if (eventIds.length > 0) {
    const { data: lineupRows, error: lineupError } = await supabase
      .from("thisweek_lineup")
      .select("thisweek_id,lineup,position,artists(name)")
      .in("thisweek_id", eventIds)
      .order("position", { ascending: true });
    if (!lineupError && Array.isArray(lineupRows)) {
      const byEvent: Record<string, { position: number | null; name: string }[]> = {};
      for (const lr of lineupRows as any[]) {
        const thisweek_id: string | undefined = lr.thisweek_id;
        const position: number | null = typeof lr.position === "number" ? lr.position : null;
        const artistName: string | undefined = lr.artists?.name;
        const displayName = artistName || lr.lineup;
        if (!thisweek_id || !displayName) continue;
        if (!byEvent[thisweek_id]) byEvent[thisweek_id] = [];
        byEvent[thisweek_id].push({ position, name: displayName });
      }
      for (const row of rows) {
        const entries = row.id ? byEvent[row.id] : undefined;
        row.lineup_names = entries
          ? entries
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((e) => e.name)
          : null;
      }
    }
  }

  // Fallback: if no lineup_names, use single event_artist field when present
  for (const r of rows) {
    if ((!r.lineup_names || r.lineup_names.length === 0) && r.event_artist) {
      r.lineup_names = [r.event_artist];
    }
  }

  return rows;
}


