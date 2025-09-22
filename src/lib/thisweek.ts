import { getSupabaseClient } from "@/lib/supabase";

export interface ThisWeekSheetRow {
  event_artist: string | null;
  price: string | number | null;
  image_url: string | null;
  club_name: string | null;
  event_url: string | null;
  event_date: string | null; // expected in YYYY-MM-DD
}

export async function fetchThisWeekRows(): Promise<ThisWeekSheetRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("thisweek")
    .select("club_name,event_artist,price,image_url,event_date,event_url")
    .order("event_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    club_name: row.club_name ?? null,
    event_artist: row.event_artist ?? null,
    price: row.price ?? null,
    image_url: row.image_url ?? null,
    event_date: row.event_date ?? null,
    event_url: row.event_url ?? null,
  }));
}

