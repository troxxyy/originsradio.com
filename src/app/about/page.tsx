'use client'

import { motion, useReducedMotion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import Navigation from "@/components/Navigation";
import SocialBubbles from "@/components/social/SocialBubbles";
import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import {
  Heart,
  Coffee,
  Music,
  Zap,
  ArrowRight,
  Radio,
  CalendarDays,
  Sparkles,
  Shield,
  Target,
  Users,
  Volume2,
  Languages,
} from "lucide-react";
import Link from "next/link";

const aboutImages = [
  "/origins-aboutimage/567949539_18408359101190686_3706084319895230549_n.jpg",
  "/origins-aboutimage/568018821_18408359083190686_6401480919082689231_n.jpg",
  "/origins-aboutimage/568281291_18408359002190686_1332424567133244148_n.jpg",
  "/origins-aboutimage/568406581_18408359056190686_2980302082904075963_n.jpg",
  "/origins-aboutimage/568638018_18408359146190686_1706852911949315753_n.jpg",
  "/origins-aboutimage/568673904_18408359137190686_223340303331738417_n.jpg",
  "/origins-aboutimage/568696680_18408358981190686_6910519163900839445_n.jpg",
  "/origins-aboutimage/568747590_18408359047190686_3590576891216392853_n.jpg",
  "/origins-aboutimage/568906143_18408359011190686_8799830714360297345_n.jpg",
  "/origins-aboutimage/569029709_18408359029190686_2025088144231072466_n.jpg",
  "/origins-aboutimage/569066725_18408359128190686_2614623633597991346_n.jpg",
];

const teamMembers = {
  en: [
    {
      name: "Kaan",
      fullName: "Kaan Şimşir",
      role: "founder, programming",
      image: "/team/castor.jpeg",
      quote: "if it’s honest, it belongs here.",
      story:
        "origins started as a late night idea, then we kept showing up until it became real. no perfect timing, just momentum and stubbornness.",
      funFact: "keeps way too many drafts and voice notes",
      favoriteMoment: "the first time a DJ said the set brought them listeners",
    },
    {
      name: "Sina",
      fullName: "Sina Çetinkaya",
      role: "tech, product",
      image: "/team/sina.jpeg",
      quote: "make it fast. make it simple. make it work at 3am.",
      story:
        "builds the site, the stream plumbing, and the boring infrastructure that saves the night when something breaks. obsessed with smooth playback.",
      funFact: "has opinions about latency that nobody asked for",
      favoriteMoment: "shipping a small fix that instantly feels better",
    },
  ],
  tr: [
    {
      name: "Kaan",
      fullName: "Kaan Şimşir",
      role: "kurucu, programlama",
      image: "/team/castor.jpeg",
      quote: "dürüstse, buraya aittir.",
      story:
        "Origins, gece yarısı ortaya çıkan bir fikirle başladı. sonra gerçek olana kadar istikrarlı şekilde devam ettik. mükemmel zamanlama yoktu, sadece momentum ve inat.",
      funFact: "fazlasıyla çok taslak ve ses notu biriktiriyor",
      favoriteMoment:
        "bir DJ’in, setin gerçekten dinleyici getirdiğini söylediği ilk an",
    },
    {
      name: "Sina",
      fullName: "Sina Çetinkaya",
      role: "teknoloji, ürün",
      image: "/team/sina.jpeg",
      quote: "hızlı olsun. basit olsun. gece 3’te de çalışsın.",
      story:
        "siteyi, yayın altyapısını ve bir şey bozulduğunda geceyi kurtaran görünmeyen işleri kuruyor. hedefi hep aynı: kesintisiz, akıcı dinleme.",
      funFact: "kimsenin istemediği kadar gecikme fikri var",
      favoriteMoment:
        "küçük bir düzeltmenin anında daha iyi hissettirmesi ve bunu yayına almak",
    },
  ],
};

const copy = {
  en: {
    hero: {
      eyebrow: "a note from the people behind origins",
      titleTop: "origins radio keeps the night human.",
      titleMid: "not a brand.",
      titleBottom: "a small crew making room for the music we love.",
      paragraphs: [
        "origins radio brings selection led electronic music and scene culture onto the same line.",
        "we broadcast, we build events, we shape a visual world.",
        "everything points to the same thing: a flow that keeps you in, the right moment, the right atmosphere.",
        "for us it’s not about crowds, it’s about the feeling. selection comes first. details make the difference.",
      ],
      stats: [
        { icon: Coffee, label: "started", value: "2023" },
        { icon: Music, label: "focus", value: "taste first" },
        { icon: Heart, label: "built for", value: "community" },
        { icon: Zap, label: "hours", value: "late" },
      ],
      actions: [
        { label: "listen now", href: "/radio", primary: true },
        { label: "see events", href: "/events", primary: false },
      ],
    },
    origin: {
      eyebrow: "the real beginning",
      title: "after covid, we took it seriously",
      subtitle:
        "online music was endless, but the spaces around it started to feel empty. scenes turned into content, and the best parts of nightlife did not translate.",
      paragraphs: [
        "when the pandemic ended, everyone rushed to digital. we did not choose to just “exist” online. we chose to be good. we built a clear line: strong selection, consistent taste, clean pacing.",
        "over time, discipline brought growth. bigger festivals, more stages, a wider portfolio. a circle built with more than forty DJs. a website that keeps a record.",
        "the core is still the same: a flow that keeps the room alive.",
      ],
      calloutTitle: "a space we build together",
      calloutBody:
        "our strongest side is not growth. it’s belonging. people meeting in the same moment, even if they do not know each other.",
      calloutLine: "",
      buttons: {
        join: "email us",
        artists: "browse artists",
      },
    },
    whatThisIs: {
      eyebrow: "what this is",
      title: "radio, events, visuals",
      subtitle: "three parts, one goal: protect a certain kind of night.",
      cards: [
        {
          icon: Radio,
          title: "radio",
          text: "shows, resident sets, guest mixes. clean selection, clean tempo.",
          cta: { label: "shows", href: "/radio/schedule" },
        },
        {
          icon: CalendarDays,
          title: "events",
          text: "small rooms or big stages. if sound and flow are right, the night works.",
          cta: { label: "events", href: "/events" },
        },
        {
          icon: Sparkles,
          title: "visuals",
          text: "identity, posters, motion, stage visuals. the feeling before the music hits.",
          cta: { label: "visuals", href: "/gocrazy" },
        },
      ],
    },
    protect: {
      eyebrow: "what we protect",
      title: "a night that still feels real",
      subtitle: "we are not trying to be everywhere. we are trying to keep this alive.",
      bullets: [
        { icon: Shield, title: "phone free energy", text: "the kind of moment where you forget your screen exists." },
        { icon: Users, title: "people over metrics", text: "friends made from one track. community over numbers." },
        { icon: Volume2, title: "sound is the point", text: "music is not a backdrop here. it’s the reason." },
        { icon: Target, title: "taste over templates", text: "we’d rather be specific than be generic." },
      ],
    },
    booking: {
      eyebrow: "how we choose artists",
      title: "we do not book genres",
      subtitle: "we book taste, intention, and respect for the room.",
      list: [
        "a clear point of view",
        "pacing and control",
        "bravery without ego",
        "respect for the crowd",
      ],
      note:
        "some nights are peak time. some nights are weird. both matter.",
    },
    wont: {
      eyebrow: "what we will not do",
      title: "simple rules, no performance",
      subtitle: "no pretending. no corporate voice. just how we operate.",
      leftTitle: "we will not",
      rightTitle: "we do",
      left: [
        "chase names we do not believe in",
        "force artists into a template",
        "treat people like content",
        "sacrifice sound for optics",
        "pretend it is effortless",
      ],
      right: [
        "fix problems fast and keep moving",
        "pay fairly when we book",
        "promote properly",
        "build long term relationships",
        "keep learning and improving",
      ],
      ctas: {
        email: "email us",
        instagram: "instagram",
        mailSubject: "origins radio booking or collab",
      },
    },
    archive: {
      eyebrow: "archive",
      title: "some nights we kept",
      subtitle: "photos from moments you did not want to end.",
      captions: [
        "lights down",
        "hands up",
        "one more track",
        "crowd locked in",
        "afterhours",
        "new friends",
        "big bass, small room",
        "no phones, just dancing",
        "stayed until the end",
        "we’ll remember this",
        "same place next time",
        "that drop",
      ],
      callout:
        "we do not only build the night. we keep some of it here.",
    },
    team: {
      eyebrow: "team",
      title: "the people doing the work",
      subtitle: "two roles, one obsession: make it feel right.",
      hintClosed: "tap for details",
    },
    contact: {
      title: "want to reach us",
      p1: "pitch a show, suggest an artist, or talk events. send a message.",
      p2: "we read everything. replies might be slow when we’re building, but we do not ignore people.",
      p3: "thanks for being here.",
      email: "info@originsradio.com",
      instagram: "https://www.instagram.com/origins.radio/",
      cards: {
        emailTitle: "email",
        emailSubtitle: "best for collabs and bookings",
        instagramTitle: "instagram dm",
        instagramSubtitle: "quick questions live here",
      },
      orVibe: "or just vibe",
      buttons: [
        { label: "events", href: "/events" },
        { label: "schedule", href: "/radio/schedule" },
        { label: "artists", href: "/artists" },
      ],
      footer: "kaan, sina",
      thanks: "thanks for reading",
    },
  },
  tr: {
    hero: {
      eyebrow: "Origins’in arkasındaki ekipten bir not",
      titleTop: "Origins Radio geceyi insan tutar.",
      titleMid: "marka değil.",
      titleBottom: "sevdiğimiz müzik için alan açan küçük bir ekip.",
      paragraphs: [
        "Origins Radio, seçkisi güçlü elektronik müziği sahne kültürüyle aynı çizgide buluşturur.",
        "yayın yaparız, etkinlik kurgularız, görsel bir dünya inşa ederiz.",
        "her işin ortak noktası aynıdır: insanı içeride tutan bir akış, doğru an, doğru atmosfer.",
        "bizim için mesele kalabalık değil, his. seçki önce gelir, detaylar farkı yaratır.",
      ],
      stats: [
        { icon: Coffee, label: "başlangıç", value: "2023" },
        { icon: Music, label: "odak", value: "önce zevk" },
        { icon: Heart, label: "kimin için", value: "topluluk" },
        { icon: Zap, label: "saatler", value: "gece" },
      ],
      actions: [
        { label: "şimdi dinle", href: "/radio", primary: true },
        { label: "etkinliklere bak", href: "/events", primary: false },
      ],
    },
    origin: {
      eyebrow: "gerçek başlangıç",
      title: "koronadan sonra, işi ciddiye aldık",
      subtitle:
        "online müzik sonsuzdu ama etrafındaki alanlar giderek boş hissettirmeye başladı. sahneler içeriğe dönüştü ve gece hayatının en iyi tarafları ekrana sığmadı.",
      paragraphs: [
        "pandemi bittiğinde herkes dijitale koştu. biz dijitalde sadece “var olmayı” değil, iyi olmayı seçtik. seçkisi güçlü bir hat kurduk. yayın yaptık, etkinlik kurguladık, görsel bir dünya ürettik.",
        "zamanla bu disiplin büyümeyi getirdi. büyük festivaller, daha çok sahne, daha geniş bir portfolyo. kırkın üzerinde DJ ile oluşan bir çevre. web site ile birlikte kayıt tutan bir yapı.",
        "origins’in özü hâlâ aynı: insanı tutan bir akış.",
      ],
      calloutTitle: "birlikte kurulan bir alan",
      calloutBody:
        "en güçlü tarafımız büyüme değil. aidiyet. insanların birbirini tanımasa bile aynı anda aynı şeyde buluşması.",
      calloutLine: "",
      buttons: {
        join: "bize mail at",
        artists: "sanatçıları keşfet",
      },
    },
    whatThisIs: {
      eyebrow: "origins radio nedir",
      title: "radyo, etkinlikler, görsel dünya",
      subtitle: "üç parça, tek amaç: gece hissini korumak.",
      cards: [
        {
          icon: Radio,
          title: "radyo",
          text: "programlar, resident setler, konuk miksler. seçki net, tempo temiz.",
          cta: { label: "yayınlar", href: "/radio/schedule" },
        },
        {
          icon: CalendarDays,
          title: "etkinlikler",
          text: "küçük oda da olur, büyük sahne de. ses ve akış doğruysa gece çalışır.",
          cta: { label: "etkinlikler", href: "/events" },
        },
        {
          icon: Sparkles,
          title: "görsel dünya",
          text: "kimlik, afiş, hareket, sahne görseli. müzik başlamadan önce gelen his.",
          cta: { label: "görseller", href: "/gocrazy" },
        },
      ],
    },
    protect: {
      eyebrow: "koruduğumuz şey",
      title: "hâlâ gerçek hissettiren bir gece",
      subtitle:
        "her yerde olmaya çalışmıyoruz. bunu canlı tutmaya çalışıyoruz.",
      bullets: [
        {
          icon: Shield,
          title: "telefonsuz enerji",
          text: "ekranın varlığını unuttuğun türden anlar.",
        },
        {
          icon: Users,
          title: "metriklerden önce insanlar",
          text: "tek bir parçadan çıkan dostluklar. sayılardan önce topluluk.",
        },
        {
          icon: Volume2,
          title: "asıl mesele ses",
          text: "müzik burada arka plan değil. sebep bu.",
        },
        {
          icon: Target,
          title: "şablonlardan önce zevk",
          text: "genel olmaktansa spesifik olmayı tercih ederiz.",
        },
      ],
    },
    booking: {
      eyebrow: "sanatçıları nasıl seçiyoruz",
      title: "tür değil, yaklaşım seçiyoruz",
      subtitle: "zevk, niyet ve odaya saygı seçiyoruz.",
      list: [
        "net bir bakış açısı",
        "tempo ve kontrol",
        "egosuz cesaret",
        "kalabalığa saygı",
      ],
      note: "bazı geceler zirve saatler, bazı geceler garip. ikisi de kıymetli.",
    },
    wont: {
      eyebrow: "yapmayacağımız şeyler",
      title: "basit prensipler, gösteriş yok",
      subtitle: "rol yapmıyoruz. kurumsal dil yok. sadece çalışma biçimimiz.",
      leftTitle: "yapmayız",
      rightTitle: "yaparız",
      left: [
        "inanmadığımız isimlerin peşinden koşmak",
        "sanatçıları bir şablona zorlamak",
        "insanlara içerik gibi davranmak",
        "görüntü uğruna sesten ödün vermek",
        "her şey zahmetsizmiş gibi yapmak",
      ],
      right: [
        "sorunları hızlı çözmek ve yola devam etmek",
        "rezervasyon yaptığımızda adil ödeme yapmak",
        "düzgün tanıtmak",
        "uzun vadeli ilişkiler kurmak",
        "öğrenmeye açık şekilde devam etmek",
      ],
      ctas: {
        email: "bize mail at",
        instagram: "instagram",
        mailSubject: "Origins Radio booking ya da iş birliği",
      },
    },
    archive: {
      eyebrow: "arşiv",
      title: "sakladığımız bazı geceler",
      subtitle: "gecenin bitmesini istemediğin anların fotoğrafları.",
      captions: [
        "ışıklar indi",
        "eller havada",
        "bir parça daha",
        "kalabalık kilitlendi",
        "afterhours",
        "yeni tanışmalar",
        "büyük bas, küçük oda",
        "telefon yok, dans var",
        "sonuna kadar kaldık",
        "bunu hatırlayacağız",
        "bir dahaki sefere yine",
        "o drop anı",
      ],
      callout:
        "biz geceyi sadece kurmuyoruz. bir kısmını da burada tutuyoruz.",
    },
    team: {
      eyebrow: "ekip",
      title: "işi yapan insanlar",
      subtitle: "iki rol, tek takıntı: doğru hissettirmek.",
      hintClosed: "detaylar için dokun",
    },
    contact: {
      title: "bize ulaşmak ister misin",
      p1: "bir program öner, bir sanatçı öner ya da etkinlikleri konuşalım. mesaj at.",
      p2: "her şeyi okuyoruz. üretim dönemlerinde dönüşler yavaş olabilir ama kimseyi görmezden gelmiyoruz.",
      p3: "burada olduğun için teşekkürler.",
      email: "info@originsradio.com",
      instagram: "https://www.instagram.com/origins.radio/",
      cards: {
        emailTitle: "e posta",
        emailSubtitle: "iş birlikleri ve booking için en iyisi",
        instagramTitle: "instagram dm",
        instagramSubtitle: "hızlı sorular genelde burada",
      },
      orVibe: "ya da sadece ak",
      buttons: [
        { label: "etkinlikler", href: "/events" },
        { label: "program", href: "/radio/schedule" },
        { label: "sanatçılar", href: "/artists" },
      ],
      footer: "kaan, sina",
      thanks: "okuduğun için teşekkürler",
    },
  },
};

/**
 * deterministic shuffle using Linear Congruential Generator (LCG)
 */
function seededShuffle<T>(arr: T[], seed: number) {
  const out = [...arr];
  const a = 1103515245;
  const c = 12345;
  const m = 2 ** 31;
  let state = seed >>> 0;

  const rand = () => {
    state = (a * state + c) % m;
    return state / m;
  };

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow ? (
        <p className="text-rose-300/70 text-xs md:text-sm uppercase tracking-[0.22em] mb-3">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-4 text-base md:text-lg text-stone-400 ${
            center ? "max-w-2xl mx-auto" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function SoftCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30">
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-14 md:my-20">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export default function AboutPage() {
  const reduceMotion = useReducedMotion();
  const [activeMember, setActiveMember] = useState<number | null>(null);
  const [language, setLanguage] = useState<"en" | "tr">("en");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentCopy = copy[language];
  const currentTeamMembers = teamMembers[language];

  const shuffledImages = useMemo(() => {
    const seed = hashSeed("origins-about-2025-updated");
    return seededShuffle(aboutImages, seed);
  }, []);

  const stripRotations = useMemo(() => {
    const total = shuffledImages.length * 2;
    return Array.from({ length: total }, (_, index) => {
      const base = index % 2 === 0 ? -2.5 : 2.5;
      const wobble = ((index * 7) % 5) - 2;
      return base + wobble * 0.55;
    });
  }, [shuffledImages.length]);

  const toggleMember = useCallback((index: number) => {
    setActiveMember((prev) => (prev === index ? null : index));
  }, []);

  const motionIn = reduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };

  return (
    <PageLayout backgroundImage="/backgr.jpg">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-neutral-950 to-stone-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/15 via-transparent to-stone-900/20" />
        <div className="absolute -left-40 -top-40 w-[620px] h-[620px] rounded-full bg-rose-900/10 blur-[160px]" />
        <div className="absolute right-0 top-1/3 w-[520px] h-[520px] rounded-full bg-orange-950/10 blur-[140px]" />
        <div className="absolute -left-16 bottom-0 w-[420px] h-[420px] rounded-full bg-stone-800/15 blur-[120px]" />
      </div>

      <SocialBubbles />
      <Navigation />

      <div className="fixed top-24 right-6 z-50">
        <motion.button
          onClick={() => setLanguage(language === "en" ? "tr" : "en")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        >
          <Languages className="w-4 h-4" />
          <span className="text-sm font-semibold">{language === "en" ? "TR" : "EN"}</span>
        </motion.button>
      </div>

      <section className="min-h-screen flex items-center justify-center relative z-10 px-6 pt-32 pb-16">
        <motion.div className="max-w-5xl mx-auto" {...motionIn}>
          <div className="mb-10 grid grid-cols-2 gap-2 md:hidden">
            {shuffledImages.slice(0, 4).map((src, index) => (
              <motion.div
                key={`hero-mobile-${index}`}
                className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg ring-1 ring-rose-500/20"
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                <Image
                  src={src}
                  alt={`origins moment ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="50vw"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/40 to-transparent" />
              </motion.div>
            ))}
          </div>

          <div className="mb-12 relative h-[320px] hidden md:block">
            {shuffledImages.slice(0, 4).map((src, index) => {
              const positions = [
                { left: '0%', top: '10%', width: '42%', zIndex: 1, rotate: -3 },
                { left: '22%', top: '0%', width: '38%', zIndex: 3, rotate: 2 },
                { left: '48%', top: '12%', width: '32%', zIndex: 2, rotate: -1.5 },
                { left: '68%', top: '2%', width: '34%', zIndex: 4, rotate: 3 },
              ];
              const pos = positions[index];
              return (
                <motion.div
                  key={`hero-desktop-${index}`}
                  className="absolute overflow-hidden rounded-2xl shadow-2xl shadow-rose-950/40 ring-1 ring-rose-500/15"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    width: pos.width,
                    zIndex: pos.zIndex,
                    rotate: pos.rotate,
                  }}
                  whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: 0, zIndex: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={src}
                      alt={`origins moment ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="40vw"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-950/30 to-transparent" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-left md:text-center mb-10 md:mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-[1.05]">
              {currentCopy.hero.titleTop}
              <br />
              <span className="text-stone-400">{currentCopy.hero.titleMid}</span>
              <br />
              <span className="text-rose-300/85">{currentCopy.hero.titleBottom}</span>
            </h1>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-left">
            {currentCopy.hero.paragraphs.map((p) => (
              <p key={p} className="text-lg md:text-xl text-stone-300 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            {currentCopy.hero.actions.map((a) => (
              <Link key={a.href} href={a.href} className="w-full sm:w-auto">
                <motion.button
                  className={
                    a.primary
                      ? "w-full px-7 py-3 rounded-full bg-white text-stone-950 font-semibold hover:bg-stone-100 transition-colors"
                      : "w-full px-7 py-3 rounded-full bg-stone-900/40 border border-white/15 text-white font-semibold hover:bg-stone-900/60 transition-colors"
                  }
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  type="button"
                >
                  {a.label} {!a.primary ? <ArrowRight className="inline w-4 h-4 ml-2" /> : null}
                </motion.button>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="space-y-6">
              <SectionTitle
                eyebrow={currentCopy.origin.eyebrow}
                title={currentCopy.origin.title}
                subtitle={currentCopy.origin.subtitle}
              />
              <div className="space-y-4 text-lg text-stone-300 leading-relaxed">
                {currentCopy.origin.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>

            <SoftCard>
              <div className="p-7 md:p-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {currentCopy.origin.calloutTitle}
                </h3>
                <p className="text-stone-300 leading-relaxed">{currentCopy.origin.calloutBody}</p>
                {currentCopy.origin.calloutLine && (
                  <p className="mt-6 text-xl md:text-2xl text-rose-300 font-semibold italic">
                    {currentCopy.origin.calloutLine}
                  </p>
                )}
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <a
                    href={`mailto:${currentCopy.contact.email}?subject=origins%20radio%20mix%20or%20show`}
                    className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-rose-300 text-stone-950 font-semibold hover:bg-rose-200 transition-colors"
                  >
                    {currentCopy.origin.buttons?.join || "email us"}
                  </a>
                  <Link
                    href="/artists"
                    className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-semibold hover:bg-white/10 transition-colors"
                  >
                    {currentCopy.origin.buttons?.artists || "browse artists"}
                  </Link>
                </div>
              </div>
            </SoftCard>
          </div>

          <Divider />

          <div className="mb-10 md:mb-14">
            <SectionTitle
              eyebrow={currentCopy.whatThisIs.eyebrow}
              title={currentCopy.whatThisIs.title}
              subtitle={currentCopy.whatThisIs.subtitle}
              center
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {currentCopy.whatThisIs.cards.map((item) => (
              <SoftCard key={item.title}>
                <div className="p-7 md:p-8">
                  <item.icon className="w-6 h-6 text-rose-400 mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-stone-300 leading-relaxed mb-5">{item.text}</p>
                  <Link
                    href={item.cta.href}
                    className="inline-flex items-center gap-2 text-rose-300/90 hover:text-rose-200 font-semibold"
                  >
                    {item.cta.label} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </SoftCard>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <SectionTitle
            eyebrow={currentCopy.archive.eyebrow}
            title={currentCopy.archive.title}
            subtitle={currentCopy.archive.subtitle}
            center
          />

          <div className="mt-10 relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-stone-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-stone-950 to-transparent z-10 pointer-events-none" />

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 md:gap-6 py-4 pr-10 min-w-max">
                {[...shuffledImages, ...shuffledImages].map((src, index) => (
                  <motion.div
                    key={`strip-${index}`}
                    className="relative flex-shrink-0 w-44 md:w-60 aspect-[3/4] bg-rose-50 p-2 pb-12 shadow-2xl shadow-rose-950/30 rounded-xl ring-1 ring-rose-200/50"
                    style={{ rotate: `${stripRotations[index]}deg` }}
                    whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: 0, y: -10, zIndex: 10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="relative w-full h-full overflow-hidden rounded-lg">
                      <Image
                        src={src}
                        alt={`origins moment ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="240px"
                        loading="lazy"
                      />
                    </div>
                    <p className="absolute bottom-2 left-2 right-2 text-center text-stone-600 text-[10px] md:text-xs italic font-serif">
                      {currentCopy.archive.captions[index % currentCopy.archive.captions.length]}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 max-w-xl mx-auto">
            <div className="bg-rose-100/10 p-6 rounded-2xl backdrop-blur-sm border border-rose-600/20">
              <p className="text-stone-300 text-sm md:text-base leading-relaxed">
                {currentCopy.archive.callout}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 md:py-40">
        <motion.div
          className="max-w-4xl mx-auto px-6"
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {currentCopy.contact.title}
            </h2>
            <div className="max-w-2xl mx-auto space-y-3 text-left md:text-center">
              <p className="text-lg md:text-xl text-stone-300 leading-relaxed">{currentCopy.contact.p1}</p>
              <p className="text-base md:text-lg text-stone-400 leading-relaxed">{currentCopy.contact.p2}</p>
              <p className="text-lg text-rose-300 font-semibold">{currentCopy.contact.p3}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.a
              href={`mailto:${currentCopy.contact.email}`}
              className="group"
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <div className="bg-white/5 border border-white/15 rounded-2xl p-8 hover:bg-white hover:border-white transition-all duration-300 text-center h-full flex flex-col justify-center">
                <div className="text-4xl mb-4">✉️</div>
                <h3 className="text-xl font-bold text-white group-hover:text-stone-900 transition-colors mb-2">
                  {currentCopy.contact.cards.emailTitle}
                </h3>
                <p className="text-stone-400 group-hover:text-stone-600 transition-colors text-sm">
                  {currentCopy.contact.cards.emailSubtitle}
                </p>
              </div>
            </motion.a>

            <motion.a
              href={currentCopy.contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <div className="bg-white/5 border border-white/15 rounded-2xl p-8 hover:bg-white hover:border-white transition-all duration-300 text-center h-full flex flex-col justify-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-white group-hover:text-stone-900 transition-colors mb-2">
                  {currentCopy.contact.cards.instagramTitle}
                </h3>
                <p className="text-stone-400 group-hover:text-stone-600 transition-colors text-sm">
                  {currentCopy.contact.cards.instagramSubtitle}
                </p>
              </div>
            </motion.a>
          </div>

          <div className="text-center space-y-6">
            <p className="text-stone-500 text-sm">{currentCopy.contact.orVibe}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {currentCopy.contact.buttons.map((b) => (
                <Link key={b.href} href={b.href}>
                  <motion.button
                    className="px-8 py-3 bg-stone-900/40 border border-white/15 text-white font-semibold rounded-full hover:bg-stone-900/60 transition-colors"
                    whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    type="button"
                  >
                    {b.label}
                  </motion.button>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </PageLayout>
  );
}
