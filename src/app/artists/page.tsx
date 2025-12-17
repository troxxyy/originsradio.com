'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
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
      titleBottom: "and the future.",
      paragraphs: [
        "we do not just book names. we book taste, intention, and respect for the room.",
        "browse the roster, filter by genre, and if you’re a new talent with a point of view—apply for management.",
      ],
      actions: {
        browseRoster: "browse roster",
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
      subtitle: "origins management is for artists we truly believe in.",
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
      titleBottom: "ve gelecek.",
      paragraphs: [
        "biz sadece isimleri book’lamıyoruz. zevki, niyeti ve mekâna saygıyı book’luyoruz.",
        "kadroyu incele, türlere göre filtrele; yeni bir yeteneksen ve bir bakış açın varsa—menajerlik için başvur.",
      ],
      actions: {
        browseRoster: "kadroyu incele",
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
      subtitle: "origins management, gerçekten inandığımız sanatçılar içindir.",
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
      showResidentsOnly: "Sadece Resident’lar",
      showingResidentsOnly: "Sadece Resident’lar Gösteriliyor",
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
        <p className="text-cyan-300/70 text-xs md:text-sm uppercase tracking-[0.22em] mb-3">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-4 text-base md:text-lg text-stone-400 ${
            center ? 'max-w-2xl mx-auto' : 'max-w-2xl'
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

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
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
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      };

  return (
    <PageLayout>
      {/* Cyan/teal background for artist pages */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-neutral-950 to-stone-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/15 via-transparent to-teal-900/20" />
        <div className="absolute -left-40 -top-40 w-[620px] h-[620px] rounded-full bg-cyan-900/10 blur-[160px]" />
        <div className="absolute right-0 top-1/3 w-[520px] h-[520px] rounded-full bg-teal-950/10 blur-[140px]" />
        <div className="absolute -left-16 bottom-0 w-[420px] h-[420px] rounded-full bg-stone-800/15 blur-[120px]" />
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
          onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
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
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-[1.05] text-left md:text-center">
              {copy[language].hero.titleTop}
              <br />
              <span className="text-cyan-300/85">{copy[language].hero.titleBottom}</span>
            </h1>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-left">
            {copy[language].hero.paragraphs.map((p) => (
              <p key={p} className="text-lg md:text-xl text-stone-300 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {heroStats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10"
              >
                <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-stone-400 uppercase tracking-[0.18em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <motion.button
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-white text-stone-950 font-semibold hover:bg-stone-100 transition-colors"
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              type="button"
              onClick={() => {
                rosterRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
              }}
            >
              {copy[language].hero.actions.browseRoster} <ArrowRight className="inline w-4 h-4 ml-2" />
            </motion.button>
            <motion.button
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-stone-900/40 border border-white/15 text-white font-semibold hover:bg-stone-900/60 transition-colors"
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              type="button"
              onClick={() => {
                const el = document.getElementById('booking');
                el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
              }}
            >
              {copy[language].hero.actions.bookByGenre} <ArrowRight className="inline w-4 h-4 ml-2" />
            </motion.button>
            <a href={copy[language].management.ctaPrimaryLink} className="w-full sm:w-auto">
              <motion.div
                className="w-full px-7 py-3 rounded-full bg-cyan-300 text-stone-950 font-semibold hover:bg-cyan-200 transition-colors text-center"
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
      <section className="relative z-10 py-16 md:py-24 bg-black/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <SectionTitle
                eyebrow={copy[language].management.eyebrow}
                title={copy[language].management.title}
                subtitle={copy[language].management.subtitle}
              />
              <div className="space-y-4 text-lg text-stone-300 leading-relaxed">
                {copy[language].management.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div>
                <a
                  href={copy[language].management.ctaPrimaryLink}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-stone-950 font-semibold hover:bg-stone-100 transition-colors text-base"
                >
                  {copy[language].management.ctaPrimary} <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
               <SoftCard>
                  <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[400px]">
                      <motion.div
                        className="w-62 h-62 rounded-full bg-cyan-400/10 flex items-center justify-center mb-4"
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
                          src="/originslogo.png" 
                          alt="Origins Radio" 
                          width={220} 
                          height={220} 
                          className="object-contain"
                        />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white">{copy[language].management.card.title}</h3>
                      <p className="text-stone-400 leading-relaxed">
                        {copy[language].management.card.body}
                      </p>
                      <ul className="text-left text-stone-300 space-y-3 w-full max-w-xs mx-auto">
                        <li className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                          <span>{copy[language].management.card.bullets[0]}</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                          <span>{copy[language].management.card.bullets[1]}</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
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
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-500 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={copy[language].ui.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-24 py-4 bg-stone-900/70 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300/40 transition-all text-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-stone-500 text-xs">
                  <kbd className="px-2 py-1 bg-stone-900/80 rounded border border-white/10 text-[11px] font-mono">
                    {typeof navigator !== 'undefined' &&
                    navigator.platform.indexOf('Mac') > -1
                      ? '⌘'
                      : 'Ctrl'}
                  </kbd>
                  <span>{copy[language].ui.keyboardHintOr}</span>
                  <kbd className="px-2 py-1 bg-stone-900/80 rounded border border-white/10 text-[11px] font-mono">
                    K
                  </kbd>
                </div>
              </div>

              {/* Genre Clouds */}
              <div className="flex flex-col items-center gap-4">
                 <div className="flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => setGenreAndSyncUrl(null)}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm border transition-all duration-300',
                          !selectedGenre
                            ? 'bg-white text-stone-950 border-white font-semibold scale-105 shadow-lg shadow-white/10'
                            : 'bg-stone-900/60 text-stone-300 border-white/10 hover:bg-stone-800/90 hover:border-white/30'
                        )}
                      >
                        {copy[language].ui.allGenres}
                      </button>
                      {allGenres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() =>
                            setGenreAndSyncUrl(selectedGenre === genre ? null : genre)
                          }
                          className={cn(
                            'px-4 py-2 rounded-full text-sm border transition-all duration-300',
                            selectedGenre === genre
                              ? 'bg-cyan-300 text-stone-950 border-cyan-400 font-semibold scale-105 shadow-lg shadow-cyan-400/20'
                              : 'bg-stone-900/60 text-stone-300 border-white/10 hover:bg-stone-800/90 hover:border-white/30'
                          )}
                        >
                          {genre}
                          <span className="ml-2 opacity-70 text-xs">
                            {genreCounts.get(genre) ?? 0}
                          </span>
                        </button>
                      ))}
                 </div>
                 
                 <div className="mt-2">
                    <button
                      onClick={() => setShowFeaturedOnly((v) => !v)}
                      className={cn(
                        'px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 border transition-all',
                        showFeaturedOnly
                          ? 'bg-cyan-300 text-stone-950 border-cyan-400'
                          : 'bg-transparent text-cyan-200 border-cyan-400/30 hover:bg-cyan-400/10'
                      )}
                    >
                      <Star className="w-4 h-4 fill-current" />
                      {showFeaturedOnly ? copy[language].ui.showingResidentsOnly : copy[language].ui.showResidentsOnly}
                    </button>
                 </div>
              </div>

              {(searchTerm || showFeaturedOnly || selectedGenre) && (
                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-stone-400">
                    {filteredArtists.length === 0
                      ? copy[language].ui.noMatches
                      : language === 'en'
                        ? `Found ${filteredArtists.length} artist${filteredArtists.length !== 1 ? 's' : ''}`
                        : `${copy[language].ui.foundPrefix} ${filteredArtists.length} ${filteredArtists.length === 1 ? 'sanatçı' : 'sanatçı'}`}
                  </p>
                </div>
              )}

              <div className="pt-6 flex justify-center">
                <a
                  href={bookingMailto}
                  className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-cyan-300 text-stone-950 font-semibold hover:bg-cyan-200 transition-colors"
                >
                  {copy[language].booking.cta} <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </div>
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
              <Music className="w-16 h-16 text-stone-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                {copy[language].ui.loading}
              </h3>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                {copy[language].ui.errorTitle}
              </h3>
              <p className="text-stone-400">{error.message}</p>
            </motion.div>
          ) : filteredArtists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                {copy[language].ui.emptyTitle}
              </h3>
              <p className="text-stone-400">
                {copy[language].ui.emptyBody}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {filteredArtists.map((artist, index) => (
                <motion.button
                  key={artist.id}
                  type="button"
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  onClick={() => handleArtistClick(artist)}
                  className="group cursor-pointer h-full text-left"
                >
                  <div className="bg-stone-950/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-900/10 transform-gpu hover:-translate-y-2 h-full flex flex-col">
                    {/* Artist Image */}
                    <div className="relative aspect-[4/5] overflow-hidden flex-shrink-0">
                      <img
                        src={artist.photo_url || '/placeholder.svg'}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                      {artist.featured && (
                        <div className="absolute top-3 left-3 z-10">
                          <div className="bg-cyan-300 text-stone-950 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg border border-cyan-500/40">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{copy[language].ui.residentBadge}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Artist Info */}
                    <div className="p-6 flex-1 flex flex-col relative">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-cyan-400/50 transition-all duration-500" />
                      
                      <div className="mb-auto">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors leading-none">
                          {artist.name}
                        </h3>

                        {artist.location && (
                          <div className="flex items-center gap-2 text-stone-400 mb-4">
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
                                className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-stone-300 border border-white/10 uppercase tracking-wide"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-stone-500 group-hover:text-stone-400 transition-colors">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">{copy[language].ui.viewProfile}</span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-300 group-hover:text-black transition-all duration-300">
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