import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Languages } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { useState } from "react";

interface PrivacyPolicyDialogProps {
  triggerLabel?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  buttonClassName?: string;
}

const PrivacyPolicyDialog = ({
  triggerLabel = 'Privacy Policy',
  variant = 'outline',
  size = 'default',
  buttonClassName
}: PrivacyPolicyDialogProps) => {
  const { trigger } = useWebHaptics();
  const [language, setLanguage] = useState<'en' | 'tr'>('en');

  const englishPrivacyPolicy = (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Origins Radio – Privacy Policy
        </h3>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          This Privacy Policy describes how Origins Radio (operated by Origins Medya ve Teknoloji A.Ş.) collects, uses, and protects your personal information when you use our services.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Information We Collect</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          We may collect the following types of information:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Personal identification information (name, email address, phone number)</li>
          <li>Demographic information (age, gender, location)</li>
          <li>Technical information (IP address, browser type, device information)</li>
          <li>Usage data (pages visited, time spent, click patterns)</li>
          <li>Communication preferences and feedback</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">How We Use Your Information</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          We use your information to:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Provide and improve our radio services</li>
          <li>Send you event notifications and updates</li>
          <li>Respond to your inquiries and provide customer support</li>
          <li>Analyze usage patterns to enhance user experience</li>
          <li>Comply with legal obligations</li>
          <li>Prevent fraud and ensure security</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Data Protection</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely and accessed only by authorized personnel.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Your Rights</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Under Turkish Law on Protection of Personal Data (KVKK), you have the right to:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to data processing</li>
          <li>Request data portability</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Contact Us</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at: info@originsradio.com
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Updates to This Policy</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on our website.
        </p>
      </div>
    </div>
  );

  const turkishPrivacyPolicy = (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Origins Radio – Gizlilik Politikası
        </h3>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Bu Gizlilik Politikası, Origins Radio'nun (Origins Medya ve Teknoloji A.Ş. tarafından işletilmektedir) hizmetlerimizi kullandığınızda kişisel bilgilerinizi nasıl topladığını, kullandığını ve koruduğunu açıklamaktadır.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Topladığımız Bilgiler</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Aşağıdaki bilgi türlerini toplayabiliriz:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Kişisel kimlik bilgileri (ad, e-posta adresi, telefon numarası)</li>
          <li>Demografik bilgiler (yaş, cinsiyet, konum)</li>
          <li>Teknik bilgiler (IP adresi, tarayıcı türü, cihaz bilgileri)</li>
          <li>Kullanım verileri (ziyaret edilen sayfalar, geçirilen zaman, tıklama desenleri)</li>
          <li>İletişim tercihleri ve geri bildirimler</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Bilgilerinizi Nasıl Kullanırız</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Bilgilerinizi şu amaçlarla kullanırız:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Radyo hizmetlerimizi sağlamak ve geliştirmek</li>
          <li>Etkinlik bildirimleri ve güncellemeleri göndermek</li>
          <li>Sorularınıza yanıt vermek ve müşteri desteği sağlamak</li>
          <li>Kullanıcı deneyimini geliştirmek için kullanım desenlerini analiz etmek</li>
          <li>Yasal yükümlülükleri yerine getirmek</li>
          <li>Dolandırıcılığı önlemek ve güvenliği sağlamak</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Veri Koruması</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Kişisel bilgilerinizi yetkisiz erişim, değişiklik, ifşa veya imhaya karşı korumak için uygun güvenlik önlemlerini uygularız. Verileriniz güvenli bir şekilde saklanır ve yalnızca yetkili personel tarafından erişilir.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Haklarınız</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:
        </p>
        <ul className="list-disc list-inside text-gray-200 text-sm sm:text-base space-y-2 ml-4">
          <li>Kişisel verilerinize erişim hakkı</li>
          <li>Yanlış verilerin düzeltilmesini talep etme hakkı</li>
          <li>Verilerinizin silinmesini talep etme hakkı</li>
          <li>Veri işlemeye itiraz etme hakkı</li>
          <li>Veri taşınabilirliği hakkı</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">İletişim</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Bu Gizlilik Politikası hakkında sorularınız varsa veya haklarınızı kullanmak istiyorsanız, lütfen bizimle iletişime geçin: info@originsradio.com
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-semibold text-white">Politika Güncellemeleri</h4>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
          Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Herhangi bir değişiklik durumunda, yeni politikayı web sitemizde yayınlayarak sizi bilgilendireceğiz.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={() => trigger('light')}
          className={buttonClassName ?? "border-white/20 bg-white/5 text-white hover:bg-white/10"}
        >
          <Shield className="w-4 h-4 mr-2" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/95 backdrop-blur-xl border border-white/10 text-white max-w-4xl max-h-[95vh] overflow-hidden m-2 sm:m-4">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white/90 flex-shrink-0" />
              <DialogTitle className="text-lg sm:text-xl font-semibold text-white truncate">
                {language === 'en' ? 'Privacy Policy' : 'Gizlilik Politikası'}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => {
                  trigger('light');
                  setLanguage(language === 'en' ? 'tr' : 'en');
                }}
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
          {language === 'en' ? englishPrivacyPolicy : turkishPrivacyPolicy}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyDialog;