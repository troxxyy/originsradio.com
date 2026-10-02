'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Plus, X } from 'lucide-react'
import PageLayout from '@/components/layout/PageLayout'
import NaturalBackground from '@/components/ui/NaturalBackground'
import SocialBubbles from '@/components/social/SocialBubbles'
import styles from './merch.module.css'

const MerchStage = dynamic(() => import('./MerchStage'), {
  ssr: false,
  loading: () => <div className={`${styles.viewer} ${styles.stageLoading}`} role="status">Preparing the 303 preview…</div>,
})

const colors = [
  { name: 'Forest', color: '#3e5138', src: '/merch/lookbook/1.png', alt: 'Forest green cap with a matching tied scarf' },
  { name: 'Sand / Black', color: '#bcaa8e', src: '/merch/lookbook/2.png', alt: 'Black scarf cap with a sand colored brim' },
  { name: 'Ivory / Blue', color: '#e3dfd2', src: '/merch/lookbook/3.png', alt: 'Ivory scarf cap with a blue brim' },
  { name: 'Rose', color: '#bb7d88', src: '/merch/lookbook/4.png', alt: 'Rose pink scarf cap with a burgundy brim' },
]
const gallery = [
  ...colors,
  { name: 'Afterhours / 01', src: '/merch/lookbook/5.png', alt: 'Afterhours campaign portrait with a brown OriginsRadio headscarf' },
  { name: 'Afterhours / 02', src: '/merch/lookbook/8.png', alt: 'Afterhours campaign portrait with a khaki OriginsRadio headscarf' },
  { name: 'No.303 / Acid Bass', src: '/merch/acid-bass-303.jpg', alt: 'No.303 Acid Bass campaign featuring the blue smile cap from several angles' },
]

