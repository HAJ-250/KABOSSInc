import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp';

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-20">
        <Outlet />
      </div>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

