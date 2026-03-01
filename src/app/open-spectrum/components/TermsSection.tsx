'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, FileText, Scale, Shield, Music2, Trophy, AlertTriangle } from 'lucide-react';

const sections = [
    {
        number: "1",
        icon: FileText,
        title: "Proje Vizyonu ve Genel Tanım",
        content: [
            {
                text: 'OriginsRadio tarafından düzenlenen "Open Spectrum 2026", Türkiye elektronik müzik sahnesinin yeni nesil yeteneklerini keşfetmeyi, desteklemeyi ve sektöre kazandırmayı amaçlayan çok aşamalı bir prodüktör yarışmasıdır.',
            },
            {
                text: '"Sınırları Kaldır, Sesi Yarat" vizyonuyla hareket eden yarışmada, katılımcıların teknik becerileri, yaratıcılıkları ve disiplinleri test edilmektedir.',
            },
        ],
    },
    {
        number: "2",
        icon: Shield,
        title: "Katılım Şartları ve Başvuru Esasları",
        content: [
            {
                label: "Uyruk ve İkamet",
                text: "Yarışma yalnızca Türkiye Cumhuriyeti vatandaşlarına veya Türkiye'de yasal ikametgahı bulunan prodüktörlerin katılımına açıktır.",
            },
            {
                label: "Müzikal Tür Serbestisi",
                text: "Yarışma kapsamında herhangi bir tür (genre) kısıtlaması bulunmamaktadır; House, Techno, Melodic, Experimental ve diğer tüm elektronik müzik alt türlerinde başvurular kabul edilmektedir.",
            },
            {
                label: "Başvuru Kanalları",
                text: "Tüm başvurular dijital ortamda, yalnızca originsradio.com resmi web sitesi üzerinden gerçekleştirilmelidir.",
            },
            {
                label: "Yasal Onaylar",
                text: "Katılımcıların başvuru formunu tamamlarken Telif Hakları beyanı ve KVKK (Kişisel Verilerin Korunması Kanunu) metinlerini onaylamaları zorunludur.",
            },
        ],
    },
    {
        number: "3",
        icon: Music2,
        title: "Eser Sahipliği ve Teknik Kriterler",
        content: [
            {
                label: "Orijinallik Yükümlülüğü",
                text: "Yarışmaya gönderilen tüm eserler %100 özgün olmalı; üçüncü şahısların fikri mülkiyet haklarını ihlal eden vokal, izinsiz örnekleme (sample) veya bootleg içerikler barındırmamalıdır.",
            },
            {
                label: "Prodüksiyon Kalitesi",
                text: "Başvuru aşamasında sunulan parçaların mix ve mastering işlemlerinin tamamlanmış, yayınlanmaya hazır standartlarda olması beklenmektedir.",
            },
            {
                label: "Materyal Kullanım Zorunluluğu",
                text: 'Yarışmanın 2. turunda mentörler tarafından sağlanan örneklerin ve 3. turda sağlanan "Sample Pack" içeriğinin, üretilen parçada belirgin ve duyulabilir şekilde kullanılması bir eleme kriteridir.',
            },
        ],
    },
    {
        number: "4",
        icon: FileText,
        title: "Yarışma Formatı ve Eleme Süreçleri",
        content: [
            {
                label: "4.1 — Birinci Tur: Ön Eleme ve Halk Oylaması",
                text: "Başvuru süreci 2 hafta boyunca devam eder ve başvuru sayısında herhangi bir üst sınır bulunmaz. Jüri heyeti tüm başvuruları değerlendirerek en başarılı 24 eseri ön elemeden geçirir. Seçilen 24 eser web sitesinde oylamaya açılır; dinleyici etkileşimi (like/beğeni) sonucunda en yüksek puanı alan 12 prodüktör bir üst tura yükselir.",
            },
            {
                label: "4.2 — İkinci Tur: Draft Günü ve Mentör Remix (The Signature)",
                text: "3 ana jüri üyesi (mentör), kalan 12 prodüktörü kendi takımlarına dahil eder; her mentörün takımında 4 prodüktör yer alır. Her katılımcı, bağlı bulunduğu mentörün kendisine atanan bir parçasına kendi imzasını taşıyan özgün bir Remix hazırlamakla yükümlüdür. Mentörler, kendi grupları içerisindeki en başarılı Remix çalışmasını seçerek toplamda 3 finalist belirler.",
            },
            {
                label: "4.3 — Üçüncü Tur: Büyük Final (The Masterclass)",
                text: 'Finalistler, Guest Jüri tarafından hazırlanan özel bir "Sample Pack" kullanarak yeni bir parça üretirler. Şampiyon belirlenirken Mentör Jüri puanı %50, Guest Jüri puanı %25 ve Halk Oylaması %25 oranında etki eder.',
            },
        ],
    },
    {
        number: "5",
        icon: Trophy,
        title: "Ödüller ve Kariyer Desteği",
        content: [
            {
                label: "Sahne Alma Fırsatı",
                text: "Kite Club'da kaşeli (ücretli) performans sergileme hakkı.",
            },
            {
                label: "Profesyonel Tanıtım (Press Kit)",
                text: "Sanatçı fotoğrafları, biyografi yazımı ve profesyonel logo tasarımı desteği.",
            },
            {
                label: "Radyo ve Residentlik",
                text: 'OriginsRadio bünyesinde resmi "Resident DJ" statüsü ve düzenli radyo slotu imkanı.',
            },
        ],
    },
    {
        number: "6",
        icon: Scale,
        title: "Disiplin ve Hukuki Hükümler",
        content: [
            {
                label: "Zaman Yönetimi",
                text: "Yarışmanın her aşamasında belirtilen son teslim tarihlerine (deadline) saniyesi saniyesine uyulması esastır; geciken teslimler mazeret kabul edilmeksizin diskalifiye ile sonuçlanır.",
            },
            {
                label: "Kararların Kesinliği",
                text: "Jüri heyetinin vermiş olduğu puanlar ve eleme kararları nihaidir, katılımcılar tarafından itiraz edilemez.",
            },
            {
                label: "Fikri Mülkiyet",
                text: 'Yarışma dokümanlarının, marka görsellerinin ve "Origins: Open Spectrum" konseptinin tüm hakları OriginsRadio\'ya aittir; izinsiz kullanımı yasaktır.',
            },
        ],
    },
];

