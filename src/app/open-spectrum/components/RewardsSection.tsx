'use client';

import React from 'react';
import { Trophy, Mic2, Radio } from 'lucide-react';

const rewards = [
    {
        icon: Trophy,
        title: "1. Şampiyon",
        perks: [
            "Kite Club'da kaşeli (ücretli) sahne alma fırsatı",
            "Profesyonel Press Kit (fotoğraf, biyografi, logo)",
            "Origins Resident DJ resmi statüsü ve radyo slotu"
        ],
        highlight: true
    },
    {
        icon: Radio,
        title: "Finalistler",
        perks: [
            "Son 3'e kalan yarışmacılara OriginsRadio Residentlık Adaylığı",
            "Radyo desteği ve yayın imkanı"
        ],
        highlight: false
    }
];

const RewardsSection = () => {
    return (
        <section className="py-16 md:py-24 px-4 bg-black relative overflow-hidden">
            {/* Ambient lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-[100%] blur-[150px] bg-gradient-to-r from-cyan-900/20 to-teal-900/20 pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white uppercase mb-4">
                        Ödüller
                    </h2>
                    <p className="text-white/50 tracking-widest uppercase text-sm font-light">
                        Sahne Senin
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {rewards.map((reward, idx) => {
                        const Icon = reward.icon;

                        return (
                            <div
                                key={idx}
                                className={`rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${reward.highlight
                                    ? 'bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.1)]'
                                    : 'bg-white/[0.02] border border-white/[0.05]'
                                    }`}
                            >
                                {/* Decorative background icon */}
                                <Icon className="absolute -right-8 -bottom-8 w-48 h-48 text-white/[0.02] -rotate-12 pointer-events-none" />

                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`p-4 rounded-2xl ${reward.highlight ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/60'}`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white">{reward.title}</h3>
                                </div>

                                <ul className="space-y-4">
                                    {reward.perks.map((perk, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                            <span className="text-white/70 font-light text-sm sm:text-base">{perk}</span>
                                        </li>
                                    ))}
                                </ul>

                                {reward.highlight && (
                                    <div className="absolute top-0 right-0 px-4 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase rounded-bl-xl border-b border-l border-cyan-500/30">
                                        Büyük Ödül
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default RewardsSection;
