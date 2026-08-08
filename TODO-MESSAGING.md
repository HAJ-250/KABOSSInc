# Messaging System Enhancement — Scroll-Up Pagination, Chatbot & UI Polish

## Plan approved by user

### 1. Scroll-up pagination (both portals)
- Add `hasMore`, `oldestId`, `loadingOlder` state.
- First load fetches latest page (limit ~30), determines `hasMore`.
- `loadOlder()` fetches `before=oldestId`, prepends messages, preserves scroll position.
- Scroll handler near top → load older.
- "Load earlier messages" button + top spinner fallback.

### 2. Chatbot (user portal only)
- Rule-based knowledge base (pricing, booking, gallery, hours, location, services, contact, human support).
- Typing indicator then styled bot reply bubble.
- Quick-suggestion chips.
- Client-side only (not persisted to DB).

### 3. UI polish (both portals)
- Date separators between messages.
- "Loading older messages" spinner/gradient at top.
- Improved empty states and header polish.

## Files edited
- `frontend/src/pages/dashboard/Messages.tsx`
- `admin-dashboard/src/pages/Messages.tsx`

## Follow-up
- Type-check both frontends (`tsc --noEmit`).

## Progress
- [x] Step 1: User portal — pagination state + loadOlder + scroll handler
- [x] Step 2: User portal — chatbot (knowledge base, typing, bot bubbles, chips)
- [x] Step 2b: User portal — fixed unicode escapes in JSX strings to render ’ and 👋 correctly
- [x] Step 3: User portal — UI polish (date separators, loading states)
- [x] Step 4: Admin portal — pagination + UI polish (date separators, load-older)
- [x] Step 5a: Frontend tsc --noEmit PASSED cleanly
- [x] Step 5b: Admin-dashboard tsc --noEmit PASSED cleanly

## Complete ✅
