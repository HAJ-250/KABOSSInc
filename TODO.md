# TODO - Chat & Admin Portal Improvements

## Part 1: Make Chat Input Box More Prominent
1. [x] Enhance typing box in `frontend/src/pages/dashboard/Messages.tsx` (customer chat)
2. [x] Enhance typing box in `admin-dashboard/src/pages/Messages.tsx` (admin chat)
3. [x] Verify changes render correctly

## Part 2: Add Consistent Language Selector to Admin Portal
1. [x] Create language store for admin-dashboard (shared `kaboss_lang` key)
2. [x] Create `LanguageSelector` component in admin-dashboard (matches customer site)
3. [x] Add `LanguageSelector` to the admin header in `AppLayout.tsx`
4. [x] Verify it renders and persists the language choice

## Part 3: Add Language Selector to User's Portal (Dashboard)
1. [x] Import `LanguageSelector` in `frontend/src/layouts/DashboardLayout.tsx`
2. [x] Place `<LanguageSelector compact />` in the user dashboard header (next to dark-mode toggle)
3. [x] Verify the frontend build passes

## Part 4: Make Developer Credit a Link
1. [x] Make "HIRWA Aime Jospin" in the footer a link to Instagram (https://www.instagram.com/h.a.j_250/?hl=en)
