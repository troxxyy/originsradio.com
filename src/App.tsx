import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";
import OurWork from "./pages/OurWork";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient();

const ONE_HOUR = 60 * 60 * 1000; //one minute

const App = () => {
  const [isLoading, setIsLoading] = useState(() => {
    const lastVisit = localStorage.getItem("lastVisit");
    return !lastVisit || Date.now() - parseInt(lastVisit) > ONE_HOUR;
  });

  useEffect(() => {
    console.log("App mounted, isLoading:", isLoading);
    if (isLoading) {
      localStorage.setItem("lastVisit", Date.now().toString());
    }
  }, [isLoading]);

  const handleLoadingComplete = () => {
    console.log("handleLoadingComplete called, setting isLoading to false");
    setIsLoading(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* Loading Screen - Only show when needed */}
        {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}

        {/* Main Content - Only shown when loading is complete */}
        <div style={{ display: isLoading ? "none" : "block" }}>
          <BrowserRouter>
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ourwork" element={<OurWork />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;