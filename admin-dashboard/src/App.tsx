import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { BookingsPage } from './pages/Bookings';
import { MessagesPage } from './pages/Messages';
import { ServicesPage } from './pages/Services';
import { PartnersPage } from './pages/Partners';
import { TestimonialsPage } from './pages/Testimonials';
import { FAQsPage } from './pages/FAQs';
import { AnnouncementsPage } from './pages/Announcements';
import { ContactsPage } from './pages/Contacts';
import { SettingsPage } from './pages/Settings';
import { GalleryUploadsPage } from './pages/GalleryUploads';
import { ProfileUploadsPage } from './pages/ProfileUploads';
import { PaymentsPage } from './pages/Payments';
import { AppLayout } from './components/AppLayout';

import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersPage />} />
<Route path="/bookings" element={<BookingsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/gallery-uploads" element={<GalleryUploadsPage />} />
            <Route path="/profile-uploads" element={<ProfileUploadsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </>
  );
}
