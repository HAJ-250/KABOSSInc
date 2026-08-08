# Multilingual (en/rw/fr) Integration Tracking

## Infrastructure (DONE)
- [x] `useLanguageStore.ts` — Zustand + localStorage persistence, default 'en'
- [x] `i18n/translations/en.ts`, `rw.ts`, `fr.ts`
- [x] `i18n/index.ts` — I18nProvider + useI18n (t, lang, setLang) with English fallback
- [x] `LanguageSelector.tsx`
- [x] `services.ts` translatable keys + `useTranslatedServices.ts` hook

## Frontend (main customer site)
- [x] Wire I18nProvider in App.tsx
- [x] Header + LanguageSelector
- [x] Footer
- [x] Home
- [x] About
- [x] Services
- [x] ServiceDetail
- [x] QuotePage + QuoteForm
- [x] Contact
- [x] Gallery
- [x] Partners
- [x] Testimonials
- [x] FAQ
- [x] News
- [x] Privacy / Terms
- [x] NotFound
- [x] Login / Register / ForgotPassword
- [x] DashboardLayout + AdminLayout (selector + nav)
- [x] Dashboard pages (Overview/Bookings/Quotes/Payments/Messages/Downloads/Notifications/Profile/Settings)
- [x] BookingForm
- [x] FloatingWhatsApp

## Admin-dashboard (separate app)
- [x] Admin i18n store + hook + translations
- [x] LanguageSelector in AppLayout + Login
- [x] Translate admin pages

## Backend
- [x] Map statuses/bot replies at UI layer (no DB field changes)

## Quality Check
- [ ] Search remaining hard-coded user-facing text
- [ ] Verify all 3 languages render
- [ ] Verify fallback to English
- [ ] Check desktop/mobile layout
- [ ] TypeScript build passes (frontend + admin-dashboard)
