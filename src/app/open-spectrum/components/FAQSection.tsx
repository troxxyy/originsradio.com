'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: "Ön Elemeye Kimler Katılabilir?",
        answer: "Yarışma yalnızca Türkiye'de ikamet eden veya T.C. vatandaşı olan prodüktörlere açıktır."
    },
    {
        question: "Göndereceğim parça için Genre (Tür) kısıtlaması var mı?",
        answer: "Hayır, elektronik müziğin her rengine (House, Techno, Melodic, Experimental vb.) açık olan bu yarışmada tür kısıtlaması yoktur."
    },
    {
        question: "Parçamın özellikleri nasıl olmalı?",
        answer: "Gönderilen eserler %100 özgün olmalı; telif hakkı ihlali yaratan vokal, izinsiz sample veya bootleg içermemelidir. Parçanın mix ve mastering işlemleri tamamlanmış, MP3 320kbps formatında ve dinleme linkiyle (SoundCloud Private / Dropbox / Drive) gönderilmesi gerekir."
    },
    {
        question: "Birden fazla eserle başvuru yapabilir miyim?",
        answer: "Hayır, yarışmaya sadece tek bir eserle katılım sağlayabilirsiniz. Bu nedenle en güvendiğiniz eserinizi eklemeyi unutmayın!"
    },
    {
        question: "Final şampiyonu nasıl belirlenecek?",
        answer: "Şampiyon, 3. turda (Büyük Final) tüm oyların birleştirilmesiyle belirlenir: %50 Ana Jüri (Mentörler), %25 Davetli Konuk Jüri ve %25 Halk Oylaması (Canlı yayın veya web üzerinden izleyici oyu)."
    },
    {
        question: "Ödüller Nelerdir?",
        answer: "1. Şampiyon Kite Club'da kaşeli (ücretli) sahne alma fırsatı, Profesyonel Press Kit (fotoğraf, biyografi, logo) ve Origins Resident DJ statüsü kazanır. İlk 3'e giren finalistler ise OriginsRadio Residentlık Adaylığı ve radyo desteği elde eder."
    }
];

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 md:py-24 px-4 bg-[#050510] relative">
            <div className="max-w-3xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white uppercase mb-4">
                        Sıkça Sorulan Sorular
                    </h2>
                    <p className="text-white/50 tracking-widest uppercase text-sm font-light">
                        Yarışma Hakkında Bilmeniz Gerekenler
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === idx
                                ? 'bg-white/[0.04] border-cyan-500/30'
                                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.03]'
                                }`}
                        >
                            <button
                                onClick={() => toggleFAQ(idx)}
                                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                            >
                                <span className={`font-semibold text-lg transition-colors ${openIndex === idx ? 'text-white' : 'text-white/80'
                                    }`}>
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-cyan-400' : 'text-white/40'
                                        }`}
                                />
                            </button>

                            <div
                                className={`grid transition-all duration-300 ease-in-out ${openIndex === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="px-6 pb-6 text-white/60 font-light leading-relaxed text-sm sm:text-base">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
