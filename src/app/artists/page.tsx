'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
import { useWebHaptics } from "web-haptics/react";
import { motion, useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, Music, MapPin, Star, Tag, ArrowRight, CheckCircle2, Users, Languages } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '@/components/layout/PageLayout';
import SocialBubbles from '@/components/social/SocialBubbles';
import Navigation from '@/components/Navigation';
import { useArtists } from '@/hooks/use-supabase';
import { generateSlug } from '@/lib/supabase-utils';
import { cn } from '@/lib/utils';

const copy = {
  en: {
    hero: {
      titleTop: "residents, guests,",
      titleBottom: "and the magazine.",
      paragraphs: [
        "we do not just book names. we book taste, intention, and respect for the room.",
        "explore the roster by genre. new voice, strong point of view. apply for management.",
      ],
      actions: {
        browseArtist: "browse artist",
        bookByGenre: "book by genre",
        applyManagement: "apply for management",
      },
      stats: {
        artists: "artists",
        residents: "residents",
        genres: "genres",
        cities: "cities",
      },
    },
    management: {
      eyebrow: "new talent management",
      title: "we build careers, not just bookings.",
      subtitle: "originsradio management is for artists we truly believe in.",
      paragraphs: [
        "for a select group of new talents, we go beyond radio slots. we offer management services: long-term strategy, identity development, release planning, and placing you in the right rooms.",
        "it is not about filling a calendar. it is about telling a story with your career. if you have a unique sound and the drive to back it up, we want to hear from you.",
      ],
      ctaPrimary: "apply for management",
      ctaPrimaryLink:
        "mailto:info@originsradio.com?subject=new%20talent%20-%20artist%20management&body=links%20(soundcloud%2Fspotify)%3A%0Ainstagram%3A%0Alocation%3A%0Agenres%3A%0Ashort%20note%3A%0A",
      ctaSecondary: "submit a mix for radio",
      ctaSecondaryLink:
        "mailto:info@originsradio.com?subject=origins%20radio%20-%20mix%20submission&body=artist%20name%3A%0Alocation%3A%0Agenres%3A%0Amix%20link%3A%0Ashort%20note%3A%0A",
      card: {
        title: "Join the Roster",
        body:
          "we are looking for sound that stands out. if you believe you have what it takes to be a resident or a managed artist, show us what you've got.",
        bullets: ["Identity development", "Strategic bookings", "Production support"],
      },
    },
    booking: {
      eyebrow: "curate your night",
      title: "find the right sound",
      subtitle:
        "browse our roster by genre to find the perfect match for your event. from warmups to peak time.",
      cta: "book a DJ",
      mailto: {
        subjectBase: "DJ booking request",
        bodyLines: [
          "event date:",
          "venue / city:",
          "genre / vibe:",
          "budget:",
          "preferred DJs (optional):",
          "notes:",
        ],
        openGenre: "open",
      },
    },
    ui: {
      artistLogin: "Artist Login",
      searchPlaceholder: "Search artist name or bio...",
      filterByVibe: "Filter by Vibe",
      allGenres: "All Genres",
      showResidentsOnly: "Show Residents Only",
      showingResidentsOnly: "Showing Residents Only",
      residentTooltip: "Resident DJs are our management services DJs. We hold their licenses and copyrights.",
      foundPrefix: "Found",
      noMatches: "No artists match your criteria",
      loading: "Loading artists...",
      errorTitle: "Error loading artists",
      emptyTitle: "No artists match this yet",
      emptyBody: "Try clearing filters or searching with a different word.",
      viewProfile: "view profile",
      residentBadge: "Resident",
      keyboardHintOr: "+",
    },
    seo: {
      title: "Artists & Management - Origins Radio",
      description:
        "Discover the DJs and artists shaping nights at Origins Radio. Browse residents, explore by genre, and learn about our artist management services.",
      keywords:
        "DJs, artist management, underground music, techno, house, Origins Radio, booking, new talent",
      listName: "Artists & DJs",
      listDescription: "Resident DJs and music producers from the underground music scene",
    },
  },
  tr: {
    hero: {
      titleTop: "resident’lar, konuklar,",
      titleBottom: "ve magazin.",
      paragraphs: [
        "biz sadece isimleri book’lamıyoruz. zevki, niyeti ve mekâna saygıyı book’luyoruz.",
        "kadroyu incele, türlere göre filtrele; yeni bir yeteneksen ve bir bakış açın varsa menajerlik için başvur.",
      ],
      actions: {
        browseArtist: "sanatçıları incele",
        bookByGenre: "türe göre rezervasyon",
        applyManagement: "menajerlik için başvur",
      },
      stats: {
        artists: "sanatçı",
        residents: "resident",
        genres: "tür",
        cities: "şehir",
      },
    },
    management: {
      eyebrow: "yeni yetenek menajerliği",
      title: "biz kariyer inşa ederiz, sadece booking değil.",
      subtitle: "originsradio management, gerçekten inandığımız sanatçılar içindir.",
      paragraphs: [
        "seçilmiş yeni yetenekler için radyo slotlarının ötesine geçiyoruz. menajerlik hizmetleri sunuyoruz: uzun vadeli strateji, kimlik geliştirme, yayın planı ve seni doğru odalara yerleştirmek.",
        "mesele takvimi doldurmak değil. mesele kariyerinle bir hikâye anlatmak. kendine özgü bir sesin ve onu taşıyacak disiplinin varsa, senden haber almak isteriz.",
      ],
      ctaPrimary: "menajerlik için başvur",
      ctaPrimaryLink:
        "mailto:info@originsradio.com?subject=yeni%20yetenek%20-%20sanatci%20menajerligi&body=linkler%20(soundcloud%2Fspotify)%3A%0Ainstagram%3A%0Akonum%3A%0Aturler%3A%0Akisa%20not%3A%0A",
      ctaSecondary: "radyoya mix gönder",
      ctaSecondaryLink:
        "mailto:info@originsradio.com?subject=origins%20radio%20-%20mix%20gonderimi&body=artist%20adi%3A%0Akonum%3A%0Aturler%3A%0Amix%20linki%3A%0Akisa%20not%3A%0A",
      card: {
        title: "Kadromuza Katıl",
        body:
          "öne çıkan bir sound arıyoruz. resident ya da menajerli sanatçı olabileceğine inanıyorsan, bize ne yaptığını göster.",
        bullets: ["Kimlik geliştirme", "Stratejik booking", "Prodüksiyon desteği"],
      },
    },
    booking: {
      eyebrow: "geceni kurgula",
      title: "doğru sound’u bul",
      subtitle:
        "etkinliğin için en doğru eşleşmeyi türlere göre bul. warmup’tan peak time’a.",
      cta: "DJ rezervasyonu",
      mailto: {
        subjectBase: "DJ rezervasyon talebi",
        bodyLines: [
          "etkinlik tarihi:",
          "mekan / şehir:",
          "tür / vibe:",
          "bütçe:",
          "tercih edilen DJ’ler (opsiyonel):",
          "notlar:",
        ],
        openGenre: "fark etmez",
      },
    },
    ui: {
      artistLogin: "Artist Login",
      searchPlaceholder: "Sanatçı adı veya biyografide ara...",
      filterByVibe: "Vibe’a Göre Filtrele",
      allGenres: "Tüm Türler",
      showResidentsOnly: "Sadece Resident'lar",
      showingResidentsOnly: "Sadece Resident'lar Gösteriliyor",
      residentTooltip: "Resident DJ'ler bizim menajerlik hizmeti verdiğimiz DJ'lerdir. Lisanslarını ve telif haklarını biz tutuyoruz.",
      foundPrefix: "Bulunan",
      noMatches: "Kriterlerine uyan sanatçı yok",
      loading: "Sanatçılar yükleniyor...",
      errorTitle: "Sanatçılar yüklenemedi",
      emptyTitle: "Şu an eşleşme yok",
      emptyBody: "Filtreleri temizlemeyi ya da farklı bir kelimeyle aramayı dene.",
      viewProfile: "profili gör",
      residentBadge: "Resident",
      keyboardHintOr: "+",
    },
    seo: {
      title: "Sanatçılar & Menajerlik - Origins Radio",
      description:
        "Origins Radio gecelerini şekillendiren DJ ve sanatçıları keşfet. Resident’lara göz at, türe göre filtrele ve menajerlik hizmetlerimizi incele.",
      keywords:
        "DJ, sanatçı menajerliği, underground müzik, techno, house, Origins Radio, rezervasyon, yeni yetenek",
      listName: "Sanatçılar & DJ’ler",
      listDescription: "Underground sahneden resident DJ’ler ve müzik prodüktörleri",
    },
  },
};

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
    <div className={center ? 'text-center' : ''}>
      {eyebrow ? (
        <p className="text-[#A6B2E1]/70 text-xs md:text-sm uppercase tracking-[0.22em] mb-3">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl md:text-5xl font-bold text-[#EEEef4] leading-tight">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-4 text-base md:text-lg text-[#CFC6DB] ${center ? 'max-w-2xl mx-auto' : 'max-w-2xl'
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
    <div className="bg-[#555759]/20 border border-[#EEEef4]/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-[#000000]/30">
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-14 md:my-20">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#EEEef4]/10 to-transparent" />
    </div>
  );
}

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { trigger } = useWebHaptics();
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showOtherGenres, setShowOtherGenres] = useState(false);
  const [language, setLanguage] = useState<'en' | 'tr'>('en');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const rosterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch artists from Supabase
  const { data: artists, isLoading, error } = useArtists();

  const genreCounts = useMemo(() => {
    const counts = new Map<string, number>();
    (artists || []).forEach((artist) => {
      if (Array.isArray(artist.genre)) {
        artist.genre.forEach((g: string) => {
          const key = (g || '').trim();
          if (!key) return;
          counts.set(key, (counts.get(key) ?? 0) + 1);
        });
      }
    });
    return counts;
  }, [artists]);

  const allGenres = useMemo(() => {
    if (!artists) return [];
    const set = new Set<string>();
    artists.forEach((artist) => {
      if (Array.isArray(artist.genre)) {
        artist.genre.forEach((g: string) => {
          if (g && g.trim()) set.add(g);
        });
      }
    });
    return Array.from(set).sort();
  }, [artists]);

  // Calculate top 8 most popular genres
  const topGenres = useMemo(() => {
    if (!artists || genreCounts.size === 0) return [];
    const sorted = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);
    return sorted.slice(0, 8);
  }, [genreCounts, artists]);

  // Get remaining genres (not in top 8)
  const otherGenres = useMemo(() => {
    return allGenres.filter(genre => !topGenres.includes(genre));
  }, [allGenres, topGenres]);

  const heroStats = useMemo(() => {
    const totalArtists = artists?.length ?? 0;
    const residents = (artists || []).filter((a) => a.featured).length;
    const locations = new Set<string>();
    (artists || []).forEach((a) => {
      const l = (a.location || '').trim();
      if (l) locations.add(l);
    });
    return [
      { icon: Users, label: copy[language].hero.stats.artists, value: String(totalArtists) },
      { icon: Star, label: copy[language].hero.stats.residents, value: String(residents) },
      { icon: Tag, label: copy[language].hero.stats.genres, value: String(allGenres.length) },
      { icon: MapPin, label: copy[language].hero.stats.cities, value: String(locations.size) },
    ];
  }, [artists, allGenres.length, language]);

  // Initialize genre from URL (?genre=...) so people can share "book by genre" links
  useEffect(() => {
    const urlGenre = searchParams.get('genre');
    if (!urlGenre) return;
    // we keep the exact case from DB genres; allow matching by case-insensitive compare
    const match = allGenres.find((g) => g.toLowerCase() === urlGenre.toLowerCase());
    if (match) setSelectedGenre(match);
  }, [searchParams, allGenres]);

  // Filter artists based on search, featured filter and genre
  const filteredArtists = useMemo(() => {
    if (!artists) return [];

    let filtered = artists.filter((artist) => {
      const haystack =
        (artist.name || '').toLowerCase() +
        ' ' +
        (artist.bio ? artist.bio.toLowerCase() : '');
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());

      const matchesGenre =
        !selectedGenre ||
        (Array.isArray(artist.genre) &&
          artist.genre.some((g: string) => g === selectedGenre));

      return matchesSearch && matchesGenre;
    });

    if (showFeaturedOnly) {
      filtered = filtered.filter((artist) => artist.featured);
    }

    return filtered;
  }, [artists, searchTerm, showFeaturedOnly, selectedGenre]);

  const handleArtistClick = (artist: any) => {
    const slug = generateSlug(artist.name);
    router.push(`/artists/${slug}`);
  };

  const setGenreAndSyncUrl = (genre: string | null) => {
    setSelectedGenre(genre);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (genre) params.set('genre', genre);
    else params.delete('genre');
    const query = params.toString();
    router.replace(query ? `/artists?${query}` : '/artists', { scroll: false });
  };

  const bookingMailto = useMemo(() => {
    const base = copy[language].booking.mailto.subjectBase;
    const subject = encodeURIComponent(`${base}${selectedGenre ? ` - ${selectedGenre}` : ''}`);
    const lines = copy[language].booking.mailto.bodyLines.slice();
    const genreLineIndex = lines.findIndex((l) => l.toLowerCase().includes('genre') || l.toLowerCase().includes('tür'));
    const genreValue = selectedGenre ?? copy[language].booking.mailto.openGenre;
    if (genreLineIndex >= 0) lines[genreLineIndex] = `${lines[genreLineIndex]} ${genreValue}`;
    const body = encodeURIComponent(lines.join('\n'));
    return `mailto:info@originsradio.com?subject=${subject}&body=${body}`;
  }, [selectedGenre, language]);

  // SEO Data
  const seoData = useMemo(() => {
    const current = copy[language].seo;
    return {
      title: current.title,
      description: current.description,
      keywords: current.keywords,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: current.listName,
        description: current.listDescription,
        url: 'https://originsradio.com/artists',
        numberOfItems: artists?.length || 0,
        itemListElement:
          artists?.map((artist, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Person',
              name: artist.name,
              description: artist.bio || `Professional DJ ${artist.name}`,
              url: `https://originsradio.com/artists/${generateSlug(artist.name)}`,
              image: artist.photo_url || '/placeholder.svg',
              jobTitle: 'DJ & Music Producer',
              worksFor: {
                '@type': 'Organization',
                name: 'Origins Radio',
              },
            },
          })) || [],
      },
    };
  }, [artists, language]);

  const motionIn = reduceMotion
    ? {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    }
    : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.2, ease: 'easeOut' as const },
    };

  return (
    <PageLayout>
      {/* Background for artist pages */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#000000]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#A6B2E1]/10 via-transparent to-[#7DBEEE]/15" />
        <div className="absolute -left-40 -top-40 w-[620px] h-[620px] rounded-full bg-[#7DBEEE]/8 blur-[160px]" />
        <div className="absolute right-0 top-1/3 w-[520px] h-[520px] rounded-full bg-[#A6B2E1]/8 blur-[140px]" />
        <div className="absolute -left-16 bottom-0 w-[420px] h-[420px] rounded-full bg-[#555759]/20 blur-[120px]" />
      </div>

      <SocialBubbles />
      <Navigation />

      {/* Top-right controls (language) */}
      <div
        className={cn(
          'fixed z-40 flex items-center gap-2',
          'top-[calc(0.75rem+env(safe-area-inset-top))] right-[calc(0.75rem+env(safe-area-inset-right))]',
          'sm:top-[calc(1.5rem+env(safe-area-inset-top))] sm:right-[calc(1.5rem+env(safe-area-inset-right))]'
        )}
      >
        <motion.button
          onClick={() => {
            trigger('light');
            setLanguage(language === 'en' ? 'tr' : 'en');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#555759]/30 border border-[#EEEef4]/20 text-[#EEEef4] hover:bg-[#555759]/40 transition-colors backdrop-blur-sm"
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
          type="button"
          aria-label="Toggle language"
          title="Toggle language"
        >
          <Languages className="w-4 h-4" />
          <span className="text-sm font-semibold">{language === 'en' ? 'TR' : 'EN'}</span>
        </motion.button>
      </div>

      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <script type="application/ld+json">
          {JSON.stringify(seoData.structuredData)}
        </script>
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content="https://originsradio.com/artists" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/originslogo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content="/originslogo.png" />
        <link rel="canonical" href="https://originsradio.com/artists" />
      </Helmet>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative z-10 px-6 pt-12 pb-16">
        <motion.div className="max-w-5xl mx-auto" {...motionIn}>
          <div className="mb-10 md:mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-[#EEEef4] leading-[1.05] text-left md:text-center">
              {copy[language].hero.titleTop}
              <br />
              <span className="text-[#A6B2E1]">{copy[language].hero.titleBottom}</span>
            </h1>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-left">
            {copy[language].hero.paragraphs.map((p) => (
              <p key={p} className="text-lg md:text-xl text-[#CFC6DB] leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {heroStats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-4 bg-[#555759]/20 rounded-xl backdrop-blur-sm border border-[#EEEef4]/10"
              >
                <stat.icon className="w-6 h-6 text-[#7DBEEE] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#EEEef4] mb-1">{stat.value}</div>
                <div className="text-xs text-[#CFC6DB] uppercase tracking-[0.18em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <motion.button
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#EEEef4] text-[#000000] font-semibold hover:bg-[#CFC6DB] transition-colors"
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              type="button"
              onClick={() => {
                trigger('light');
                rosterRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
              }}
            >
              {copy[language].hero.actions.browseArtist} <ArrowRight className="inline w-4 h-4 ml-2" />
            </motion.button>
            <motion.button
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#555759]/40 border border-[#EEEef4]/15 text-[#EEEef4] font-semibold hover:bg-[#555759]/60 transition-colors"
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              type="button"
              onClick={() => {
                trigger('light');
                const el = document.getElementById('booking');
                el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
              }}
            >
              {copy[language].hero.actions.bookByGenre} <ArrowRight className="inline w-4 h-4 ml-2" />
            </motion.button>
            <a href={copy[language].management.ctaPrimaryLink} className="w-full sm:w-auto">
              <motion.div
                className="w-full px-7 py-3 rounded-full bg-[#7DBEEE] text-[#000000] font-semibold hover:bg-[#A6B2E1] transition-colors text-center"
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                {copy[language].hero.actions.applyManagement}
              </motion.div>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Management / New Talent Section */}
      <section className="relative z-10 py-16 md:py-24 bg-[#000000]/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <SectionTitle
                eyebrow={copy[language].management.eyebrow}
                title={copy[language].management.title}
                subtitle={copy[language].management.subtitle}
              />
              <div className="space-y-4 text-lg text-[#CFC6DB] leading-relaxed">
                {copy[language].management.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div>
                <a
                  href={copy[language].management.ctaPrimaryLink}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#EEEef4] text-[#000000] font-semibold hover:bg-[#CFC6DB] transition-colors text-base"
                >
                  {copy[language].management.ctaPrimary} <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <SoftCard>
                <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[400px]">
                  <motion.div
                    className="w-62 h-62 rounded-full bg-[#7DBEEE]/10 flex items-center justify-center mb-4"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Image
                      src="/holoo.png"
                      alt="Origins Radio"
                      width={220}
                      height={220}
                      className="object-contain"
                    />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[#EEEef4]">{copy[language].management.card.title}</h3>
                  <p className="text-[#CFC6DB] leading-relaxed">
                    {copy[language].management.card.body}
                  </p>
                  <ul className="text-left text-[#CFC6DB] space-y-3 w-full max-w-xs mx-auto">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#7DBEEE]" />
                      <span>{copy[language].management.card.bullets[0]}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#7DBEEE]" />
                      <span>{copy[language].management.card.bullets[1]}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#7DBEEE]" />
                      <span>{copy[language].management.card.bullets[2]}</span>
                    </li>
                  </ul>
                </div>
              </SoftCard>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* Booking / Filtering Section */}
      <section className="max-w-6xl mx-auto px-6" id="booking">
        <div className="text-center mb-12">
          <SectionTitle
            eyebrow={copy[language].booking.eyebrow}
            title={copy[language].booking.title}
            subtitle={copy[language].booking.subtitle}
            center
          />
        </div>

        <SoftCard>
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Search Bar */}
              <div className="relative w-full max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#CFC6DB] w-5 h-5 z-10" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={copy[language].ui.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-24 py-4 bg-[#555759]/80 border border-[#EEEef4]/25 rounded-full text-[#EEEef4] placeholder-[#CFC6DB]/60 focus:outline-none focus:ring-2 focus:ring-[#7DBEEE]/50 focus:border-[#A6B2E1]/60 focus:bg-[#555759]/90 transition-all text-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[#CFC6DB]/70 text-xs">
                  <kbd className="px-2 py-1 bg-[#555759]/90 rounded border border-[#EEEef4]/20 text-[#CFC6DB] text-[11px] font-mono">
                    {typeof navigator !== 'undefined' &&
                      navigator.platform.indexOf('Mac') > -1
                      ? '⌘'
                      : 'Ctrl'}
                  </kbd>
                  <span>{copy[language].ui.keyboardHintOr}</span>
                  <kbd className="px-2 py-1 bg-[#555759]/90 rounded border border-[#EEEef4]/20 text-[#CFC6DB] text-[11px] font-mono">
                    K
                  </kbd>
                </div>
              </div>

              {/* Genre Clouds */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => {
                      trigger('light');
                      setGenreAndSyncUrl(null);
                      setShowOtherGenres(false);
                    }}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm border transition-all duration-200',
                      !selectedGenre
                        ? 'bg-[#EEEef4] text-[#000000] border-[#EEEef4] font-semibold scale-105 shadow-lg shadow-[#EEEef4]/10'
                        : 'bg-[#555759]/60 text-[#CFC6DB] border-[#EEEef4]/10 hover:bg-[#555759]/90 hover:border-[#EEEef4]/30'
                    )}
                  >
                    {copy[language].ui.allGenres}
                  </button>
                  {topGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        trigger('light');
                        setGenreAndSyncUrl(selectedGenre === genre ? null : genre);
                      }}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm border transition-all duration-200',
                        selectedGenre === genre
                          ? 'bg-[#7DBEEE] text-[#000000] border-[#A6B2E1] font-semibold scale-105 shadow-lg shadow-[#7DBEEE]/20'
                          : 'bg-[#555759]/60 text-[#CFC6DB] border-[#EEEef4]/10 hover:bg-[#555759]/90 hover:border-[#EEEef4]/30'
                      )}
                    >
                      {genre}
                      <span className="ml-2 opacity-70 text-xs">
                        {genreCounts.get(genre) ?? 0}
                      </span>
                    </button>
                  ))}
                  {otherGenres.length > 0 && (
                    <>
                      <button
                        onClick={() => {
                          trigger('light');
                          setShowOtherGenres(!showOtherGenres);
                        }}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm border transition-all duration-200',
                          showOtherGenres
                            ? 'bg-[#7DBEEE] text-[#000000] border-[#A6B2E1] font-semibold scale-105 shadow-lg shadow-[#7DBEEE]/20'
                            : 'bg-[#555759]/60 text-[#CFC6DB] border-[#EEEef4]/10 hover:bg-[#555759]/90 hover:border-[#EEEef4]/30'
                        )}
                      >
                        Others ({otherGenres.length})
                      </button>
                      {showOtherGenres && (
                        <>
                          {otherGenres.map((genre) => (
                            <button
                              key={genre}
                              onClick={() => {
                                trigger('light');
                                setGenreAndSyncUrl(selectedGenre === genre ? null : genre);
                              }}
                              className={cn(
                                'px-4 py-2 rounded-full text-sm border transition-all duration-200',
                                selectedGenre === genre
                                  ? 'bg-[#7DBEEE] text-[#000000] border-[#A6B2E1] font-semibold scale-105 shadow-lg shadow-[#7DBEEE]/20'
                                  : 'bg-[#555759]/60 text-[#CFC6DB] border-[#EEEef4]/10 hover:bg-[#555759]/90 hover:border-[#EEEef4]/30'
                              )}
                            >
                              {genre}
                              <span className="ml-2 opacity-70 text-xs">
                                {genreCounts.get(genre) ?? 0}
                              </span>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-4 relative group">
                  <button
                    onClick={() => {
                      trigger('medium');
                      setShowFeaturedOnly((v) => !v);
                    }}
                    className={cn(
                      'px-8 py-4 rounded-full text-base font-bold font-sans tracking-wide uppercase flex items-center gap-3 border-2 transition-all shadow-lg',
                      showFeaturedOnly
                        ? 'bg-[#d4153e] text-[#FFFFFF] border-[#d4153e] scale-105 shadow-[#d4153e]/40'
                        : 'bg-[#d4153e]/20 text-[#FFFFFF] border-[#d4153e] hover:bg-[#d4153e]/30 hover:scale-105 hover:shadow-[#d4153e]/30'
                    )}
                  >
                    <div className={cn(
                      'p-1.5 rounded-full transition-all',
                      showFeaturedOnly
                        ? 'bg-[#FFFFFF]/20'
                        : 'bg-[#d4153e]/20'
                    )}>
                      <Star className={cn(
                        'w-5 h-5 transition-all',
                        showFeaturedOnly ? 'fill-[#FFFFFF] text-[#FFFFFF]' : 'fill-[#FFFFFF] text-[#FFFFFF]'
                      )} />
                    </div>
                    {showFeaturedOnly ? copy[language].ui.showingResidentsOnly : copy[language].ui.showResidentsOnly}
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-[#000000]/95 backdrop-blur-sm border border-[#EEEef4]/20 rounded-lg text-sm text-[#EEEef4] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-xl max-w-xs sm:max-w-sm text-center leading-relaxed">
                    {copy[language].ui.residentTooltip}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="w-2 h-2 bg-[#000000]/95 border-r border-b border-[#EEEef4]/20 rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>

              {(searchTerm || showFeaturedOnly || selectedGenre) && (
                <div className="pt-4 border-t border-[#EEEef4]/10 text-center">
                  <p className="text-[#CFC6DB]">
                    {filteredArtists.length === 0
                      ? copy[language].ui.noMatches
                      : language === 'en'
                        ? `Found ${filteredArtists.length} artist${filteredArtists.length !== 1 ? 's' : ''}`
                        : `${copy[language].ui.foundPrefix} ${filteredArtists.length} ${filteredArtists.length === 1 ? 'sanatçı' : 'sanatçı'}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </SoftCard>

        {/* Artists Grid */}
        <div ref={rosterRef} className="mt-16 pb-24" id="roster">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music className="w-16 h-16 text-[#555759] mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-semibold text-[#EEEef4] mb-2">
                {copy[language].ui.loading}
              </h3>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music className="w-16 h-16 text-[#d4153e] mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-[#EEEef4] mb-2">
                {copy[language].ui.errorTitle}
              </h3>
              <p className="text-[#CFC6DB]">{error.message}</p>
            </motion.div>
          ) : filteredArtists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music className="w-16 h-16 text-[#555759] mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-[#EEEef4] mb-2">
                {copy[language].ui.emptyTitle}
              </h3>
              <p className="text-[#CFC6DB]">
                {copy[language].ui.emptyBody}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {filteredArtists.map((artist, index) => (
                <motion.button
                  key={artist.id}
                  type="button"
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.2, delay: index * 0.01, ease: "easeOut" }}
                  onClick={() => handleArtistClick(artist)}
                  className="group cursor-pointer h-full text-left"
                >
                  <div className={cn(
                    "backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 transform-gpu hover:-translate-y-2 h-full flex flex-col relative",
                    artist.featured
                      ? "bg-gradient-to-br from-[#d4153e]/20 via-[#555759]/70 to-[#d4153e]/15 border-2 border-[#d4153e]/50 hover:border-[#d4153e] hover:shadow-2xl hover:shadow-[#d4153e]/30 ring-2 ring-[#d4153e]/20"
                      : "bg-[#555759]/60 border border-[#EEEef4]/10 hover:border-[#EEEef4]/30 hover:shadow-2xl hover:shadow-[#7DBEEE]/10"
                  )}>
                    {/* Resident DJ Glow Effect */}
                    {artist.featured && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#d4153e]/10 via-transparent to-[#d4153e]/10 rounded-2xl pointer-events-none" />
                    )}

                    {/* Artist Image */}
                    <div className="relative aspect-[4/5] overflow-hidden flex-shrink-0">
                      <img
                        src={artist.photo_url || '/placeholder.svg'}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-t transition-opacity duration-200",
                        artist.featured
                          ? "from-[#d4153e]/40 via-[#000000]/30 to-transparent opacity-70 group-hover:opacity-90"
                          : "from-[#000000]/80 via-[#000000]/20 to-transparent opacity-60 group-hover:opacity-80"
                      )} />

                      {artist.featured && (
                        <div className="absolute top-3 left-3 z-10">
                          <div className="bg-[#d4153e] text-[#FFFFFF] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xl shadow-[#d4153e]/50 border-2 border-[#d4153e]">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{copy[language].ui.residentBadge}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Artist Info */}
                    <div className="p-6 flex-1 flex flex-col relative">
                      <div className={cn(
                        "absolute top-0 left-0 right-0 h-px bg-gradient-to-r transition-all duration-300",
                        artist.featured
                          ? "from-[#d4153e]/30 via-[#d4153e]/60 to-[#d4153e]/30 group-hover:via-[#d4153e]"
                          : "from-transparent via-[#EEEef4]/10 to-transparent group-hover:via-[#7DBEEE]/50"
                      )} />

                      <div className="mb-auto">
                        <h3 className={cn(
                          "text-2xl font-bold mb-2 transition-colors leading-none",
                          artist.featured
                            ? "text-[#d4153e] group-hover:text-[#d4153e]"
                            : "text-[#EEEef4] group-hover:text-[#A6B2E1]"
                        )}>
                          {artist.name}
                        </h3>

                        {artist.location && (
                          <div className="flex items-center gap-2 text-[#CFC6DB] mb-4">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs uppercase tracking-[0.2em] opacity-70">
                              {artist.location}
                            </span>
                          </div>
                        )}

                        {artist.genre && artist.genre.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {artist.genre.slice(0, 3).map((genre: string) => (
                              <span
                                key={genre}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] uppercase tracking-wide",
                                  artist.featured
                                    ? "bg-[#d4153e]/20 text-[#d4153e] border border-[#d4153e]/40"
                                    : "bg-[#555759]/30 text-[#CFC6DB] border border-[#EEEef4]/10"
                                )}
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={cn(
                        "mt-4 pt-4 flex items-center justify-between text-xs transition-colors",
                        artist.featured
                          ? "border-t border-[#d4153e]/30 text-[#d4153e] group-hover:text-[#d4153e]"
                          : "border-t border-[#EEEef4]/5 text-[#555759] group-hover:text-[#CFC6DB]"
                      )}>
                        <span className={cn(
                          "transition-opacity duration-200",
                          artist.featured
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                        )}>
                          {copy[language].ui.viewProfile}
                        </span>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                          artist.featured
                            ? "bg-[#d4153e]/40 text-[#FFFFFF] group-hover:bg-[#d4153e] group-hover:scale-110 shadow-lg shadow-[#d4153e]/30"
                            : "bg-[#555759]/30 group-hover:bg-[#7DBEEE] group-hover:text-[#000000]"
                        )}>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}