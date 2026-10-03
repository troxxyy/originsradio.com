# Ankara içerik ve iç bağlantı bakımı — 3 Ekim 2026

## Değişiklikler

- `/ankara-elektronik-muzik` adresinde özgün Türkçe keşif sayfası eklendi. Radyo dinleme, haftalık yayın saatleri, sanatçı seçimi, etkinlik arşivi ve booking/mix başvurusu için yol gösteriyor.
- Konumu Ankara olan 25 sanatçı ve Ankara konumu açıkça yazılmış 8 geçmiş etkinlik, mevcut anonim public-content okuyucularından geliyor. İsimler, türler, mekânlar ve bağlantılar gerçek profil/etkinlik kayıtlarına dayanıyor; sayılar içerik değiştikçe güncelleniyor.
- Ankara hakkındaki yayımlanmış blog yazısına bağlantı var. Geçmiş etkinlikler “Arşiv” olarak gösteriliyor; yılı eksik tarih alanları yeni bir etkinlik tarihi olarak yorumlanmıyor.
- Ana sayfadan ve ortak footer’dan keşif sayfasına ulaşılabiliyor. Footer’a radyo programı ve blog bağlantıları da eklendi; tanıtım metni gerçek kapsamı anlatacak şekilde düzeltildi.
- Sayfa kendi canonical adresini, Türkçe başlık/açıklama ve `tr_TR` Open Graph dilini taşıyor. Görünür ana içerik `lang="tr"`; CollectionPage/ItemList ve BreadcrumbList JSON-LD gerçek bağlantılardan üretiliyor. Sayfa bağımsız içerik olduğu için mevcut İngilizce sayfalara çeviri eşdeğeri olduğu iddiasıyla hreflang eklenmedi.
- Sitemap artık 82 canonical URL içeriyor. Yeni sayfa sunucuda hazırlanıyor, 5 dakika önbellek kullanıyor ve yeni bir istemci veri isteği veya animasyon paketi eklemiyor.

## Yayın öncesi doğrulama

- `npm run typecheck`: geçti.
- Değişen TSX/sitemap dosyalarında ESLint: 0 hata, 0 uyarı.
- `npm run build -- --webpack`: geçti; 162 sayfa üretildi. Mevcut Supabase realtime dependency uyarısı sürüyor.
- `node scripts/audit_public_seo.mjs http://127.0.0.1:3101`: 82 URL ile geçti. Yeni sayfanın ilk HTML içeriği, Türkçe CollectionPage şeması, sanatçı/etkinlik bağlantıları ve ana sayfa/roster üzerinden erişimi denetleniyor.
- Agent Browser ile 1280px masaüstü ve 390px mobil görünüm kontrol edildi. Yatay taşma, framework hata ekranı veya tarayıcı hatası görülmedi. Navigasyon görünür; tür bağlantısı `/artists?genre=Techno` adresine gidiyor.
- Dev sunucusundaki toplu derlemede bir etkinlik isteği geçici JSON parse hatası verdi. Üretim build’i ve aynı etkinlik dahil tam HTTP kontrolü geçti. Dev sunucusu `127.0.0.1:3100` üzerinde aynı hostname ile yeniden başlatıldı; navigasyon ve hydration doğrulandı.

## Kaynak yaklaşımı

İçeriğin kaynağı OriginsRadio’nun mevcut sanatçı, etkinlik, blog ve iletişim kayıtlarıdır. Sayfa tüm Ankara sahnesini kapsayan bir katalog veya bağımsız mekân önerisi olarak sunulmuyor.

- [Google: yararlı ve güvenilir içerik](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: diller için ayrı URL ve görünür dil](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

İndekslenme ve arama sıralaması bu kontrollerin ölçtüğü sonuçlar değildir.
