import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { resolveImageUrl } from '@/lib/utils';
import { InitialLoader } from '@/components/ui/InitialLoader';
import { MainLayout } from '@/components/layout/MainLayout';
import { Home } from '@/pages/Home';
import { About } from '@/pages/About';
import { Services } from '@/pages/Services';
import { ServiceDetail } from '@/pages/ServiceDetail';
import { QuotePage } from '@/pages/QuotePage';
import { Gallery } from '@/pages/Gallery';
import { Partners } from '@/pages/Partners';
import { Testimonials } from '@/pages/Testimonials';
import { FAQ } from '@/pages/FAQ';
import { News } from '@/pages/News';
import { Contact } from '@/pages/Contact';
import { Privacy } from '@/pages/Privacy';
import { Terms } from '@/pages/Terms';
import { NotFound } from '@/pages/NotFound';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardOverview } from '@/pages/dashboard/Overview';
import { DashboardBookings } from '@/pages/dashboard/Bookings';
import { DashboardQuotes } from '@/pages/dashboard/Quotes';
import { DashboardMessages } from '@/pages/dashboard/Messages';
import { DashboardDownloads } from '@/pages/dashboard/Downloads';
import { DashboardNotifications } from '@/pages/dashboard/Notifications';
import { DashboardProfile } from '@/pages/dashboard/Profile';
import { DashboardSettings } from '@/pages/dashboard/Settings';
import { DashboardPayments } from '@/pages/dashboard/Payments';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminBookings } from '@/pages/admin/AdminBookings';
import { AdminContent } from '@/pages/admin/AdminContent';
import { AdminGallery } from '@/pages/admin/AdminGallery';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useThemeStore } from '@/store/useThemeStore';
import { I18nProvider } from '@/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function BackgroundImageInit() {
  useEffect(() => {
    const image = resolveImageUrl('/uploads/profile/1783354105972-bbf27ec5555f78.jpg');
    document.documentElement.style.setProperty('--app-bg-image', `url(${image})`);
  }, []);
  return null;
}

function ThemeInit() {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
    if (dark !== isDarkMode) {
      useThemeStore.getState().toggleDarkMode();
    }
  }, [isDarkMode]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
      <BrowserRouter>
        <BackgroundImageInit />
        <ThemeInit />
        <InitialLoader />
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:serviceId" element={<ServiceDetail />} />
              <Route path="/services/:serviceId/quote" element={<QuotePage />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/news" element={<News />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Route>

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Customer dashboard routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardOverview />} />
                <Route path="/dashboard/bookings" element={<DashboardBookings />} />
                <Route path="/dashboard/quotes" element={<DashboardQuotes />} />
                <Route path="/dashboard/payments" element={<DashboardPayments />} />
                <Route path="/dashboard/messages" element={<DashboardMessages />} />
                <Route path="/dashboard/downloads" element={<DashboardDownloads />} />
                <Route path="/dashboard/gallery" element={<Gallery />} />
                <Route path="/dashboard/notifications" element={<DashboardNotifications />} />
                <Route path="/dashboard/profile" element={<DashboardProfile />} />
                <Route path="/dashboard/settings" element={<DashboardSettings />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/messages" element={<AdminBookings />} />
                <Route path="/admin/gallery" element={<AdminGallery />} />
                <Route path="/admin/content" element={<AdminContent />} />
                <Route path="/admin/analytics" element={<AdminDashboard />} />
                <Route path="/admin/announcements" element={<AdminDashboard />} />
                <Route path="/admin/partners" element={<AdminDashboard />} />
                <Route path="/admin/customers" element={<AdminDashboard />} />
                <Route path="/admin/settings" element={<AdminDashboard />} />
                <Route path="/admin/content/*" element={<AdminContent />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
</BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            borderRadius: '12px',
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
        }}
      />
      </I18nProvider>
    </QueryClientProvider>
  );
}
