import type { Metadata } from "next";
import MerchPageClient from "./MerchPageClient";
import { redirect } from "next/navigation";
import { MERCH_ENABLED } from "@/lib/site-features";

export const metadata: Metadata = {
  title: "Merch — Afterhours & No.303 | OriginsRadio",
  description: "Explore the first OriginsRadio merch collection: Afterhours scarf caps and No.303 Acid Bass. Discover the campaign and interactive 3D preview. Coming soon.",
  alternates: { canonical: "/merch" },
  openGraph: {
    title: "Merch — Afterhours & No.303 | OriginsRadio",
    description: "OriginsRadio merch is coming soon with the Afterhours and 303 Acid Bass series.",
    images: ["/merch/acid-bass-303.jpg"],
  },
};

export default function MerchPage() {
  if (!MERCH_ENABLED) redirect("/");
  return <MerchPageClient />;
}
