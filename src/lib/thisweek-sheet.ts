export interface ThisWeekSheetRow {
  event_artist: string | null;
  price: string | number | null;
  image_url: string | null;
  club_name: string | null;
  event_url: string | null;
  event_date: string | null;
}

// Google Sheets GViz JSON endpoint for the provided sheet
const SHEET_ID = "1PwbMOs2Ty8KYfR2Ni0L-18SGLMMO378fSrHACac3Ht8";
const GID = "1113759556";
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tqx=out:json`;

// Published CSV endpoint (preferred)
const PUBLISHED_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTXMAVaKwu7SPGlf89Dvumuk6ksp-e5OJDqdTm2jNDsHmUAq1UPDBpR7GfIpBP5CjAlHdJ_SdT-iswN/pub?gid=1113759556&single=true&output=csv";

// Direct export endpoint (works if the sheet is shared publicly with link access)
const EXPORT_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

type GvizCell = { v: any; f?: string } | null;
interface GvizResponse {
  table: {
    cols: { label: string }[];
    rows: { c: GvizCell[] }[];
  };
}

function stripGvizWrapper(text: string): string {
  // GViz wraps JSON like: google.visualization.Query.setResponse({...});
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) return "{}";
  return text.slice(firstBrace, lastBrace + 1);
}

export async function fetchThisWeekSheetRows(): Promise<ThisWeekSheetRow[]> {
  const res = await fetch(GVIZ_URL, { cache: "no-store" });
  const txt = await res.text();
  const json = JSON.parse(stripGvizWrapper(txt)) as GvizResponse;
  const labels = json.table.cols.map((c) => (c.label || "").trim());

  const rows: ThisWeekSheetRow[] = json.table.rows
    .map((r) => {
      const obj: Record<string, any> = {};
      r.c.forEach((cell, idx) => {
        const key = labels[idx]?.toLowerCase().replace(/\s+/g, "_");
        if (!key) return;
        obj[key] = cell?.v ?? null;
      });
      return obj as ThisWeekSheetRow;
    })
    // Filter out empty club rows
    .filter((r) => (r.club_name ?? "").toString().trim().length > 0);

  return rows;
}

function parseCsv(text: string): ThisWeekSheetRow[] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (char === ',') {
        current.push(field);
        field = "";
        i++;
        continue;
      }
      if (char === '\n' || char === '\r') {
        // finish field and row
        current.push(field);
        field = "";
        if (current.length > 1 || current[0] !== "") {
          rows.push(current);
        }
        current = [];
        // consume \r\n as one
        if (char === '\r' && text[i + 1] === '\n') i++;
        i++;
        continue;
      }
      field += char;
      i++;
    }
  }
  // flush last field/row
  current.push(field);
  if (current.length > 1 || current[0] !== "") rows.push(current);

  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const dataRows = rows.slice(1);
  const out: ThisWeekSheetRow[] = dataRows.map((r) => {
    const obj: Record<string, any> = {};
    header.forEach((key, idx) => {
      obj[key] = r[idx] !== undefined ? r[idx] : null;
    });
    return obj as ThisWeekSheetRow;
  });
  return out.filter((r) => (r.club_name ?? "").toString().trim().length > 0);
}

async function fetchFromPublishedCsv(): Promise<ThisWeekSheetRow[]> {
  const url = `${PUBLISHED_CSV_URL}&_=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
  const txt = await res.text();
  return parseCsv(txt);
}

async function fetchFromExportCsv(): Promise<ThisWeekSheetRow[]> {
  const url = `${EXPORT_CSV_URL}&_=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Export CSV fetch failed: ${res.status}`);
  const txt = await res.text();
  return parseCsv(txt);
}

export async function fetchThisWeekRows(): Promise<ThisWeekSheetRow[]> {
  try {
    const exportRows = await fetchFromExportCsv();
    if (exportRows.length > 0) {
      console.info("ThisWeek: using export CSV");
      return exportRows;
    }
  } catch (e) {
    console.warn("ThisWeek: export CSV failed", e);
  }
  try {
    const csvRows = await fetchFromPublishedCsv();
    if (csvRows.length > 0) {
      console.info("ThisWeek: using published CSV");
      return csvRows;
    }
  } catch (e) {
    console.warn("ThisWeek: published CSV failed", e);
  }
  // Fallback to GViz
  console.info("ThisWeek: falling back to GViz");
  return fetchThisWeekSheetRows();
}