const AccordionItem = ({
    section,
    isOpen,
    onToggle,
}: {
    section: typeof sections[0];
    isOpen: boolean;
    onToggle: () => void;
}) => {
    const Icon = section.icon;

    return (
        <div className={cn(
            "rounded-2xl border transition-all duration-300 overflow-hidden",
            isOpen
                ? "bg-white/[0.03] border-white/[0.1]"
                : "bg-white/[0.01] border-white/[0.05] hover:border-white/[0.08]"
        )}>
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-5 sm:px-7 py-5 text-left group"
                aria-expanded={isOpen}
            >
                <div className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300",
                    isOpen ? "bg-cyan-500/15 text-cyan-400" : "bg-white/[0.05] text-white/40 group-hover:text-white/60"
                )}>
                    <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[10px] font-bold tracking-[0.3em] uppercase transition-colors duration-300",
                            isOpen ? "text-cyan-400" : "text-white/30"
                        )}>
                            Madde {section.number}
                        </span>
                    </div>
                    <h3 className={cn(
                        "font-semibold text-sm sm:text-base leading-snug transition-colors duration-300 mt-0.5",
                        isOpen ? "text-white" : "text-white/70 group-hover:text-white/85"
                    )}>
                        {section.title}
                    </h3>
                </div>

                <ChevronDown className={cn(
                    "flex-shrink-0 w-5 h-5 text-white/30 transition-all duration-300",
                    isOpen ? "rotate-180 text-cyan-400" : "group-hover:text-white/50"
                )} />
            </button>

            <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? '1000px' : '0px' }}
            >
                <div className="px-5 sm:px-7 pb-6 border-t border-white/[0.05]">
                    {section.content.map((item, i) => (
                        <div key={i} className="pt-4 first:pt-5">
                            {item.label && (
                                <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-2">
                                    {item.label}
                                </p>
                            )}
                            <p className="text-white/65 font-light leading-relaxed text-sm sm:text-[0.9rem]">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TermsSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (idx: number) => {
        setOpenIndex(prev => (prev === idx ? null : idx));
    };

    return (
        <section className="py-16 md:py-24 px-4 bg-black relative overflow-hidden">
            {/* Very subtle gradient separator */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] bg-indigo-950/30" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
                        <Scale className="w-3 h-3 text-white/40" />
                        <span className="text-[11px] tracking-[0.3em] uppercase text-white/40 font-medium">Resmi Belge</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white uppercase mb-4 tracking-tight">
                        Şartname ve Katılım Koşulları
                    </h2>
                    <p className="text-white/40 text-sm font-light tracking-wide max-w-xl mx-auto">
                        Origins: Open Spectrum 2026 Prodüktör Yarışması — Resmi Şartname
                    </p>
                </div>

                {/* Notice bar */}
                <div className="mb-8 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-amber-300/80 font-light leading-relaxed">
                        Başvuru formunu doldurarak aşağıda yer alan tüm şartname maddelerini okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş sayılırsınız.
                    </p>
                </div>

                {/* Accordion */}
                <div className="space-y-3">
                    {sections.map((section, idx) => (
                        <AccordionItem
                            key={idx}
                            section={section}
                            isOpen={openIndex === idx}
                            onToggle={() => toggle(idx)}
                        />
                    ))}
                </div>

                {/* Footer note */}
                <p className="mt-10 text-center text-xs text-white/25 font-light">
                    © 2026 OriginsRadio — "Origins: Open Spectrum" konseptinin tüm hakları saklıdır.
                </p>
            </div>
        </section>
    );
};

export default TermsSection;
