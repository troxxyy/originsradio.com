import { useState, useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import Navigation from "./components/Navigation";
import TicketPopup from "./components/TicketPopup";
import About from "./pages/About";
// Lazy load route components
const Index = lazy(() => import("./pages/Index"));
const OurWork = lazy(() => import("./pages/OurWork"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GoCrazy = lazy(() => import("./pages/GoCrazy"));

const queryClient = new QueryClient();

const ONE_HOUR = 60 * 60 * 1000; //one minute

// RouteTracker component to force remounting of components when route changes
const RouteTracker = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Using the pathname as a key forces React to remount the entire component tree
  // when the route changes, ensuring proper cleanup of resources
  return <div key={location.pathname}>{children}</div>;
};

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
        <TicketPopup />

        {/* Loading Screen - Only show when needed */}
        {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}

        {/* Main Content - Only shown when loading is complete */}
        <div style={{ display: isLoading ? "none" : "block" }}>
          <BrowserRouter>
            <Navigation />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <Routes>
                <Route path="/" element={
                  <RouteTracker>
                    <Index />
                  </RouteTracker>
                } />
                <Route path="/ourwork" element={
                  <RouteTracker>
                    <OurWork />
                  </RouteTracker>
                } />
                <Route path="/gocrazy" element={
                  <RouteTracker>
                    <GoCrazy />
                  </RouteTracker>
                } />
                <Route path="/about" element={
                  <RouteTracker>
                    <About />
                  </RouteTracker>
                } />
                <Route path="*" element={
                  <RouteTracker>
                    <NotFound />
                  </RouteTracker>
                } />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;