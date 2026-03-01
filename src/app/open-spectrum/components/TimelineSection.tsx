'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { Send, Shuffle, Crown, Users, Music, Mic2, Vote, Sparkles, Trophy } from 'lucide-react';

const phases = [
    {
        round: "01",
        title: "1. Tur",
        subtitle: "Başvuru, Ön Eleme ve Halk Oylaması",
        description: "Orijinal eserini göndererek başvurunu tamamla. Jüri tarafından seçilen en iyi 24 parça platformumuzda halk oylamasına sunulur. En çok oyu alan 12 katılımcı 2. tura yükselir.",
        icon: Send,
        highlights: [
            { icon: Music, text: "Orijinal eser gönder" },
            { icon: Users, text: "24 → 12 katılımcı" },
            { icon: Vote, text: "Halk oylaması" },
        ],
        gradient: "from-cyan-500 to-blue-600",
        glowColor: "rgba(6, 182, 212, 0.15)",
        active: true
    },
    {
        round: "02",
        title: "2. Tur",
        subtitle: "Draft Günü ve Mentör Remix",
        description: "3 jüri üyesi dörder kişilik takımlarını oluşturur. Görevin, eşleştiğin mentörünün bir eserini kendi özgün tarzınla yeniden düzenlemektir. Değerlendirme sonucunda her mentör 1 finalisti seçer.",
        icon: Shuffle,
        highlights: [
            { icon: Users, text: "3 takım × 4 kişi" },
            { icon: Mic2, text: "Mentör remix görevi" },
            { icon: Sparkles, text: "12 → 3 finalist" },
        ],
        gradient: "from-violet-500 to-purple-600",
        glowColor: "rgba(139, 92, 246, 0.15)",
        active: false
    },
    {
        round: "03",
        title: "3. Tur",
        subtitle: "Büyük Final (Masterclass)",
        description: "3 finalist, Konuk Jüri'nin hazırladığı özel 'Sample Pack' ile yepyeni bir parça üretir. Şampiyon; Ana Jüri (%50), Konuk Jüri (%25) ve Halk Oylaması (%25) oyları ile belirlenir.",
        icon: Crown,
        highlights: [
            { icon: Music, text: "Sample Pack challenge" },
            { icon: Trophy, text: "Jüri + Halk oyları" },
            { icon: Crown, text: "1 Şampiyon" },
        ],
        gradient: "from-amber-400 to-orange-500",
        glowColor: "rgba(245, 158, 11, 0.15)",
        active: false
    }
];


