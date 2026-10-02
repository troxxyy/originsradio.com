# Origins Radio — ilk bakım ve araştırma

Tarih: 2 Ekim 2026 (Australia/Perth). Kapsam: canlı siteyi salt okunur inceleme, yerel kod bakımı, bağımlılık taraması ve Supabase yetki incelemesi.

## Sonuç

İlk bakım değişiklikleri yerel çalışma alanında hazırlandı. Mevcut merch, banner ve diğer kullanıcı değişiklikleri bu çalışma başlamadan önce bulunuyordu; bakım bunların üzerine uygulandı. Commit, push, yayınlama ve canlı veritabanı değişikliği yapılmadı. VPS YouTube servisine müdahale edilmedi.

## Yapılan düzeltmeler

- Next.js 16.2.10 → 16.3.8. `npm audit fix --ignore-scripts` mevcut sürüm aralıklarındaki güvenlik güncellemelerini uyguladı: 24 paket değişti, 3 eklendi, 1 kaldırıldı. İlk npm taraması 1 kritik, 6 yüksek, 2 orta, 1 düşük kayıt gösteriyordu; güncelleme sonrası toplam sıfır. Bu sonuç yalnızca npm bağımlılıklarını kapsar.
- Tüm sayfa içeriğini bekleten global yükleme perdesi kaldırıldı. Ana sayfanın başlığı ve bağlantıları artık sunucu HTML çıktısında mevcut. Bazı veri sayfaları içeriklerini hâlâ istemcide yüklüyor; aşağıdaki sonraki işler bölümüne bakın.
- Ana sayfada `touch-action: none`, global klavye/touch/wheel engelleri ve sabit body konumlandırması kaldırıldı. Viewport ölçeği 1 oldu. Menü mobilde sarılıyor; kısa ekranlarda sayfa kaydırılabiliyor. Klavye odak göstergesi eklendi.
- Arka plan videosu az hareket tercihine ve sekmenin görünürlüğüne uyuyor; ön yükleme `metadata` düzeyinde. Üçüncü taraf eski GPT Engineer scripti kaldırıldı.
- Mobil üst menü bağlantılarına erişilebilir adlar eklendi; sanatçı listesindeki çift navigasyon kaldırıldı.
- Sanatçı listesindeki `useSearchParams` için Suspense sınırı eklendi. Sanatçı profillerini üretim derlemesinde bozan `localStorage` erişimi hydration sonrasına taşındı. Mevcut anonim kimlikler korunuyor; depolama engelliyse sekme boyunca sabit kimlik kullanılıyor.
- Ana site ve Snow Sessions `/` çakışması giderildi. Snow ana sayfası `/snow` altında; `snow.originsradio.com` kökü buraya rewrite ediliyor. Eski middleware, Next.js 16 proxy düzenine geçirildi. Host başlığı ve query string davranışı test ediliyor.
- Kanonik alan adı `NEXT_PUBLIC_SITE_URL` üzerinden ortaklaştırıldı; varsayılan `https://originsradio.com`. Sanatçı metadata/structured data, robots ve sitemap uyumlu. Sitemap saatlik yeniden doğrulanıyor. `/_next/` crawler engeli kaldırıldı.
- `nosniff` ve referrer başlıkları eklendi. Hata sayfası yeniden deneme sunuyor; 404 sayfası mobilde okunabilir.
- Tarihlerde tireyle ISO tarihini kesen ve eksik yılı mevcut yılla dolduran sıralama kaldırıldı. Yılı belli geçmiş etkinlikler, upcoming bayrağı eskimişse gelecek listesinde gösterilmiyor. Gün sınırı İstanbul saatine göre. Yaklaşan etkinlikler en yakın tarihten başlıyor. Yılı belirsiz verilerde editoryal bayrak korunuyor.
- Yerel eski Backyard örneği arşive alındı; eski 2025 yazı çağrısı temizlendi. Yeni etkinlik/program bilgisi uydurulmadı.
- Davetiye action'ı kayıt veya gönderim yapmadan başarı bildiriyordu. Şimdi dürüstçe kullanılamadığını ve iletişim adresini gösteriyor; kişisel form alanlarını loglamıyor.
- Kurulum belgeleri Next.js/NEXT_PUBLIC değişkenlerine göre yeniden yazıldı; `.env.example`, Node 22 LTS seçimi, typecheck ve test komutları eklendi. Olmayan migration scriptine ve rakip statik sitemap üreticisine npm komutları kaldırıldı.
- ESLint Fast Refresh kuralına Next.js'in resmi metadata export adları tanıtıldı; hook uyarıları kapatılmadı.

