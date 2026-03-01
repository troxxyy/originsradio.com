import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { Resend } from 'resend';

// Initialize Resend
// IMPORTANT: Be sure RESEND_API_KEY is in your environment variables.
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
    // Get Supabase Admin client dynamically
    const supabaseAdmin = getSupabaseAdminClient();
    try {
        const data = await request.json();
        const { fullName, artistName, email, phone, instagram, genre, trackUrl, agreedToTerms } = data;

        // 1. Basic Validation
        if (!agreedToTerms) {
            return NextResponse.json(
                { error: 'Lütfen KVKK ve Kuralları onaylayın.' },
                { status: 400 }
            );
        }

        if (!fullName || !artistName || !email || !phone || !instagram || !genre || !trackUrl) {
            return NextResponse.json(
                { error: 'Tüm alanları doldurmak zorunludur.' },
                { status: 400 }
            );
        }

        // 2. Duplicate Validation
        // Check if artist_name or email already exists
        const { data: existingApp, error: searchError } = await supabaseAdmin
            .from('open_spectrum_applications')
            .select('id, email, artist_name')
            .or(`email.eq.${email},artist_name.eq.${artistName}`)
            .limit(1)
            .maybeSingle();

        if (searchError) {
            console.error('Supabase search error:', searchError);
            return NextResponse.json(
                { error: 'Veritabanı kontrolünde hata oluştu.' },
                { status: 500 }
            );
        }

        if (existingApp) {
            // Already applied
            return NextResponse.json(
                { error: 'Bu e-posta veya sahne adı ile daha önce başvuru yapılmış.' },
                { status: 400 } // Bad Request
            );
        }

        // 3. Insert Application
        const { error: insertError } = await supabaseAdmin
            .from('open_spectrum_applications')
            .insert([
                {
                    full_name: fullName,
                    artist_name: artistName,
                    email,
                    phone,
                    instagram,
                    genre,
                    track_url: trackUrl,
                    agreed_to_terms: agreedToTerms
                }
            ]);

        if (insertError) {
            console.error('Supabase insert error:', insertError);
            return NextResponse.json(
                { error: 'Başvuru eklenirken bir hata oluştu.' },
                { status: 500 }
            );
        }

        // 4. Send Confirmation Email via Resend
        if (resend) {
            try {
                await resend.emails.send({
                    from: 'OriginsRadio <hello@originsradio.com>', // Or your verified sending domain
                    to: [email],
                    subject: 'Başvurun Alındı - Open Spectrum 2026',
                    html: `
                        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
                            <h2 style="color: #000;">Başvurun Alındı, ${artistName}!</h2>
                            <p>Merhaba ${fullName},</p>
                            <p>Open Spectrum 2026 için başvurunu başarıyla aldık. Parçan OriginsRadio jüri havuzuna başarıyla eklendi.</p>
                            <p>Jürimiz 2 haftalık başvuru süreci sonunda 24 finalisti seçecek. Ardından parçalar web sitemizde yayınlanacak ve halk oylamasına açılacaktır.</p>
                            <p>Sosyal medyada bizi takip etmeyi unutma, sonuçları orada duyuracağız!</p>
                            <br/>
                            <p>Sevgiler,</p>
                            <p><strong>OriginsRadio Ekibi</strong></p>
                        </div>
                    `,
                });
            } catch (emailError) {
                // Depending on preference, you can either fail the whole request or just log it.
                // Failing the whole request would be safe if we wrap Supabase insert in a transaction,
                // but since application is already saved, maybe just log for now so user isn't stuck.
                console.error('Failed to send Resend email:', emailError);
            }
        } else {
            console.warn('RESEND_API_KEY is missing. Confirmation email was not sent.');
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err: any) {
        console.error('Unhandled API Error:', err);
        return NextResponse.json(
            { error: 'Beklenmeyen bir hata oluştu.' },
            { status: 500 }
        );
    }
}
