import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Resolve a relative /uploads/... URL to a fully-qualified URL that works in
 * both dev (Vite proxy) and production. In production, images are served by
 * the backend on its own port/host, so we prefix the API origin.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return url;
  // Already absolute (http/https/data/blob) - use as-is
  if (/^(https?:|data:|blob:|\/\/)/i.test(url)) return url;
  // Public assets already served by the frontend - use as-is
  if (url.startsWith('/images/')) return url;
// Relative uploads path - resolve against the backend origin directly.
  // This works in dev (backend on :3001) in addition to the Vite proxy, and in
  // production when VITE_API_URL points to the backend.
  if (url.startsWith('/uploads/')) {
    const base = import.meta.env.VITE_API_URL || 'https://kabossimage-api.onrender.com';
    // Strip any trailing /api path and trailing slash so we get the bare origin.
    const apiOrigin = base.replace(/\/+$/, '').replace(/\/api$/, '');
    return `${apiOrigin}${url}`;
  }
  return url;
}
