import ThisWeekComingSoon from "./ThisWeekComingSoon";
import { pageMetadata } from "@/lib/seo";

export const metadata = { ...pageMetadata('This Week — Ankara', 'Ankara’da çok yakında. OriginsRadio şehir programı hazırlanıyor.', '/thisweek'), robots: { index: false, follow: true } };

export default function ThisWeekPage() {
  return <ThisWeekComingSoon />;
}
