import { ShieldAlert, Languages } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EventRulesProps {
  className?: string;
}

const rules = {
  en: [
    "This event is for participants aged 18 and above.",
    "Bringing food, drinks, sharp, piercing, or flammable items into the event area is prohibited.",
    "Event participants accept that photography & video recording will take place within the event area.",
    "Bringing professional recording devices and filming without written permission is prohibited.",
    "It is expected to avoid filming that would disturb other guests and performing artists with non-professional devices and violate privacy. Flash photography is strictly prohibited.",
    "Organization and venue authorities have the right to deny entry to the event and backstage areas to individuals they deem inappropriate.",
    "Particular attention is paid to gender balance, attitude, tone, dress code, and general appropriateness, and entry may be denied for these and similar reasons. This decision is entirely at the door's discretion. Our door's decision is final and valid under all circumstances.",
    "Refunds, cancellations, or exchanges are not available for purchased tickets.",
    "The right to use photos and videos of event participants in promotional materials belongs to the organizer, and participants accept this right by attending the event.",
  ],
  tr: [
    "Etkinlik 18 yaş ve üzeri katılımcılar içindir.",
    "Etkinlik alanına yiyecek içecek, kesici, delici veya yanıcı alet sokmak yasaktır.",
    "Etkinlik katılımcıları etkinlik alanı içerisinde fotoğraf & video çekiminin yapılacağını kabul eder.",
    "Yazılı izin olmadığı takdirde profesyonel görüntü kayıt cihazları sokmak ve çekim yapmak yasaktır.",
    "Profesyonel olmayan cihazlarla, diğer misafirleri ve performans veren sanatçıları rahatsız edecek ve özel hayatının gizliliğini ihlal edecek çekim yapılmamasına özen gösterilmesi beklenmektedir. Flaşlı çekim yapmak kesinlikle yasaktır.",
    "Organizasyon ve mekan yetkilileri uygun görmedikleri kişileri etkinlik ve backstage alanına almama hakkına sahiptir.",
    "Kadın-erkek sayısındaki dengeye, tavır, üslup, giyim ve genel anlamıyla uygunluk konularına özellikle özen gösterilmekte olup bu ve bu gibi sebeplerden ötürü giriş yapılamayabilir. Bunun kararı tamamen kapı inisiyatifindedir. Kapımızın kararı sondur ve her koşulda geçerlidir.",
    "Satın alınan biletlerde iade, iptal veya değişim yapılamaz.",
    "Etkinliğe katılan kişilerin fotoğraf ve video çekimlerinin tanıtım materyallerinde kullanım hakkı organizatöre ait olup katılımcı etkinliğe katılarak bu hakkın kullanılmasını kabul etmektedir.",
  ],
};

const titles = {
  en: "Rules",
  tr: "Kurallar",
};

const EventRules = ({ className }: EventRulesProps) => {
  const { trigger } = useWebHaptics();
  const [language, setLanguage] = useState<"en" | "tr">("en");

  const toggleLanguage = () => {
    trigger('light');
    setLanguage(language === "en" ? "tr" : "en");
  };

  return (
    <section className={className} aria-labelledby="event-rules-heading">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-white/90" />
            <h2 id="event-rules-heading" className="text-lg font-semibold">
              {titles[language]}
            </h2>
          </div>
          <Button
            onClick={toggleLanguage}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            <Languages className="h-4 w-4" />
            {language === "en" ? "TR" : "EN"}
          </Button>
        </div>
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-200">
          {rules[language].map((rule, idx) => (
            <li key={idx}>{rule}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default EventRules;


