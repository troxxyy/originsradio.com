import Link from 'next/link'
import { ArrowUpRight, Headphones, Radio } from 'lucide-react'
import PageLayout from '@/components/layout/PageLayout'
import JsonLd from '@/components/seo/JsonLd'
import { getPublicArtists, getPublicBlogs, getPublicProjects } from '@/lib/public-content'
import { absoluteUrl, breadcrumbs, pageMetadata } from '@/lib/seo'

export const revalidate = 300

const path = '/ankara-elektronik-muzik'
const title = 'Ankara Elektronik Müzik: DJ’ler, Radyo ve Etkinlik Arşivi'
const description = 'Ankara’da elektronik müziği OriginsRadio ile keşfet. Şehirdeki DJ profillerine, techno ve house setlerine, haftalık radyo programına ve etkinlik arşivine ulaş.'
const baseMetadata = pageMetadata(title, description, path)
export const metadata = {
  ...baseMetadata,
  openGraph: { ...baseMetadata.openGraph, locale: 'tr_TR' },
}

const textLink = 'inline-flex items-center gap-2 py-3 text-sm font-medium text-stone-200 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200'

export default async function AnkaraMusicPage() {
  const [artists, projects, blogs] = await Promise.all([getPublicArtists(), getPublicProjects(), getPublicBlogs()])
  const localArtists = artists.filter(artist => artist.slug && /ankara/i.test(artist.location || ''))
  const archive = projects.filter(project => project.slug && !project.upcoming && /ankara/i.test(project.location || ''))
  const stories = blogs.filter(blog => /ankara/i.test(`${blog.title} ${blog.excerpt || ''}`))
  const genres = [...new Set(localArtists.flatMap(artist => artist.genre || []))].sort((a, b) => a.localeCompare(b, 'tr'))

  return (
    <PageLayout customBackground="bg-stone-950">
      <JsonLd data={[
        {
          '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description,
          url: absoluteUrl(path), inLanguage: 'tr',
          mainEntity: {
            '@type': 'ItemList', name: 'OriginsRadio’daki Ankara sanatçıları',
            itemListElement: localArtists.map((artist, index) => ({
              '@type': 'ListItem', position: index + 1, name: artist.name,
              url: absoluteUrl(`/artists/${artist.slug}`),
            })),
          },
        },
        breadcrumbs([{ name: 'Ana sayfa', path: '/' }, { name: 'Ankara’da elektronik müzik', path }]),
      ]} />
      <main lang="tr" className="bg-gradient-to-br from-amber-950/20 via-transparent to-stone-900/30 px-5 pb-12 text-stone-100 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="border-b border-white/10 py-16 sm:py-24">
            <nav aria-label="Sayfa yolu" className="mb-10 text-xs tracking-wide text-stone-400">
              <Link href="/" className="hover:text-white">OriginsRadio</Link>
              <span aria-hidden="true" className="mx-3">/</span>
              <span>Ankara</span>
            </nav>
            <p className="mb-5 text-xs uppercase tracking-[0.22em] text-amber-100/70">Şehirden yayına</p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Ankara’da<br /><span className="text-stone-400">elektronik müzik.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-stone-300">
              Yeni bir DJ, uzun bir set ya da geçmiş bir gecenin hikâyesi.
              OriginsRadio’nun Ankara bağlantısını sanatçı profillerinden, radyo yayınlarından ve etkinlik arşivinden keşfet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/radio/schedule" className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-6 py-3 text-sm font-semibold text-stone-950 transition-colors hover:bg-white">
                <Radio className="h-4 w-4" aria-hidden="true" /> Radyo programı
              </Link>
              <Link href="#sanatcilar" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10">
                Ankara’daki DJ’leri keşfet <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-6 text-sm">
              <div><dt className="text-stone-400">Ankara konumlu sanatçı</dt><dd className="mt-1 text-3xl font-semibold">{localArtists.length}</dd></div>
              <div><dt className="text-stone-400">Ankara etkinlik arşivi</dt><dd className="mt-1 text-3xl font-semibold">{archive.length}</dd></div>
              <div><dt className="text-stone-400">Yayın saatleri</dt><dd className="mt-2 font-medium">Türkiye saati · UTC+3</dd></div>
            </dl>
          </header>

          <section aria-labelledby="dinle-baslik" className="grid gap-8 border-b border-white/10 py-14 md:grid-cols-2 md:gap-16">
            <div>
              <Headphones className="mb-5 h-6 w-6 text-amber-100/70" aria-hidden="true" />
              <h2 id="dinle-baslik" className="text-2xl font-semibold sm:text-3xl">Önce bir set aç.</h2>
              <p className="mt-5 leading-relaxed text-stone-300">
                Techno’dan house’a, farklı DJ’lerin müziğe yaklaşımını bir set boyunca dinleyebilirsin.
                Ana sayfadaki oynatıcıdan yayına veya gösterilen son sete ulaş; haftalık programdan kimlerin ne zaman çaldığını takip et.
                Programdaki saatler İstanbul saat diliminde gösterilir.
              </p>
              <Link href="/" className={textLink}>Oynatıcıya git <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
              <h3 className="text-xl font-semibold">Bir sonraki dinleme rotan</h3>
              <p className="mt-4 leading-relaxed text-stone-300">
                Sevdiğin bir türden başla. Sanatçı listesindeki tür filtresiyle profilleri daralt;
                profillerdeki setleri, biyografileri ve sosyal bağlantıları incele.
                Tanıdığın bir ismin yanına yeni bir seçki eklemek için radyo programına dön.
              </p>
              <Link href="/radio/schedule" className={textLink}>Haftalık yayınları gör <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </section>

          <section id="sanatcilar" aria-labelledby="sanatci-baslik" className="scroll-mt-32 border-b border-white/10 py-14">
            <h2 id="sanatci-baslik" className="text-2xl font-semibold sm:text-3xl">Ankara’dan DJ’ler ve seçkileri</h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-stone-300">
              Buradaki isimler, OriginsRadio profillerinde konumu Ankara olarak belirtilen sanatçılar.
              Tür etiketleri her sanatçının profilinden geliyor; bir isme tıklayarak kendi müziğini ve hikâyesini keşfedebilirsin.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {localArtists.map(artist => (
                <li key={artist.id}>
                  <Link href={`/artists/${artist.slug}`} className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.06]">
                    <div><h3 className="font-semibold">{artist.name}</h3><p className="mt-2 text-sm leading-relaxed text-stone-400">{artist.genre?.length ? artist.genre.join(' · ') : 'Sanatçı profilini keşfet'}</p></div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-stone-400 group-hover:text-white" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2" aria-label="Müzik türlerine göre tüm sanatçılar">
              {genres.map(genre => <Link key={genre} href={`/artists?genre=${encodeURIComponent(genre)}`} className="rounded-full border border-white/10 px-4 py-2 text-xs text-stone-300 hover:border-white/30 hover:text-white">{genre}</Link>)}
            </div>
            <Link href="/artists" className={textLink}>Tüm şehirlerden sanatçılar <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </section>

          <section aria-labelledby="arsiv-baslik" className="border-b border-white/10 py-14">
            <h2 id="arsiv-baslik" className="text-2xl font-semibold sm:text-3xl">Gecelerden kalanlar</h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-stone-300">
              Ankara’daki geçmiş buluşmaları, kadroları ve etkinlik hikâyelerini arşivden takip edebilirsin.
              Aşağıdaki kayıtlar geçmiş etkinliklerdir. Yeni bir gece için etkinlikler sayfasındaki duyuruları ve organizatörün güncel tarih, mekân ve bilet bilgisini kontrol et.
            </p>
            <ul className="mt-8 grid gap-3 md:grid-cols-2">
              {archive.map(project => <li key={project.id}>
                <Link href={`/events/${project.slug}`} className="flex h-full items-center justify-between gap-5 rounded-2xl border border-white/10 p-5 transition-colors hover:bg-white/5">
                  <div><p className="mb-2 text-xs text-amber-100/60">Arşiv</p><h3 className="font-semibold">{project.title}</h3><p className="mt-2 text-sm text-stone-400">{project.location}</p></div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                </Link>
              </li>)}
            </ul>
            <Link href="/events" className={textLink}>Etkinlikler ve tüm arşiv <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </section>

          <section aria-labelledby="iletisim-baslik" className="grid gap-10 py-14 md:grid-cols-2 md:gap-16">
            <div>
              <h2 id="iletisim-baslik" className="text-2xl font-semibold">Bir gece ya da yayın planlıyorsan</h2>
              <p className="mt-5 leading-relaxed text-stone-300">
                DJ booking talebinde tarih, şehir, mekân, müzik yönü ve düşündüğün sanatçıyı paylaş.
                Radyo için bir mix önermek istiyorsan dinleme bağlantını, türünü ve kısa sanatçı bilgini ekle.
                Ekibe <a href="mailto:info@originsradio.com" className="text-stone-100 underline underline-offset-4">info@originsradio.com</a> üzerinden ulaşabilirsin.
              </p>
              <Link href="/about" className={textLink}>OriginsRadio’nun hikâyesi <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Sahnenin hikâyelerini oku</h2>
              <p className="mt-5 leading-relaxed text-stone-300">Blogda elektronik müzik kültürü ve sahnenin arka planı üzerine yayımlanmış yazıları bulabilirsin.</p>
              {stories.map(blog => <Link key={blog.id} href={`/blog/${blog.slug}`} className={`${textLink} mt-3 border-b border-white/10`}>{blog.title}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>)}
              <div><Link href="/blog" className={textLink}>Tüm yazılar <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
            </div>
          </section>
        </div>
      </main>
    </PageLayout>
  )
}
