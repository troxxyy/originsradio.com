'use client';

import React from 'react';
import Image from 'next/image';

const judges = [
    {
        name: "Kenan Olden",
        role: "Prodüktör & DJ / Kenotrax Kurucusu",
        genre: "House & Tech House",
        bio: "Enerjik setleri ve büyük uluslararası plak şirketlerindeki yayınlarıyla tanınan Ankara merkezli DJ ve prodüktör.",
        videoUrl: "/opencircle2026/kenan.mp4"
    },
    {
        name: "Sinan Arsan",
        role: "Prodüktör & DJ",
        genre: "Progressive & Organic House",
        bio: "Beatport listelerindeki başarıları ve küresel varlığıyla, melodik ve ritim odaklı sesleriyle tanınan Türk DJ/prodüktör.",
        videoUrl: "/opencircle2026/sinan.mp4"
    },
    {
        name: "Ozbek",
        role: "Prodüktör & Extima Kurucusu",
        genre: "Peak-Time & Dark Techno",
        bio: "Maceo Plex gibi isimlerden destek gören, karanlık, sürükleyici sesi ve underground perspektifiyle tanınır.",
        videoUrl: "/opencircle2026/ozbek.mp4"
    }
];

const JudgesSection = () => {
    return (
        <section className="py-16 md:py-24 px-4 bg-black relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050510] to-black opacity-50 pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white uppercase mb-4">
                        Jüri Heyeti
                    </h2>
                    <p className="text-white/50 tracking-widest uppercase text-sm font-light">
                        Senin Sesini Keşfedecek İsimler
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {judges.map((judge, idx) => (
                        <div
                            key={idx}
                            className="group relative rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.05] p-6 hover:bg-white/[0.04] transition-colors duration-500"
                        >
                            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white/5 mb-6 relative hover:scale-105 transition-transform duration-500">
                                {judge.videoUrl ? (
                                    <video
                                        src={judge.videoUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:brightness-100 transition-all duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                                        <span className="text-white/20 font-bold text-4xl">?</span>
                                    </div>
                                )}
                            </div>

                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-1">{judge.name}</h3>
                                <p className="text-cyan-400/80 text-sm tracking-widest uppercase mb-4">{judge.genre}</p>
                                <p className="text-white/50 text-sm font-light leading-relaxed">
                                    {judge.bio}
                                </p>
                            </div>

                            {/* Subtle hover glow */}
                            <div className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default JudgesSection;
