import PageLayout from "@/components/layout/PageLayout";
import HeroSection from "./components/HeroSection";
import JudgesSection from "./components/JudgesSection";
import TimelineSection from "./components/TimelineSection";
import RewardsSection from "./components/RewardsSection";
import FAQSection from "./components/FAQSection";
import ApplicationForm from "./components/ApplicationForm";
import TermsSection from "./components/TermsSection";

export default function OpenSpectrumPage() {
    return (
        <PageLayout customBackground="bg-black" showFooter={true}>
            <main className="min-h-screen w-full overflow-x-hidden bg-black text-white selection:bg-cyan-500/30 font-sans">
                <HeroSection />

                <div className="relative z-10 bg-black">
                    <JudgesSection />
                    <TimelineSection />
                    <RewardsSection />

                    <ApplicationForm />
                    <TermsSection />
                    <FAQSection />
                </div>
            </main>
        </PageLayout>
    );
}
