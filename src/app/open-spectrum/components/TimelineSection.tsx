'use client';

import React from 'react';

const phases = [
    {
        title: "1. Tur",
        subtitle: "Başvuru, Ön Eleme ve Halk Oylaması",
        description: "Orijinal eserini göndererek başvurunu tamamla. Jüri tarafından seçilen en iyi 24 parça platformumuzda halk oylamasına sunulur. En çok oyu alan 12 katılımcı 2. tura yükselir.",
        active: true
    },
    {
        title: "2. Tur",
        subtitle: "Draft Günü ve Mentör Remix",
        description: "3 jüri üyesi dörder kişilik takımlarını oluşturur. Görevin, eşleştiğin mentörünün bir eserini kendi özgün tarzınla yeniden düzenlemektir. Değerlendirme sonucunda her mentör 1 finalisti seçer.",
        active: false
    },
    {
        title: "3. Tur",
        subtitle: "Büyük Final (Masterclass)",
        description: "3 finalist, Konuk Jüri'nin hazırladığı özel 'Sample Pack' ile yepyeni bir parça üretir. Şampiyon; Ana Jüri (%50), Konuk Jüri (%25) ve Halk Oylaması (%25) oyları ile belirlenir.",
        active: false
    }
];


const TimelineSection = () => {
    return (
        <section className="py-16 md:py-24 px-4 bg-[#050510] relative overflow-hidden">

            {/* Decorative gradient background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-indigo-900/10 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white uppercase mb-4">
                        Yarışma Süreci
                    </h2>
                    <p className="text-white/50 tracking-widest uppercase text-sm font-light">
                        3 Aşama, 3 Jüri, 1 Şampiyon
                    </p>
                </div>

                <div className="relative border-l border-white/10 ml-4 md:ml-1/2">
                    {phases.map((phase, idx) => (
                        <div
                            key={idx}
                            className="mb-12 relative pl-8 md:pl-0"
                        >

                            {/* Timeline dot */}
                            {phase.active ? (
                                <div
                                    className="absolute w-4 h-4 rounded-full border-2 top-0 left-[-8px] md:left-1/2 md:-ml-[8px] mt-1.5 bg-cyan-500 border-cyan-400 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                                />
                            ) : (
                                <div className="absolute w-4 h-4 rounded-full border-2 top-0 left-[-8px] md:left-1/2 md:-ml-[8px] mt-1.5 transition-colors duration-500 bg-[#050510] border-white/20" />
                            )}


                            <div className={`
                ${idx % 2 === 0 ? 'md:pr-12 md:text-right md:w-1/2' : 'md:pl-12 md:w-1/2 md:ml-auto'}
                bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl md:bg-transparent md:border-none md:p-0
              `}>
                                <span className="text-xs font-bold tracking-widest uppercase text-cyan-400 mb-2 block">
                                    {phase.title}
                                </span>
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    {phase.subtitle}
                                </h3>
                                <p className="text-white/60 font-light leading-relaxed text-sm">
                                    {phase.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;
