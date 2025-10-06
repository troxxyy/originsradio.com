import { useState, useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { HelmetProvider } from "react-helmet-async";
import LoadingScreen from "./components/LoadingScreen";
import ArtistControlGuard from "@/components/admin/ArtistControlGuard";
import Navigation from "./components/Navigation";
import TicketPopup from "./components/TicketPopup";
import MusicPlayer from "./components/music/MusicPlayer";
import About from "./pages/About";

// Lazy load route components
const Index = lazy(() => import("./pages/Index"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const TicketVerify = lazy(() => import("./pages/TicketVerify"));
const InviteForm = lazy(() => import("./pages/InviteForm"));
const NotFound = lazy(() => import("./pages/404"));
const GoCrazy = lazy(() => import("./pages/3dvs"));
const Artists = lazy(() => import("./pages/Artists"));
const ArtistDetail = lazy(() => import("./pages/ArtistDetail"));
const AdminArtists = lazy(() => import("./pages/AdminArtists"));
const AdminUploads = lazy(() => import("./pages/AdminUploads"));
const Anniversary = lazy(() => import("./pages/Anniversary"));
const ThisWeek = lazy(() => import("./pages/ThisWeek"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const RadioSchedule = lazy(() => import("./pages/RadioSchedule"));
const AdminRadioSchedule = lazy(() => import("./pages/AdminRadioSchedule"));
const ArtistLogin = lazy(() => import("./pages/ArtistLogin"));
const ArtistSignup = lazy(() => import("./pages/ArtistSignup"));
const ArtistDashboard = lazy(() => import("./pages/ArtistDashboard"));

const queryClient = new QueryClient();

const ONE_HOUR = 60 * 60 * 1000; //one minute

// RouteTracker component to force remounting of components when route changes
const RouteTracker = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Using the pathname as a key forces React to remount the entire component tree
  // when the route changes, ensuring proper cleanup of resources
  return <div key={location.pathname}>{children}</div>;
};

// Artist Login Button Component - Only shows on homepage
const ArtistLoginButton = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  if (!isHomePage) return null;

  return (
    <div className="fixed top-3 right-3 sm:top-6 sm:right-6 z-50 perspective-1000">
      <Link 
        to="/artist/login" 
        className="block group"
        aria-label="Artist Login"
        title="Artist Login"
      >
        {/* Mobile: icon-only button */}
        <span className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
          <LogIn className="w-5 h-5 text-white" />
        </span>
        {/* Desktop: original image */}
        <img 
          src="/artistlogin.png" 
          alt="Artist Login" 
          className="hidden sm:block h-auto max-h-20"
        />
      </Link>
    </div>
  );
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
    <HelmetProvider>
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
              <ArtistLoginButton />
              <MusicPlayer />
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <Routes>
                  <Route path="/" element={
                    <RouteTracker>
                      <Index />
                    </RouteTracker>
                  } />
                  <Route path="/events" element={
                    <RouteTracker>
                      <Events />
                    </RouteTracker>
                  } />
                  <Route path="/events/:eventSlug" element={
                    <RouteTracker>
                      <EventDetail />
                    </RouteTracker>
                  } />
                  <Route path="/invite/:eventSlug" element={
                    <RouteTracker>
                      <InviteForm />
                    </RouteTracker>
                  } />
                  <Route path="/ticket/:code" element={
                    <RouteTracker>
                      <TicketVerify />
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
                  <Route path="/radio/schedule" element={
                    <RouteTracker>
                      <RadioSchedule />
                    </RouteTracker>
                  } />
                  <Route path="/thisweek" element={
                    <RouteTracker>
                      <ThisWeek />
                    </RouteTracker>
                  } />
                  <Route path="/blog" element={
                    <RouteTracker>
                      <Blog />
                    </RouteTracker>
                  } />
                  <Route path="/blog/:slug" element={
                    <RouteTracker>
                      <BlogDetail />
                    </RouteTracker>
                  } />

                  <Route path="/artists/:artistSlug" element={
                    <RouteTracker>
                      <ArtistDetail />
                    </RouteTracker>
                  } />
                  <Route path="/anniversary" element={
                    <RouteTracker>
                      <Anniversary />
                    </RouteTracker>
                  } />
                  <Route path="/artist/login" element={
                    <RouteTracker>
                      <ArtistLogin />
                    </RouteTracker>
                  } />
                  <Route path="/artist/signup" element={
                    <RouteTracker>
                      <ArtistSignup />
                    </RouteTracker>
                  } />
                  <Route path="/artist/dashboard" element={
                    <RouteTracker>
                      <ArtistDashboard />
                    </RouteTracker>
                  } />
                  <Route path="/artistcontrolsecret" element={
                    <RouteTracker>
                      <ArtistControlGuard>
                        <AdminArtists />
                      </ArtistControlGuard>
                    </RouteTracker>
                  } />
                  <Route path="/artistcontrolsecret/artists" element={
                    <RouteTracker>
                      <ArtistControlGuard>
                        <AdminArtists />
                      </ArtistControlGuard>
                    </RouteTracker>
                  } />
                  <Route path="/artistcontrolsecret/schedule" element={
                    <RouteTracker>
                      <ArtistControlGuard>
                        <AdminRadioSchedule />
                      </ArtistControlGuard>
                    </RouteTracker>
                  } />
                  <Route path="/originsradio/adminuploads" element={
                    <RouteTracker>
                      <AdminUploads />
                    </RouteTracker>
                  } />
                  <Route path="/uploads" element={
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