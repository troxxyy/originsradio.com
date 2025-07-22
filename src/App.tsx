import { useState, useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import OptimizedLoader from "@/components/OptimizedLoader";

// Lazy load ALL components for better code splitting
const LoadingScreen = lazy(() => import("./components/LoadingScreen"));
const Navigation = lazy(() => import("./components/Navigation"));
const TicketPopup = lazy(() => import("./components/TicketPopup"));

// Lazy load route components with better loading fallbacks
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const OurWork = lazy(() => import("./pages/OurWork"));
const NotFound = lazy(() => import("./pages/404"));
const GoCrazy = lazy(() => import("./pages/3dvs"));
const Artists = lazy(() => import("./pages/Artists"));
const ArtistDetail = lazy(() => import("./pages/ArtistDetail"));
const AdminArtists = lazy(() => import("./pages/AdminArtists"));
const AdminUploads = lazy(() => import("./pages/AdminUploads"));

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

  // Use the optimized loader component
  const LoadingFallback = () => <OptimizedLoader />;

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<LoadingFallback />}>
            <TicketPopup />
          </Suspense>

          {/* Loading Screen - Only show when needed */}
          {isLoading && (
            <Suspense fallback={<LoadingFallback />}>
              <LoadingScreen onLoadingComplete={handleLoadingComplete} />
            </Suspense>
          )}

          {/* Main Content - Only shown when loading is complete */}
          <div style={{ display: isLoading ? "none" : "block" }}>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Navigation />
              </Suspense>
              <Suspense fallback={<LoadingFallback />}>
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
                  <Route path="/artists" element={
                    <RouteTracker>
                      <Artists />
                    </RouteTracker>
                  } />

                  <Route path="/artists/:artistSlug" element={
                    <RouteTracker>
                      <ArtistDetail />
                    </RouteTracker>
                  } />
                  <Route path="/admin/artists" element={
                    <RouteTracker>
                      <AdminArtists />
                    </RouteTracker>
                  } />
                  <Route path="/admin" element={
                    <RouteTracker>
                      <AdminArtists />
                    </RouteTracker>
                  } />
                  <Route path="/originsradio/adminuploads" element={
                    <RouteTracker>
                      <AdminUploads />
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
    </HelmetProvider>
  );
};

export default App;