## Doğrulama

- Üretim derlemesi: `npm run build` başarılı; 140/140 statik sayfa oluşturuldu.
- TypeScript: `npm run typecheck` başarılı.
- Regresyon testleri: 11 test; tarih/yıl/İstanbul gün sınırı, sunucuda kimlik üretimi, depolama engeli, mevcut kimliğin korunması, Snow host ve rota ayrımı.
- ESLint: 0 hata, 25 mevcut uyarı. Kalanlar çoğunlukla hook bağımlılıkları ve bileşen dışı export uyarıları; ayrı küçük değişikliklerle ele alınmalı.
- HTTP kontrolü: `/`, `/events`, `/artists`, `/artists/miinnaa`, `/blog`, `/about`, `/radio/schedule`, `/thisweek`, `/merch`, `/snow`, `/robots.txt`, `/sitemap.xml`; bilinmeyen çok parçalı adres 404.
- Geliştirme tarayıcısında ana sayfa, sanatçı listesi/profili ve radyo programı içerikleri görüldü. 390 px mobilde ana sayfa document genişliği 390 px; altı ana bağlantı ekran içinde.
- Canlı site ana sayfası ve etkinlik arşivi okundu. Etkinlik verileri çoğunlukla tarihsel; bu bakım yeni organizasyon bilgisi yayınlamadı.

### Son tarayıcı ve HTTP sonuçları

- Üretim ana sayfasında yeni test oturumunda JavaScript hata listesi boş.
- Gerçek `Host: snow.originsradio.com` başlığıyla HTTP 200 ve `/snow?lang=tr` rewrite doğrulandı; Snow içeriği döndü. Testte Node fetch Host başlığını iletmediği için bu kontrol curl ile yapıldı.
- 1440×900 masaüstünde altı ana bağlantı aynı satırda; 390×844 mobilde yatay taşma yok.
- Son set 131 saniyelik medya olarak yüklendi. Kesintisiz 6 saniyelik kontrolde zaman 4.79 → 10.79 saniye ilerledi, paused=false ve medya hatası yoktu. Bu bir kısa oynatma kontrolüdür; 24/7 yayın dayanıklılığı testi değildir.
- Yerel önizleme: http://127.0.0.1:3100. Geçici üretim test sunucuları kapatıldı.

## Öncelikli kalan bulgular: canlı yetkiler

Supabase projesi `Originsradio`, 2 Ekim'de `ACTIVE_HEALTHY` olarak yanıt verdi. Advisor sonuçları ve `pg_policies` salt okunur sorgusu aşağıdakileri doğruladı. Kullanıcı/bilet/başvuru kayıtlarının içerikleri okunmadı.

