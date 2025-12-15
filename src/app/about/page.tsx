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
  CheckCircle2,
  XCircle,
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

const teamMembers = [
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
  {
    name: "Rahmi",
    fullName: "Rahmi Mert Üner",
    role: "visuals, creative",
    image: "/team/rahmi.jpeg",
    quote: "a night has a mood, visuals should match it.",
    story:
      "handles the visual identity, flyers, and tiny details you feel before you can explain them. makes origins look like origins.",
    funFact: "will notice one pixel being off",
    favoriteMoment: "seeing a poster in a venue and hearing people talk lineup",
  },
];

const copy = {
  hero: {
    eyebrow: "a note from the people behind origins",
    titleTop: "origins radio keeps the night human.",
    titleMid: "not a brand.",
    titleBottom: "a small crew building a home for the music we love.",
    paragraphs: [
      "we started in 2023 in ankara because we missed spaces that felt real. not polished. not optimized. just taste, sound, and a room with a pulse.",
      "origins is radio, events, and an archive of nights that meant something. we build it the way we build a night: careful with details, ruthless with the boring parts, always chasing the moment when the room locks in.",
      "if you get the feeling, you’re already part of it.",
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
    title: "we started because everything was getting too same",
    subtitle:
      "online music was endless, but the spaces around it started to feel empty. scenes turned into content. and the best parts of nightlife did not translate.",
    paragraphs: [
      "we did not start with a budget, a plan, or permission. we started with a problem: everything was starting to look and sound like a template.",
      "the first version was scrappy. borrowed gear. last minute fixes. stress testing streams at stupid hours. flyers made too late. cables that always disappeared.",
      "then the first night happened. people showed up. not an audience. people. strangers who felt like friends by the end of the set.",
      "that’s when origins stopped being a project and became a responsibility.",
    ],
    calloutTitle: "what surprised us",
    calloutBody:
      "the best part was never “growth”. it was messages. moments. people meeting because of a track. at some point it stopped being ours in the way we expected.",
    calloutLine: "it’s shared now.",
  },
  whatThisIs: {
    eyebrow: "what this is",
    title: "radio, events, visuals",
    subtitle: "three parts, one goal: protect a certain kind of night.",
    cards: [
      {
        icon: Radio,
        title: "radio",
        text: "shows, residents, guest mixes. no filler. just selections with intention and pacing.",
        cta: { label: "schedule", href: "/radio/schedule" },
      },
      {
        icon: CalendarDays,
        title: "events",
        text: "small rooms, real sound, honest energy. if the vibe is right, you do not need a huge stage.",
        cta: { label: "events", href: "/events" },
      },
      {
        icon: Sparkles,
        title: "visuals",
        text: "identity, posters, motion, details. the stuff you feel before the bass even hits.",
        cta: { label: "artists", href: "/artists" },
      },
    ],
  },
  protect: {
    eyebrow: "what we protect",
    title: "a night that still feels real",
    subtitle: "we are not trying to be everywhere. we are trying to keep this alive.",
    bullets: [
      { icon: Shield, title: "no phones energy", text: "the kind of moment where you forget your screen exists." },
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
      "a point of view",
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
      "keep learning in public",
    ],
  },
  archive: {
    eyebrow: "archive",
    title: "some nights we kept",
    subtitle: "photos you take when you don’t want the night to end.",
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
      "every photo here is proof that the best nights are not content, they’re shared. that’s what we protect.",
  },
  team: {
    eyebrow: "team",
    title: "the people doing the work",
    subtitle: "three roles, one obsession: make it feel right.",
    hintClosed: "tap for details",
  },
  contact: {
    title: "want to reach us",
    p1: "pitch a show, suggest an artist, or talk events. send a message.",
    p2: "we read everything. replies might be slow when we’re building, but we do not ignore people.",
    p3: "thanks for being here.",
    email: "info@originsradio.com",
    instagram: "https://www.instagram.com/origins.radio/",
    buttons: [
      { label: "events", href: "/events" },
      { label: "schedule", href: "/radio/schedule" },
      { label: "artists", href: "/artists" },
    ],
    footer: "kaan, sina, rahmi",
  },
};

/**
 * deterministic shuffle to avoid weird reorder behavior across renders
 */
function seededShuffle<T>(arr: T[], seed: number) {
  const out = [...arr];
  let s = seed >>> 0;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
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
        <p className="text-amber-300/70 text-xs md:text-sm uppercase tracking-[0.22em] mb-3">
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const shuffledImages = useMemo(() => {
    const seed = hashSeed("origins-about-2025");
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
    <PageLayout backgroundImage="/about-background.jpg">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-neutral-950 to-stone-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/15 via-transparent to-stone-900/20" />
        <div className="absolute -left-40 -top-40 w-[620px] h-[620px] rounded-full bg-amber-900/10 blur-[160px]" />
        <div className="absolute right-0 top-1/3 w-[520px] h-[520px] rounded-full bg-orange-950/10 blur-[140px]" />
        <div className="absolute -left-16 bottom-0 w-[420px] h-[420px] rounded-full bg-stone-800/15 blur-[120px]" />
      </div>

      <SocialBubbles />
      <Navigation />

      {/* hero */}
      <section className="min-h-screen flex items-center justify-center relative z-10 px-6 pt-32 pb-16">
        <motion.div className="max-w-5xl mx-auto" {...motionIn}>
          <div className="mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100/10 border border-amber-400/20 px-5 py-3 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300/80" />
              <p className="text-amber-200/80 text-sm md:text-base italic">
                {copy.hero.eyebrow}
              </p>
            </div>
          </div>

          <div className="text-left md:text-center mb-10 md:mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-[1.05]">
              {copy.hero.titleTop}
              <br />
              <span className="text-stone-400">{copy.hero.titleMid}</span>
              <br />
              <span className="text-amber-300/85">{copy.hero.titleBottom}</span>
            </h1>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-left">
            {copy.hero.paragraphs.map((p) => (
              <p key={p} className="text-lg md:text-xl text-stone-300 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {copy.hero.stats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10"
              >
                <stat.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-stone-400 uppercase tracking-[0.18em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            {copy.hero.actions.map((a) => (
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

      {/* origin story */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="space-y-6">
              <SectionTitle
                eyebrow={copy.origin.eyebrow}
                title={copy.origin.title}
                subtitle={copy.origin.subtitle}
              />
              <div className="space-y-4 text-lg text-stone-300 leading-relaxed">
                {copy.origin.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>

            <SoftCard>
              <div className="p-7 md:p-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {copy.origin.calloutTitle}
                </h3>
                <p className="text-stone-300 leading-relaxed">{copy.origin.calloutBody}</p>
                <p className="mt-6 text-xl md:text-2xl text-amber-300 font-semibold italic">
                  {copy.origin.calloutLine}
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <a
                    href={`mailto:${copy.contact.email}?subject=origins%20radio%20mix%20or%20show`}
                    className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-amber-300 text-stone-950 font-semibold hover:bg-amber-200 transition-colors"
                  >
                    pitch a show
                  </a>
                  <Link
                    href="/artists"
                    className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-semibold hover:bg-white/10 transition-colors"
                  >
                    browse artists
                  </Link>
                </div>
              </div>
            </SoftCard>
          </div>

          <Divider />

          {/* what this is */}
          <div className="mb-10 md:mb-14">
            <SectionTitle
              eyebrow={copy.whatThisIs.eyebrow}
              title={copy.whatThisIs.title}
              subtitle={copy.whatThisIs.subtitle}
              center
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {copy.whatThisIs.cards.map((item) => (
              <SoftCard key={item.title}>
                <div className="p-7 md:p-8">
                  <item.icon className="w-6 h-6 text-amber-400 mb-4" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-stone-300 leading-relaxed mb-5">{item.text}</p>
                  <Link
                    href={item.cta.href}
                    className="inline-flex items-center gap-2 text-amber-300/90 hover:text-amber-200 font-semibold"
                  >
                    {item.cta.label} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </SoftCard>
            ))}
          </div>
        </div>
      </section>

      {/* protect + booking + wont */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="space-y-10">
              <div>
                <SectionTitle
                  eyebrow={copy.protect.eyebrow}
                  title={copy.protect.title}
                  subtitle={copy.protect.subtitle}
                />
                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  {copy.protect.bullets.map((b) => (
                    <div
                      key={b.title}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                      <b.icon className="w-5 h-5 text-amber-400 mb-3" />
                      <p className="text-white font-semibold mb-1">{b.title}</p>
                      <p className="text-stone-400 text-sm leading-relaxed">{b.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <SoftCard>
                <div className="p-7 md:p-8">
                  <SectionTitle
                    eyebrow={copy.booking.eyebrow}
                    title={copy.booking.title}
                    subtitle={copy.booking.subtitle}
                  />
                  <ul className="mt-6 space-y-3">
                    {copy.booking.list.map((t) => (
                      <li key={t} className="flex items-start gap-3 text-stone-300">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5" />
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-stone-400 italic">{copy.booking.note}</p>
                </div>
              </SoftCard>
            </div>

            <SoftCard>
              <div className="p-7 md:p-10">
                <SectionTitle
                  eyebrow={copy.wont.eyebrow}
                  title={copy.wont.title}
                  subtitle="no pretending. no corporate voice. just how we operate."
                />
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-stone-950/30 border border-white/10 p-5">
                    <p className="text-white font-semibold mb-4">we will not</p>
                    <ul className="space-y-3">
                      {copy.wont.left.map((t) => (
                        <li key={t} className="flex items-start gap-3 text-stone-300">
                          <XCircle className="w-5 h-5 text-stone-500 mt-0.5" />
                          <span className="leading-relaxed">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-amber-950/20 border border-amber-900/30 p-5">
                    <p className="text-white font-semibold mb-4">we do</p>
                    <ul className="space-y-3">
                      {copy.wont.right.map((t) => (
                        <li key={t} className="flex items-start gap-3 text-stone-200">
                          <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5" />
                          <span className="leading-relaxed">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`mailto:${copy.contact.email}?subject=origins%20radio%20booking%20or%20collab`}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-stone-950 font-semibold hover:bg-stone-100 transition-colors"
                  >
                    email us
                  </a>
                  <a
                    href={copy.contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-stone-900/40 border border-white/15 text-white font-semibold hover:bg-stone-900/60 transition-colors"
                  >
                    instagram
                  </a>
                </div>
              </div>
            </SoftCard>
          </div>
        </div>
      </section>

      {/* archive */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <SectionTitle
            eyebrow={copy.archive.eyebrow}
            title={copy.archive.title}
            subtitle={copy.archive.subtitle}
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
                    className="relative flex-shrink-0 w-44 md:w-60 aspect-[3/4] bg-white p-2 pb-12 shadow-2xl shadow-black/40 rounded-xl"
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
                      {copy.archive.captions[index % copy.archive.captions.length]}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 max-w-xl mx-auto">
            <div className="bg-amber-100/10 p-6 rounded-2xl backdrop-blur-sm border border-amber-600/20">
              <p className="text-stone-300 text-sm md:text-base leading-relaxed">
                {copy.archive.callout}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* team */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-20">
            <SectionTitle
              eyebrow={copy.team.eyebrow}
              title={copy.team.title}
              subtitle={copy.team.subtitle}
              center
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {teamMembers.map((member, index) => {
              const isOpen = activeMember === index;
              return (
                <motion.div
                  key={member.name}
                  className="group"
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  viewport={{ once: true, margin: "-80px" }}
                >
                  <button
                    type="button"
                    onClick={() => toggleMember(index)}
                    className="w-full text-left"
                    aria-expanded={isOpen}
                    aria-controls={`member-${index}`}
                  >
                    <div className="relative mb-6">
                      <motion.div
                        className="relative bg-white p-3 pb-14 shadow-2xl shadow-black/50 rounded-2xl"
                        style={{ rotate: index === 0 ? -3.5 : index === 1 ? 2.2 : -2.8 }}
                        whileHover={reduceMotion ? undefined : { rotate: 0, scale: 1.02, y: -6 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl">
                          <Image
                            src={member.image}
                            alt={member.fullName}
                            fill
                            className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-center">
                          <p className="text-stone-700 text-sm font-serif italic">
                            {member.name} {index === 0 ? "✨" : index === 1 ? "🛠️" : "🎨"}
                          </p>
                        </div>
                      </motion.div>

                      {index % 2 === 0 ? (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-14 h-6 bg-amber-100/25 backdrop-blur-sm rotate-[-8deg] border border-amber-300/20 rounded-md" />
                      ) : (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-stone-400/60 shadow-lg" />
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
                          {member.fullName}
                        </h3>
                        <p className="text-amber-400/70 text-sm font-semibold uppercase tracking-[0.14em]">
                          {member.role}
                        </p>
                      </div>

                      <div className="bg-stone-800/50 border-l-4 border-amber-400/50 p-4 rounded-xl">
                        <p className="text-stone-300 text-sm italic leading-relaxed">
                          "{member.quote}"
                        </p>
                      </div>

                      <div className="bg-stone-900/30 rounded-xl p-4 border border-stone-800">
                        <p className="text-xs text-stone-500 uppercase tracking-[0.2em] mb-1">
                          fun fact
                        </p>
                        <p className="text-stone-300 text-sm">{member.funFact}</p>
                      </div>

                      <div
                        id={`member-${index}`}
                        className={`transition-all duration-300 ${
                          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                        style={{ height: isOpen ? "auto" : 0, overflow: "hidden" }}
                      >
                        <div className="pt-2 space-y-3">
                          <div className="border-t border-stone-800 pt-3">
                            <p className="text-xs text-stone-500 uppercase tracking-[0.2em] mb-2">
                              the story
                            </p>
                            <p className="text-stone-400 text-sm leading-relaxed">
                              {member.story}
                            </p>
                          </div>
                          <div className="bg-amber-950/20 rounded-xl p-4 border border-amber-900/30">
                            <p className="text-xs text-amber-400/70 uppercase tracking-[0.2em] mb-1">
                              favorite moment
                            </p>
                            <p className="text-stone-300 text-sm leading-relaxed">
                              {member.favoriteMoment}
                            </p>
                          </div>
                        </div>
                      </div>

                      {!isOpen ? (
                        <p className="text-xs text-stone-600 text-center italic">
                          {copy.team.hintClosed}
                        </p>
                      ) : null}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* contact */}
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
              {copy.contact.title}
            </h2>
            <div className="max-w-2xl mx-auto space-y-3 text-left md:text-center">
              <p className="text-lg md:text-xl text-stone-300 leading-relaxed">{copy.contact.p1}</p>
              <p className="text-base md:text-lg text-stone-400 leading-relaxed">{copy.contact.p2}</p>
              <p className="text-lg text-amber-300 font-semibold">{copy.contact.p3}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.a
              href={`mailto:${copy.contact.email}`}
              className="group"
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <div className="bg-white/5 border border-white/15 rounded-2xl p-8 hover:bg-white hover:border-white transition-all duration-300 text-center h-full flex flex-col justify-center">
                <div className="text-4xl mb-4">✉️</div>
                <h3 className="text-xl font-bold text-white group-hover:text-stone-900 transition-colors mb-2">
                  email
                </h3>
                <p className="text-stone-400 group-hover:text-stone-600 transition-colors text-sm">
                  best for collabs and bookings
                </p>
              </div>
            </motion.a>

            <motion.a
              href={copy.contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <div className="bg-white/5 border border-white/15 rounded-2xl p-8 hover:bg-white hover:border-white transition-all duration-300 text-center h-full flex flex-col justify-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-white group-hover:text-stone-900 transition-colors mb-2">
                  instagram dm
                </h3>
                <p className="text-stone-400 group-hover:text-stone-600 transition-colors text-sm">
                  quick questions live here
                </p>
              </div>
            </motion.a>
          </div>

          <div className="text-center space-y-6">
            <p className="text-stone-500 text-sm">or just vibe</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {copy.contact.buttons.map((b) => (
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

          <div className="mt-16 text-center">
            <div className="inline-block bg-amber-100/10 border border-amber-600/20 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <p className="text-stone-400 text-sm italic">
                thanks for reading
                <br />
                <span className="text-stone-500 text-xs">{copy.contact.footer}</span>
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </PageLayout>
  );
}