export default function MerchPageClient() {
  const [color, setColor] = useState(0)
  const [photo, setPhoto] = useState<number | null>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const openPhoto = (index: number, target: HTMLButtonElement) => { openerRef.current = target; setPhoto(index) }
  const step = (direction: number) => setPhoto((current) => current === null ? null : (current + direction + gallery.length) % gallery.length)

  return (
    <PageLayout>
      <NaturalBackground />
      <SocialBubbles />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="merch-title">
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span className={styles.dot} /> ORIGINSRADIO / MERCH</div>
            <h1 id="merch-title">for the<br /><span>afterhours.</span></h1>
            <p className={styles.heroDescription}>For the nights that turn into mornings.<br />A first look at what we’re making.</p>
            <a className={styles.primaryLink} href="#collection">Explore the collection <ArrowDown size={17} /></a>
            <div className={styles.heroNote}><span className={styles.dot} /> First edition · coming soon</div>
          </div>
          <MerchStage />
        </section>

        <section className={styles.collection} id="collection" aria-labelledby="collection-title">
          <header className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>01 / AFTERHOURS SERIES</p><h2 id="collection-title">good vibes.<br />long nights.</h2></div>
            <p>The sounds, the people, the feeling.<br />A collection that carries it with you.</p>
          </header>
          <div className={styles.collectionGrid}>
            <div className={styles.product}>
              <button className={styles.productImage} onClick={(event) => openPhoto(color, event.currentTarget)} aria-label={`Enlarge ${colors[color].name} cap`}>
                <Image src={colors[color].src} alt={colors[color].alt} fill sizes="(max-width: 700px) 100vw, 50vw" />
                <span className={styles.enlarge}><Plus size={18} /><span>View detail</span></span>
              </button>
              <div className={styles.productDetails}>
                <div><h3>The scarf cap</h3><p aria-live="polite">{colors[color].name}</p></div>
                <div className={styles.swatches} role="group" aria-label="Scarf cap color">
                  {colors.map((item, index) => <button key={item.name} aria-label={item.name} aria-pressed={color === index} onClick={() => setColor(index)} style={{ '--swatch': item.color } as React.CSSProperties}><span /></button>)}
                </div>
              </div>
              <p className={styles.productNote}>Four color studies. One afterhours state of mind.</p>
            </div>
            <div className={styles.editorial}>
              <button className={styles.editorialImage} onClick={(event) => openPhoto(4, event.currentTarget)} aria-label="Open Afterhours campaign portrait">
                <Image src={gallery[4].src} alt={gallery[4].alt} fill sizes="(max-width: 700px) 100vw, 45vw" />
                <span className={styles.enlarge}><Plus size={18} /></span>
              </button>
              <div className={styles.editorialCaption}><span>AFTER THE LAST TRACK.</span><span>STILL WITH YOU.</span></div>
            </div>
          </div>
          <div className={styles.storyRow}>
            <button className={styles.storyImage} onClick={(event) => openPhoto(5, event.currentTarget)} aria-label="Open second Afterhours campaign portrait">
              <Image src={gallery[5].src} alt={gallery[5].alt} fill sizes="(max-width: 700px) 100vw, 40vw" />
              <span className={styles.enlarge}><Plus size={18} /></span>
            </button>
            <div className={styles.storyCopy}><p className={styles.eyebrow}>ORIGINS IN EVERY DETAIL</p><h2>same energy.<br />different form.</h2><p>Off the air. Out in the world.<br />Made for the people who keep listening.</p><a href="#acid-bass">Meet No.303 <ArrowDown size={17} /></a></div>
          </div>
        </section>

        <section className={styles.acid} id="acid-bass" aria-labelledby="acid-title">
          <div className={styles.acidCopy}><p className={styles.eyebrow}>02 / ACID BASS SERIES</p><h2 id="acid-title">no.303<br /><span>acid bass.</span></h2><p>A little acid. A lot of good energy.<br />Our blue cap, with a familiar smile.</p><button className={styles.outlineLink} onClick={(event) => openPhoto(6, event.currentTarget)}>Explore the campaign <ArrowUpRight size={17} /></button><span className={styles.acidFootnote}>COLLECTION PREVIEW / COMING SOON</span></div>
          <button className={styles.acidImage} onClick={(event) => openPhoto(6, event.currentTarget)} aria-label="Enlarge No.303 Acid Bass campaign"><Image src="/merch/acid-bass-303.jpg" alt={gallery[6].alt} fill sizes="(max-width: 700px) 100vw, 55vw" /><span className={styles.enlarge}><Plus size={18} /></span></button>
        </section>

        <section className={styles.drop} aria-labelledby="drop-title"><p className={styles.eyebrow}>THE FIRST DROP IS ON ITS WAY</p><h2 id="drop-title">stay on the<br />same frequency.</h2><div className={styles.dropLinks}><a className={styles.primaryLink} href="https://www.instagram.com/origins.radio/" target="_blank" rel="noopener noreferrer">Follow the drop <ArrowUpRight size={17} /></a><a className={styles.emailLink} href="mailto:info@originsradio.com?subject=OriginsRadio%20Merch">Ask us about merch <ArrowUpRight size={16} /></a></div></section>
      </main>

      <Dialog.Root open={photo !== null} onOpenChange={(open) => { if (!open) setPhoto(null) }}>
        <Dialog.Portal><Dialog.Overlay className={styles.overlay} /><Dialog.Content className={styles.lightbox} aria-describedby={undefined} onCloseAutoFocus={(event) => { event.preventDefault(); openerRef.current?.focus() }} onKeyDown={(event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1) } }}>
          <div className={styles.lightboxHeader}><Dialog.Title>{photo !== null ? gallery[photo].name : 'Collection preview'}</Dialog.Title><Dialog.Close aria-label="Close image"><X size={22} /></Dialog.Close></div>
          {photo !== null && <div className={styles.lightboxImage}><Image src={gallery[photo].src} alt={gallery[photo].alt} fill sizes="(max-width: 700px) 100vw, 80vw" /></div>}
          <div className={styles.lightboxNav}><button onClick={() => step(-1)} aria-label="Previous image"><ArrowLeft size={20} /></button><span aria-live="polite">{(photo ?? 0) + 1} / {gallery.length}</span><button onClick={() => step(1)} aria-label="Next image"><ArrowRight size={20} /></button></div>
        </Dialog.Content></Dialog.Portal>
      </Dialog.Root>
    </PageLayout>
  )
}
