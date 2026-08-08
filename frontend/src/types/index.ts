export interface User {
  id: string;
  email: string;
  displayName: string;
photoURL?: string;
  profilePictureUrl?: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  isActive: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  icon: string;
  image?: string;
  benefits: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceCategory =
  | 'printing'
  | 'graphic-design'
  | 'photography'
  | 'sound-system'
  | 'digital-services'
  | 'irembo-assistance';

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  status: BookingStatus;
  details: string;
  date: Date;
  time?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments: Attachment[];
  read: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  subject: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  status: 'active' | 'archived' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'image' | 'video';
  category: string;
  thumbnail?: string;
  featured: boolean;
  createdAt: Date;
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageCount: number;
}

export interface Partner {
  id: string;
  name: string;
  description: string;
  logo: string;
  website?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'daily' | 'weekly' | 'holiday' | 'promotion' | 'update' | 'motivational' | 'new-service';
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  mission: string;
  vision: string;
  coreValues: string[];
  businessHours: BusinessHours;
  contact: ContactInfo;
  socialMedia: SocialMedia;
  seo: SEOData;
}

export interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  emergency?: string;
  mapUrl?: string;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  email?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
}

export interface VisitorStats {
  today: number;
  weekly: number;
  monthly: number;
  total: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
}
