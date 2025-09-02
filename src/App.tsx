
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
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { AuthProvider } from "@/hooks/useAuth";
import "./App.css";

const queryClient = new QueryClient();

function App() {
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
          
          {/* Admin routes with auth */}
          <Route path="/admin/*" element={
            <AuthProvider>
              <NotificationsProvider>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/jobs" element={<AdminDashboard />} />
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
