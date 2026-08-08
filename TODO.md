# Implementation TODO

## Task 1: Consistent light/dark mode button (user portal)
- [x] Add theme toggle button to `frontend/src/layouts/DashboardLayout.tsx` header
- [x] Add theme toggle button to `frontend/src/layouts/AdminLayout.tsx` header

## Task 2: Enable download button in notifications
- [x] Add `GET /notifications/:id/download` endpoint in `backend/src/routes/notifications.ts`
- [x] Add `api.downloadNotification()` in `frontend/src/services/api.ts`
- [x] Add download button in `frontend/src/pages/dashboard/Notifications.tsx`

## Task 3: Consistent admin footer
- [x] Add premium-dark footer to `admin-dashboard/src/components/AppLayout.tsx`

## Verification
- [ ] TypeScript build checks (frontend + admin-dashboard + backend)
- [ ] Verify functionality end-to-end