1. **Yüksek öncelik — bilet dosyaları:** `storage.objects` üzerindeki `Allow anon delete tickets bucket` ve `Allow anon update tickets bucket` politikaları `public` rolüne, yalnızca bucket adına bakarak DELETE/UPDATE izni veriyor. Herkese açık INSERT ve SELECT de var. Yönetim/bilet üretimi sunucuda doğrulanmış bir role veya dar kapsamlı imzalı işlemlere taşındıktan sonra bu politikalar kapatılmalı. Dosyaları silerek veya değiştirerek test yapılmadı.
2. **Yüksek öncelik — tüm hesaplara düzenleme:** `artists`, `sets`, `our_work_projects` üzerinde authenticated INSERT/UPDATE/DELETE politikaları `true`; `radio_schedule_weekly` authenticated ALL politikası `true`. Hesap açabilmek, bu verilere yönetici yetkisi vermemeli. Admin rolü ve sanatçı sahipliği sunucu/RLS tarafında uygulanmalı. Client-side `ArtistControlGuard` bir güvenlik sınırı değildir.
3. **Yüksek öncelik — özel veriler:** Başvuru ve bilet tablolarında authenticated SELECT politikaları `true`. Hangi hesapların hangi kaydı görmesi gerektiği belirlenip sahiplik/admin kontrolleri eklenmeli.
4. **RPC izinleri:** Advisor 11 SECURITY DEFINER fonksiyonunun hem anon hem authenticated tarafından çağrılabildiğini bildiriyor. Özellikle arşivleme, temizleme, program doldurma ve scraper tetikleme fonksiyonlarının EXECUTE izinleri iş akışlarıyla birlikte incelenmeli. Public okuma/beğeni fonksiyonlarını topluca kapatmak siteyi bozabilir.
5. **Veritabanı bakımı:** Postgres 17.4.1.054 için güvenlik yamaları mevcut; 7 fonksiyonda sabit search_path yok, `pg_net` public şemasında. Postgres güncellemesi yedekleme/geri dönüş ve servis etkisiyle planlanmalı.
6. **Auth:** Sızdırılmış parola koruması kapalı. `thisweek_lineup` RLS açık fakat politika yok; anonim okuma beklenen veriyle karşılaştırılmalı.

Bu canlı ayarlar değiştirilmedi. Yayından önce yetki düzeltmesi ayrı bir öncelik olarak ele alınmalı. npm taramasının sıfır çıkması bu bulguları kapatmaz.

## Sonraki bakım alanları

- Yönetim yetkileri ve service-role işlemlerini açık bir server-only sınırına taşımak.
- Davetiye formuna gerçek kayıt/gönderim entegrasyonu ve spam koruması.
- Yılı olmayan arşiv tarihlerini doğrulanmış ISO tarihlerine dönüştürmek; haftalık program ve kampanya içeriklerini sahibiyle güncellemek.
- Blog, sanatçı, program ve etkinlik sayfalarının ilk HTML'de gerçek veri sunması tamamlandı. Canonical, sitemap ve yapılandırılmış veri kontrolleri [SEO bakım raporunda](./seo-2026-10-02.md).
- Ana sayfa videosu ve public klasörü bu ilk bakımın ardından optimize edildi; boyutlar ve doğrulama [medya bakım raporunda](./performance-2026-10-02.md). Diğer büyük medya ve ölçümlü Lighthouse/Core Web Vitals çalışması sonraki kapsamda. Lighthouse puanı veya yükleme süresi yüzdesi ölçülmedi.
- React 19, Tailwind 4 ve ESLint ana sürüm geçişlerini bağımsız uyumluluk çalışması olarak planlamak. Bu bakımda görsel/3D ekosistemini topluca yükseltmedik.
- Merch çalışması bu bakım öncesinde yereldeydi; ilk ziyaret popup'ı ve yayın içeriği ürün kararı olarak ayrıca gözden geçirilmeli.

## Kaynaklar

- [Next.js 16 yükseltme rehberi](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Route groups: aynı URL çakışmaları](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- [Proxy dosyası](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Supabase changelog](https://supabase.com/changelog)
- [SECURITY DEFINER fonksiyon izinleri](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Function search_path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Postgres güncelleme](https://supabase.com/docs/guides/platform/upgrading)
- [Parola koruması](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

Bağımlılık sonuçları npm registry; veritabanı bulguları canlı Supabase Advisor ve `pg_policies` sorgusundan alındı. Sürümle eşleşen Next.js belgeleri `node_modules/next/dist/docs/` altında okundu.
