'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ApplicationForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        artistName: '',
        email: '',
        phone: '',
        instagram: '',
        genre: '',
        trackUrl: '',
        agreedToTerms: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        if (!formData.agreedToTerms) {
            toast.error('Lütfen KVKK ve Kuralları onaylayın.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/api/open-spectrum/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Gönderim başarısız oldu.');
            }

            setSubmitStatus('success');
            toast.success('Başvurunuz başarıyla alındı!');

            // Reset form
            setFormData({
                fullName: '',
                artistName: '',
                email: '',
                phone: '',
                instagram: '',
                genre: '',
                trackUrl: '',
                agreedToTerms: false
            });

        } catch (err) {
            console.error('Submission error:', err);
            setSubmitStatus('error');
            toast.error(err instanceof Error ? err.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === 'success') {
        return (
            <section className="py-16 md:py-24 px-4 bg-[#050510]" id="application_form">
                <div className="max-w-2xl mx-auto text-center bg-white/[0.02] border border-white/[0.05] p-12 rounded-3xl">
                    <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white uppercase mb-4">
                        Başvurun Alındı
                    </h2>
                    <p className="text-white/60 font-light mb-8">
                        Parçan OriginsRadio jüri havuzuna başarıyla eklendi. Jürimiz 2 haftalık başvuru süreci sonunda 24 finalisti seçecek. Ardından parçalar web sitemizde yayınlanacak ve halk oylamasına açılacaktır. Sosyal medyada bizi takip et, sonuçları orada duyuracağız.
                    </p>

                </div>
            </section>
        );
    }

    return (
        <section className="py-16 md:py-24 px-4 bg-[#050510] relative" id="application_form">
            <div className="max-w-3xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white uppercase mb-4">
                        Başvuru Formu
                    </h2>
                    <p className="text-white/50 tracking-widest uppercase text-sm font-light">
                        Sınırları Kaldır, Sesi Yarat
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white/[0.02] border border-white/[0.05] p-5 sm:p-10 rounded-3xl shadow-2xl">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="text-sm tracking-widest uppercase text-white/50">Ad Soyad *</label>
                            <input
                                id="fullName"
                                name="fullName"
                                required
                                type="text"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Örn: Ahmet Yılmaz"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="artistName" className="text-sm tracking-widest uppercase text-white/50">Sahne Adı *</label>
                            <input
                                id="artistName"
                                name="artistName"
                                required
                                type="text"
                                value={formData.artistName}
                                onChange={handleChange}
                                placeholder="Artist / DJ Name"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm tracking-widest uppercase text-white/50">E-Posta *</label>
                            <input
                                id="email"
                                name="email"
                                required
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="E-mail adresi"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm tracking-widest uppercase text-white/50">Telefon *</label>
                            <input
                                id="phone"
                                name="phone"
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="05XX XXX XX XX"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="instagram" className="text-sm tracking-widest uppercase text-white/50">Instagram *</label>
                            <input
                                id="instagram"
                                name="instagram"
                                required
                                type="text"
                                value={formData.instagram}
                                onChange={handleChange}
                                placeholder="@kullanici_adi"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="genre" className="text-sm tracking-widest uppercase text-white/50">Parçanın Türü (Genre) *</label>
                            <input
                                id="genre"
                                name="genre"
                                required
                                type="text"
                                value={formData.genre}
                                onChange={handleChange}
                                placeholder="Örn: Melodic Techno"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <label htmlFor="trackUrl" className="text-sm tracking-widest uppercase text-white/50">Parça Dinleme Linki *</label>
                        <input
                            id="trackUrl"
                            name="trackUrl"
                            required
                            type="url"
                            value={formData.trackUrl}
                            onChange={handleChange}
                            placeholder="SoundCloud Private / Dropbox / Drive Linki"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-white/20"
                        />
                        <p className="text-xs text-white/30 font-light italic mt-1">Orijinal, mix/mastering bitmiş, MP3 320kbps formatında.</p>
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-8">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-1">
                                <input
                                    type="checkbox"
                                    name="agreedToTerms"
                                    required
                                    checked={formData.agreedToTerms}
                                    onChange={handleChange}
                                    className="peer appearance-none w-5 h-5 border-2 border-white/30 rounded bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-1 focus:ring-offset-black"
                                />
                                <CheckCircle2 className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                            </div>
                            <span className="text-sm text-white/60 font-light group-hover:text-white/80 transition-colors">
                                Yarışma kurallarını okudum ve kabul ediyorum. Gönderdiğim eserin %100 özgün olduğunu, telif hakkı ihlali yaratan vokal/sample içermediğini taahhüt ederim.
                                <span className="block mt-1 text-xs text-white/40">* Yarışma yalnızca Türkiye'de ikamet eden veya T.C. vatandaşı olan prodüktörlere açıktır.</span>
                            </span>
                        </label>
                    </div>

                    {submitStatus === 'error' && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>Gönderim sırasında bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.</p>
                        </div>
                    )}

                    <div className="pt-8 flex justify-center">
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.agreedToTerms}
                            className={cn(
                                "px-12 py-4 rounded-full font-semibold tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2",
                                isSubmitting
                                    ? "bg-white/20 text-white/50 cursor-not-allowed"
                                    : !formData.agreedToTerms
                                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                                        : "bg-cyan-500 text-black shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] hover:bg-cyan-400 hover:scale-[1.02]"
                            )}
                        >
                            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                            {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Tamamla'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default ApplicationForm;
