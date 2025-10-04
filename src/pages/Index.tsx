import { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import HomeHero from "@/components/home/HomeHero";

const Index = () => {
  // Scroll to top when component mounts
 

  return (
    <PageLayout customBackground="bg-gradient-to-br from-[#040406] to-[#111726]" showFooter={false}>
      <HomeHero />
    </PageLayout>
  );
};

export default Index;
