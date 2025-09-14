
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import About from "@/pages/About";
import ServicesPage from "@/pages/ServicesPage";
import GalleryPage from "@/pages/GalleryPage";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import FAQs from "@/pages/FAQs";
import Auth from "@/pages/Auth";
import AdminDashboard from "@/pages/AdminDashboard";
import AccessDenied from "@/pages/AccessDenied";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import ThankYou from "@/pages/ThankYou";
import NotFound from "@/pages/NotFound";
import PropertyShowcase from "@/pages/PropertyShowcase";
import Showcase from "@/pages/Showcase";
import Sitemap from "@/pages/Sitemap";
import HunterdonCounty from "@/pages/HunterdonCounty";
import BergenCounty from "@/pages/BergenCounty";
import EssexCounty from "@/pages/EssexCounty";
import HudsonCounty from "@/pages/HudsonCounty";
import MercerCounty from "@/pages/MercerCounty";
import MiddlesexCounty from "@/pages/MiddlesexCounty";
import MonmouthCounty from "@/pages/MonmouthCounty";
import MorrisCounty from "@/pages/MorrisCounty";
import PassaicCounty from "@/pages/PassaicCounty";
import SomersetCounty from "@/pages/SomersetCounty";
import SussexCounty from "@/pages/SussexCounty";
import UnionCounty from "@/pages/UnionCounty";
import WarrenCounty from "@/pages/WarrenCounty";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { AuthProvider } from "@/hooks/useAuth";
import "./App.css";

console.log('[Debug] App module loaded');
;(window as any).__appModuleLoaded = true;

const queryClient = new QueryClient();

function App() {
  console.log('App component rendering...');
  
  useEffect(() => {
    console.log('[App] mounted');
    return () => console.log('[App] unmounted');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/showcase/:slug" element={<PropertyShowcase />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          
          {/* County pages */}
          <Route path="/hunterdon" element={<HunterdonCounty />} />
          <Route path="/bergen" element={<BergenCounty />} />
          <Route path="/essex" element={<EssexCounty />} />
          <Route path="/hudson" element={<HudsonCounty />} />
          <Route path="/mercer" element={<MercerCounty />} />
          <Route path="/middlesex" element={<MiddlesexCounty />} />
          <Route path="/monmouth" element={<MonmouthCounty />} />
          <Route path="/morris" element={<MorrisCounty />} />
          <Route path="/passaic" element={<PassaicCounty />} />
          <Route path="/somerset" element={<SomersetCounty />} />
          <Route path="/sussex" element={<SussexCounty />} />
          <Route path="/union" element={<UnionCounty />} />
          <Route path="/warren" element={<WarrenCounty />} />
          
          {/* Admin routes with auth */}
          <Route path="/admin/*" element={
            <AuthProvider>
              <NotificationsProvider>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/jobs" element={<AdminDashboard />} />
                  <Route path="/listings" element={<AdminDashboard />} />
                  <Route path="/blog" element={<AdminDashboard />} />
                  <Route path="/gallery" element={<AdminDashboard />} />
                  <Route path="/analytics" element={<AdminDashboard />} />
                  <Route path="/settings" element={<AdminDashboard />} />
                </Routes>
              </NotificationsProvider>
            </AuthProvider>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