const TimelineSection = () => {
    const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(phases.length).fill(false));
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement);
                    if (idx !== -1 && entry.isIntersecting) {
                        setVisibleCards(prev => {
                            const next = [...prev];
                            next[idx] = true;
                            return next;
                        });
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );

        cardRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section className="py-20 md:py-32 px-4 bg-black relative overflow-hidden">

            {/* Ambient background effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-[100%] blur-[150px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-[100%] blur-[150px] bg-gradient-to-t from-cyan-900/8 to-transparent pointer-events-none" />

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Section header */}
                <div className="text-center mb-20 md:mb-28">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[11px] tracking-[0.3em] uppercase text-white/50 font-medium">Nasıl İşliyor?</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white uppercase mb-5 tracking-tight">
                        Yarışma Süreci
                    </h2>
                    <div className="flex items-center justify-center gap-4 text-white/40">
                        <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
                        <p className="tracking-[0.25em] uppercase text-xs sm:text-sm font-light">
                            3 Aşama • 3 Jüri • 1 Şampiyon
                        </p>
                        <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative">

                    {/* Vertical timeline line – visible on md+ */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
                        <div className="w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    </div>

                    {/* Mobile vertical line */}
                    <div className="md:hidden absolute left-6 top-0 bottom-0 w-px">
                        <div className="w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    </div>

                    {phases.map((phase, idx) => {
                        const Icon = phase.icon;
                        const isLeft = idx % 2 === 0;

                        return (
                            <div
                                key={idx}
                                ref={el => { cardRefs.current[idx] = el; }}
                                className={cn(
                                    "relative mb-16 md:mb-24 last:mb-0",
                                    "transition-all duration-700 ease-out",
                                    visibleCards[idx]
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-12"
                                )}
                                style={{ transitionDelay: `${idx * 100}ms` }}
                            >
                                {/* Desktop timeline dot */}
                                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-8 z-20">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center",
                                        "border-2 transition-all duration-500",
                                        phase.active
                                            ? "border-cyan-400 bg-cyan-500/20 shadow-[0_0_25px_rgba(34,211,238,0.4)]"
                                            : "border-white/15 bg-[#0a0a1a]"
                                    )}>
                                        <Icon className={cn(
                                            "w-5 h-5",
                                            phase.active ? "text-cyan-400" : "text-white/40"
                                        )} />
                                    </div>
                                </div>

                                {/* Mobile timeline dot */}
                                <div className="md:hidden absolute left-6 -translate-x-1/2 top-6 z-20">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        "border-2 transition-all duration-500",
                                        phase.active
                                            ? "border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                                            : "border-white/15 bg-[#0a0a1a]"
                                    )}>
                                        <Icon className={cn(
                                            "w-4 h-4",
                                            phase.active ? "text-cyan-400" : "text-white/40"
                                        )} />
                                    </div>
                                </div>

                                {/* Card – desktop layout */}
                                <div className={cn(
                                    "ml-14 md:ml-0",
                                    "md:w-[calc(50%-40px)]",
                                    isLeft ? "md:mr-auto md:pr-0" : "md:ml-auto md:pl-0"
                                )}>
                                    <div
                                        className={cn(
                                            "group relative rounded-2xl sm:rounded-3xl overflow-hidden",
                                            "bg-white/[0.02] border border-white/[0.06]",
                                            "p-5 sm:p-7 md:p-8",
                                            "hover:bg-white/[0.04] hover:border-white/[0.1]",
                                            "transition-all duration-500"
                                        )}
                                    >
                                        {/* Card inner glow on hover */}
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
                                            style={{
                                                background: `radial-gradient(ellipse at 50% 0%, ${phase.glowColor}, transparent 70%)`
                                            }}
                                        />

                                        {/* Large faded round number background */}
                                        <span className={cn(
                                            "absolute -right-4 -top-6 text-[120px] sm:text-[160px] font-black leading-none pointer-events-none select-none",
                                            "bg-gradient-to-b bg-clip-text text-transparent opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-500",
                                            phase.gradient
                                        )}>
                                            {phase.round}
                                        </span>

                                        {/* Active badge */}
                                        {phase.active && (
                                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                <span className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">Aktif</span>
                                            </div>
                                        )}

                                        <div className="relative z-10">
                                            {/* Round label */}
                                            <span className={cn(
                                                "inline-block text-xs font-bold tracking-[0.3em] uppercase mb-3 bg-gradient-to-r bg-clip-text text-transparent",
                                                phase.gradient
                                            )}>
                                                {phase.title}
                                            </span>

                                            {/* Subtitle */}
                                            <h3 className="text-xl sm:text-2xl md:text-[1.65rem] font-bold text-white mb-4 leading-snug">
                                                {phase.subtitle}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-white/50 font-light leading-relaxed text-sm sm:text-[0.9rem] mb-6">
                                                {phase.description}
                                            </p>

                                            {/* Highlight chips */}
                                            <div className="flex flex-wrap gap-2">
                                                {phase.highlights.map((hl, i) => {
                                                    const HlIcon = hl.icon;
                                                    return (
                                                        <span
                                                            key={i}
                                                            className={cn(
                                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs",
                                                                "bg-white/[0.04] border border-white/[0.06] text-white/60",
                                                                "group-hover:border-white/[0.1] group-hover:text-white/70",
                                                                "transition-all duration-300"
                                                            )}
                                                        >
                                                            <HlIcon className="w-3 h-3 flex-shrink-0" />
                                                            {hl.text}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Bottom accent line */}
                                        <div className={cn(
                                            "absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                            "bg-gradient-to-r",
                                            phase.gradient
                                        )} />
                                    </div>

                                    {/* Connector line from card to timeline dot – desktop only */}
                                    <div className={cn(
                                        "hidden md:block absolute top-[2.1rem] h-px w-[40px]",
                                        isLeft ? "right-[calc(50%-40px)]" : "left-[calc(50%-40px)]",
                                        "bg-gradient-to-r",
                                        isLeft ? "from-white/10 to-white/5" : "from-white/5 to-white/10"
                                    )} />
                                </div>
                            </div>
                        );
                    })}

                    {/* End marker */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 -bottom-4 z-20">
                        <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" />
                    </div>
                    <div className="md:hidden absolute left-6 -translate-x-1/2 -bottom-4 z-20">
                        <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" />
                    </div>
                </div>

                {/* Bottom flow summary */}
                <div className="mt-20 md:mt-28 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
                    {[
                        { label: "Başvuru", count: "∞", color: "text-cyan-400" },
                        { label: "Ön Eleme", count: "24", color: "text-cyan-400" },
                        { label: "Halk Oyu", count: "12", color: "text-violet-400" },
                        { label: "Final", count: "3", color: "text-amber-400" },
                        { label: "Şampiyon", count: "1", color: "text-white" },
                    ].map((step, i, arr) => (
                        <React.Fragment key={i}>
                            <div className="flex flex-col items-center gap-1 min-w-[70px]">
                                <span className={cn("text-lg sm:text-xl font-bold", step.color)}>{step.count}</span>
                                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/30 font-light">{step.label}</span>
                            </div>
                            {i < arr.length - 1 && (
                                <>
                                    <span className="hidden sm:block text-white/15 mx-2 text-lg">→</span>
                                    <span className="sm:hidden text-white/15 text-lg">↓</span>
                                </>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;
