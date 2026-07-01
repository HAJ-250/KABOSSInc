import {
  Printer,
  Palette,
  Camera,
  Volume2,
  Monitor,
  Globe,
  type LucideIcon,
} from 'lucide-react';

export interface ServiceData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  items: string[];
  color: string;
  gradient: string;
  image?: string;
}

export const services: ServiceData[] = [
  {
    id: 'printing',
    title: 'Printing Services',
    description: 'Professional printing solutions for all your personal and business needs. From elegant invitations to business documents.',
    icon: Printer,
    category: 'printing',
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    items: [
      'Wedding Invitations',
      'Introduction Invitations',
      'Graduation Invitations',
      'Birthday Invitations',
      'Business Cards',
      'Flyers & Posters',
      'Brochures',
      'Certificates',
      'Books & Documents',
      'Photocopying',
      'Scanning',
      'Laminating',
      'Spiral Binding',
    ],
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    description: 'Creative design solutions that bring your vision to life. Professional branding and visual communication.',
    icon: Palette,
    category: 'graphic-design',
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
    items: [
      'Invitation Design',
      'Logo Design',
      'Posters & Banners',
      'Roll-up Banners',
      'Company Profiles',
      'Brochures',
      'Branding',
      'Certificates',
      'Social Media Posters',
    ],
  },
  {
    id: 'photography',
    title: 'Photography',
    description: 'Capture your precious moments with professional photography services for every occasion.',
    icon: Camera,
    category: 'photography',
    color: 'from-amber-500 to-orange-500',
    gradient: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
    items: [
      'Passport Photos',
      'Studio Photography',
      'Wedding Photography',
      'Graduation Photography',
      'Birthday Photography',
      'Outdoor Photoshoots',
      'Event Photography',
    ],
  },
  {
    id: 'sound-system',
    title: 'Sound System',
    description: 'Premium sound system rental for events of all sizes. Crystal clear audio for unforgettable experiences.',
    icon: Volume2,
    category: 'sound-system',
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    items: [
      'Wedding Ceremonies',
      'Introduction Ceremonies',
      'Parties & Celebrations',
      'Graduation Events',
      'Church Events',
      'Conferences',
      'Corporate Events',
    ],
  },
  {
    id: 'digital-services',
    title: 'Digital Services',
    description: 'Comprehensive digital assistance to help you navigate the modern online world with ease.',
    icon: Monitor,
    category: 'digital-services',
    color: 'from-red-500 to-rose-500',
    gradient: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    items: [
      'CV Preparation',
      'Document Typing',
      'Printing & Scanning',
      'Internet Assistance',
      'Email Assistance',
    ],
  },
  {
    id: 'irembo-assistance',
    title: 'Irembo Assistance',
    description: 'We assist you in accessing government services through the Irembo platform. Quick, reliable, and professional guidance.',
    icon: Globe,
    category: 'irembo-assistance',
    color: 'from-teal-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30',
    items: [
      'Irembo Account Setup',
      'Document Upload Assistance',
      'Application Guidance',
      'Status Tracking Help',
      'Form Filling Support',
    ],
  },
];

export const serviceCategories = [
  { id: 'all', label: 'All Services' },
  { id: 'printing', label: 'Printing' },
  { id: 'graphic-design', label: 'Graphic Design' },
  { id: 'photography', label: 'Photography' },
  { id: 'sound-system', label: 'Sound System' },
  { id: 'digital-services', label: 'Digital Services' },
  { id: 'irembo-assistance', label: 'Irembo Assistance' },
];
