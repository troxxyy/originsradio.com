import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Languages } from "lucide-react";
import { useState } from "react";

interface ConsumerDisclosureDialogProps {
  triggerLabel?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  buttonClassName?: string;
}

const ConsumerDisclosureDialog = ({ 
  triggerLabel = 'Consumer Disclosure', 
  variant = 'outline', 
  size = 'default', 
  buttonClassName 
}: ConsumerDisclosureDialogProps) => {
  const [language, setLanguage] = useState<'en' | 'tr'>('en');

  const englishConsumerDisclosure = (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Origins Radio – Personal Data Protection and Processing Policy
        </h3>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          This policy is prepared in accordance with the Turkish Penal Code No. 5237 and the Law on the Protection of Personal Data No. 6698 ("KVKK"), as well as other relevant legislation. It outlines how Origins Radio (operated by Origins Medya ve Teknoloji A.Ş.) collects, processes, stores, and protects your personal data.
        </p>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          We may request certain personal information from you (such as full name, national ID number, age, date of birth, city of residence, address, gender, account password, email address, billing address, credit or debit card information, mobile phone number, and your event preferences) in order to:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Fulfill legal obligations</li>
          <li>Manage collections and invoicing</li>
          <li>Provide services and notify you of new events</li>
          <li>Send promotional and informational content or campaign announcements</li>
          <li>Remind you of upcoming events</li>
          <li>Understand and manage your preferences as a user or member</li>
          <li>Facilitate membership registration processes</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Purpose of Personal Data Processing</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Your personal data is processed for the following purposes:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Event registration and ticket sales</li>
          <li>Customer service and support</li>
          <li>Marketing communications (with your consent)</li>
          <li>Legal compliance and regulatory requirements</li>
          <li>Security and fraud prevention</li>
          <li>Service improvement and analytics</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Data Sharing and Third Parties</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          We may share your personal data with:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Payment processors for transaction processing</li>
          <li>Service providers who assist with our operations</li>
          <li>Legal authorities when required by law</li>
          <li>Business partners for joint events (with your consent)</li>
        </ul>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          We do not sell your personal data to third parties for their marketing purposes.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Data Retention</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          We retain your personal data only as long as necessary for the purposes outlined in this policy, or as required by applicable law. When data is no longer needed, it is securely deleted or anonymized.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Payment Security</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Financial information required for payments (such as credit card numbers, expiration dates) is shared only with relevant payment institutions during transactions. Credit card information is never recorded, stored, or shared with third parties by us. All transactions are conducted securely through bank POS systems.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Your Rights Under KVKK</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          As a data subject, you have the right to:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Learn whether your personal data is being processed</li>
          <li>Request information about the processing if your data is being processed</li>
          <li>Learn the purpose of processing and whether data is used appropriately</li>
          <li>Know third parties to whom your data is transferred domestically or abroad</li>
          <li>Request correction of incomplete or inaccurate data</li>
          <li>Request deletion or destruction of your data under certain conditions</li>
          <li>Request notification of data correction, deletion, or destruction to third parties</li>
          <li>Object to negative results arising from automated data analysis</li>
          <li>Claim compensation for damages caused by unlawful data processing</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Contact Information</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          To exercise your rights or for questions regarding personal data processing, please contact us at:
        </p>
        <div className="text-gray-200 text-sm sm:text-base leading-relaxed ml-4">
          <p>Email: info@originsradio.com</p>
          <p>Address: Origins Medya ve Teknoloji A.Ş., Ankara, Turkey</p>
        </div>
      </div>
    </div>
  );

  const turkishConsumerDisclosure = (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Origins Radio – Kişisel Verilerin Korunması ve İşlenmesi Politikası
        </h3>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Bu politika, 5237 sayılı Türk Ceza Kanunu ve 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ile diğer ilgili mevzuat uyarınca hazırlanmıştır. Origins Radio'nun (Origins Medya ve Teknoloji A.Ş. tarafından işletilmektedir) kişisel verilerinizi nasıl topladığını, işlediğini, sakladığını ve koruduğunu açıklamaktadır.
        </p>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Aşağıdaki amaçlarla sizden belirli kişisel bilgiler (ad soyad, TC kimlik numarası, yaş, doğum tarihi, ikamet şehri, adres, cinsiyet, hesap şifresi, e-posta adresi, fatura adresi, kredi veya banka kartı bilgileri, cep telefonu numarası ve etkinlik tercihleriniz gibi) talep edebiliriz:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Yasal yükümlülükleri yerine getirmek</li>
          <li>Tahsilat ve faturalandırma işlemlerini yönetmek</li>
          <li>Hizmet sağlamak ve yeni etkinlikleri bildirmek</li>
          <li>Promosyon ve bilgilendirici içerik veya kampanya duyuruları göndermek</li>
          <li>Yaklaşan etkinlikleri hatırlatmak</li>
          <li>Kullanıcı veya üye olarak tercihlerinizi anlamak ve yönetmek</li>
          <li>Üyelik kayıt süreçlerini kolaylaştırmak</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Kişisel Veri İşleme Amacı</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Etkinlik kaydı ve bilet satışları</li>
          <li>Müşteri hizmetleri ve destek</li>
          <li>Pazarlama iletişimi (onayınız ile)</li>
          <li>Yasal uyumluluk ve düzenleyici gereksinimler</li>
          <li>Güvenlik ve dolandırıcılık önleme</li>
          <li>Hizmet geliştirme ve analitik</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Veri Paylaşımı ve Üçüncü Taraflar</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Kişisel verilerinizi aşağıdakilerle paylaşabiliriz:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>İşlem işleme için ödeme işlemcileri</li>
          <li>Operasyonlarımızda yardımcı olan hizmet sağlayıcıları</li>
          <li>Yasal olarak gerekli olduğunda yasal makamlar</li>
          <li>Ortak etkinlikler için iş ortakları (onayınız ile)</li>
        </ul>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Kişisel verilerinizi üçüncü tarafların pazarlama amaçları için satmayız.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Veri Saklama</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Kişisel verilerinizi yalnızca bu politikada belirtilen amaçlar için gerekli olduğu sürece veya yürürlükteki yasaların gerektirdiği süre boyunca saklarız. Veriler artık gerekli olmadığında güvenli bir şekilde silinir veya anonimleştirilir.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Ödeme Güvenliği</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Origins Radio üzerinden satın aldığınız ürün ve hizmetlerin ödemeleri için gerekli mali bilgiler (örneğin kredi kartı numarası, son kullanma tarihi) yalnızca işlem sırasında ilgili ödeme kuruluşlarıyla paylaşılır. Kredi kartı bilgileriniz tarafımızca hiçbir şekilde kaydedilmez, saklanmaz veya üçüncü şahıslarla paylaşılmaz. Tüm işlemler, banka POS sistemleri üzerinden güvenli ortamda gerçekleştirilir.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">KVKK Kapsamındaki Haklarınız</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Veri sahibi olarak aşağıdaki haklara sahipsiniz:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
          <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme</li>
          <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
          <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
          <li>Belirli koşullar altında kişisel verilerin silinmesini veya yok edilmesini isteme</li>
          <li>Kişisel verilerin düzeltilmesi, silinmesi veya yok edilmesi hâlinde bu işlemlerin üçüncü kişilere bildirilmesini isteme</li>
          <li>Otomatik sistemi analizi sonucu ortaya çıkan olumsuz sonuçlara itiraz etme</li>
          <li>Kanuna aykırı olarak işlenen kişisel veriler nedeniyle zarara uğranması hâlinde zararın giderilmesini talep etme</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">İletişim Bilgileri</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Haklarınızı kullanmak veya kişisel veri işleme ile ilgili sorularınız için lütfen bizimle iletişime geçin:
        </p>
        <div className="text-gray-200 text-sm sm:text-base leading-relaxed ml-4">
          <p>E-posta: info@originsradio.com</p>
          <p>Adres: Origins Medya ve Teknoloji A.Ş., Ankara, Türkiye</p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          className={buttonClassName ?? "border-white/20 bg-white/5 text-white hover:bg-white/10"}
        >
          <FileText className="w-4 h-4 mr-2" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/95 backdrop-blur-xl border border-white/10 text-white max-w-4xl max-h-[95vh] overflow-hidden m-2 sm:m-4">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white/90 flex-shrink-0" />
              <DialogTitle className="text-lg sm:text-xl font-semibold text-white truncate">
                {language === 'en' ? 'Consumer Disclosure' : 'Tüketici Bilgilendirmesi'}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 min-h-[44px] min-w-[60px]"
              >
                <Languages className="h-4 w-4" />
                <span>{language === 'en' ? 'TR' : 'EN'}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4 sm:mt-6 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
          {language === 'en' ? englishConsumerDisclosure : turkishConsumerDisclosure}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsumerDisclosureDialog;
