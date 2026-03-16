'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWebHaptics } from 'web-haptics/react';
import { cn } from "@/lib/utils";

const HeroSection = () => {
    const [mounted, setMounted] = useState(false);
    const { trigger } = useWebHaptics();
    const videoRef = useRef<HTMLVideoElement>(null);
    const animationRef = useRef<number>();
    const lastTimeRef = useRef<number>();
    const isPlayingForwardRef = useRef(true);

    useEffect(() => {
        setMounted(true);
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.7;
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    const handlePlay = () => {
        if (videoRef.current && isPlayingForwardRef.current) {
            videoRef.current.playbackRate = 0.7;
        }
    };

    const reversePlay = (timestamp: number) => {
        if (!videoRef.current) return;
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;

        const delta = (timestamp - lastTimeRef.current) / 1000;
        lastTimeRef.current = timestamp;

        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - delta * 0.7);

        if (videoRef.current.currentTime <= 0) {
            isPlayingForwardRef.current = true;
            lastTimeRef.current = undefined;
            videoRef.current.play();
            videoRef.current.playbackRate = 0.7;
        } else {
            animationRef.current = requestAnimationFrame(reversePlay);
        }
    };

    const handleEnded = () => {
        isPlayingForwardRef.current = false;
        lastTimeRef.current = undefined;
        animationRef.current = requestAnimationFrame(reversePlay);
    };

    const scrollToForm = () => {
        const formEl = document.getElementById("application_form");
        if (formEl) {
            formEl.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="relative w-full h-[100dvh] overflow-hidden bg-black flex flex-col items-center justify-center">

            {/* Video Background */}
            <div className={cn(
                "absolute inset-0 z-[1] w-full h-full overflow-hidden bg-black",
                "transition-opacity duration-1000",
                mounted ? "opacity-100" : "opacity-0"
            )}>
                <video
                    ref={videoRef}
                    src="/opencircle2026/grok-video-dcfde230-e5be-46d7-b3c6-07abcc2d67da.mp4"
                    autoPlay
                    muted
                    playsInline
                    onPlay={handlePlay}
                    onEnded={handleEnded}
                    className="w-full h-full object-cover opacity-60 filter brightness-[0.35] contrast-125 grayscale-[0.2]"
                />
            </div>

            {/* Dark overlay to ensure text readability */}
            <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-black/40 to-black/80" />

            <div className="relative z-[50] flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-16">

                <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8",
                    "bg-white/[0.05] border border-white/10 backdrop-blur-md",
                    "transition-all duration-1000 delay-300",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs sm:text-sm tracking-[0.2em] font-light uppercase text-white/80">
                        Resmi Proje & yarışma
                    </span>
                </div>

                <h1 className={cn(
                    "font-bold text-4xl sm:text-6xl md:text-8xl text-white/90 uppercase leading-none drop-shadow-2xl",
                    "transition-all duration-1000 delay-100",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}>
                    OPEN SPECTRUM 2026
                </h1>

                <p className={cn(
                    "mt-6 text-xl sm:text-2xl font-light tracking-[0.1em] text-white/60",
                    "transition-all duration-1000 delay-200",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}>
                    &quot;Sınırları Kaldır, Sesi Yarat&quot;
                </p>

                <div className={cn(
                    "mt-8 px-5 py-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl",
                    "transition-all duration-1000 delay-300",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-medium text-white/40">Durum</span>
                        <div className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                                BAŞVURULAR KAPANDI
                            </span>
                        </div>
                    </div>
                </div>

                <p className={cn(
                    "mt-8 max-w-2xl text-sm sm:text-base text-white/50 font-light leading-relaxed",
                    "transition-all duration-1000 delay-400",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}>
                    OriginsRadio, Türkiye elektronik müzik sahnesinin yeni nesil yeteneklerini arıyor.
                    Tür kısıtlaması yok. 3 jüri, 3 tur, 1 şampiyon.
                </p>

                <button
                    disabled
                    className={cn(
                        "mt-12 px-8 py-4 sm:px-12 sm:py-5 rounded-full",
                        "bg-white/10 text-white/50 font-semibold text-sm sm:text-base tracking-[0.2em] uppercase cursor-not-allowed",
                        "transition-all duration-300",
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}
                    style={{ transitionDelay: '500ms' }}
                >
                    Başvurular Kapandı
                </button>
            </div>

            {/* Scroll indicator */}
            <div className={cn(
                "absolute bottom-12 left-1/2 -translate-x-1/2 z-[50]",
                "flex flex-col items-center gap-2",
                "transition-all duration-1000 delay-700",
                mounted ? "opacity-50" : "opacity-0"
            )}>
                <span className="text-[10px] uppercase tracking-widest text-white/50">Explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
            </div>
        </section>
    );
};

export default HeroSection;
