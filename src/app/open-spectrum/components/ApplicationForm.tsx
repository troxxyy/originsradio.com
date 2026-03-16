'use client';

import React, { useState } from 'react';
import { useWebHaptics } from 'web-haptics/react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ApplicationForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger } = useWebHaptics();
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
            trigger('error');
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
            trigger('success');
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
            trigger('error');
            toast.error(err instanceof Error ? err.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === 'success') {
        return (
            <section className="py-16 md:py-24 px-4 bg-black" id="application_form">
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
        <section className="py-16 md:py-24 px-4 bg-black relative" id="application_form">
            <div className="max-w-3xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white uppercase mb-4">
                        Başvurular Kapandı
                    </h2>
                    <p className="text-white/50 tracking-widest uppercase text-sm font-light">
                        Sınırları Kaldır, Sesi Yarat
                    </p>
                </div>

                <div className="text-center bg-white/[0.02] border border-white/[0.05] p-8 sm:p-12 rounded-3xl shadow-2xl">
                    <h3 className="text-xl sm:text-2xl font-bold text-white uppercase mb-4 flex items-center justify-center gap-3">
                        İlginiz İçin Teşekkürler
                    </h3>
                    <p className="text-white/60 font-light max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                        Open Spectrum 2026 yarışmasına gösterdiğiniz yoğun ilgi için teşekkür ederiz. Başvuru süreci tamamlanmıştır. Jürimiz değerlendirmelerini yaptıktan sonra sonuçları sosyal medya hesaplarımızdan duyuracağız.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ApplicationForm;
