# KABOSS Inc - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ running locally
- npm or yarn package manager

## Setup Instructions

### 1. Install Dependencies
```bash
npm run install:all
```
This installs dependencies for frontend and backend.

### 2. Database Setup

#### Option A: Using the SQL Script (Recommended)
```bash
# Open MySQL client
mysql -u root -p

# Run the database setup script
source database.sql
```

#### Option B: Using npm seed script
```bash
npm run seed
```
This creates tables and seeds default data automatically.

### 3. Configure Environment Variables

#### Backend Configuration
Edit `backend/.env`:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # Leave empty if MySQL has no password
DB_NAME=kaboss
JWT_SECRET=<your-strong-jwt-secret>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend Configuration
`frontend/.env` (should already be set):
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Start Development Server
```bash
npm run dev
```

This starts:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Admin Dashboard:** http://localhost:5174 (if running)

### 5. Login to Application

#### Admin Login
- **Email/Username:** `admin@kabossinc.com` / `kabossInc`
- **Password:** `<seed-password>`
- **Access:** http://localhost:5173/login

#### Admin Dashboard
- **URL:** http://localhost:5174 or http://localhost:5173/admin
- **Same credentials as above**

---

## Project Structure

### Frontend
```
frontend/
├── src/
│   ├── components/          # UI components
│   │   └── KabossIncLoader  # NEW: Premium loading screen
│   ├── pages/               # Route pages
│   ├── context/             # Auth context (FIXED)
│   ├── layouts/             # Page layouts
│   └── lib/                 # API utilities
├── public/images/           # Static images (logo here)
└── vite.config.ts          # Vite config with API proxy
```

### Backend
```
backend/
├── src/
│   ├── index.ts             # Main app (FIXED with new endpoints)
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   ├── config/              # Database & auth config
│   └── middleware/          # Auth & rate limiting
├── .env                     # Environment variables
└── database.sql             # Schema & seed data
```

---

## Key Features

### Premium Loading Screen (NEW)
The app now displays an animated loading screen with:
- Logo with pulse and glow effects
- "ALMOST WELCOME" text animation
- Smooth progress bar
- Decorative bouncing elements
- Fade-out transition
- Full accessibility support

**Component:** `frontend/src/components/KabossIncLoader.tsx`

### Authentication
- **Login/Register:** `/login`, `/register`
- **JWT-based:** Tokens stored in localStorage
- **Protected Routes:** Customer dashboard and admin panel

### Customer Features
- User dashboard with bookings, messages, downloads
- Booking system with status tracking
- Internal messaging
- Profile management
- Settings

### Admin Features
- Content management (services, partners, testimonials, FAQs)
- Booking management
- User management
- Gallery management
- Analytics dashboard
- Announcement system

---

## Default Admin Credentials

```
Email: admin@kabossinc.com
Username: kabossInc
Password: <seed-password>
```

⚠️ **Important:** Change this password immediately in production!

---

## API Endpoints (Summary)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update user profile ⭐ (FIXED)
- `DELETE /api/auth/me` - Delete account ⭐ (FIXED)
- `POST /api/auth/reset-password` - Password reset

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Other
- `GET /api/contacts` - Contact submissions
- `GET /api/messages` - Messages
- `GET /api/admin/*` - Admin endpoints

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Ensure MySQL is running
```bash
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo service mysql start
```

### Auth Failing
```
401 Unauthorized
```
**Solution:** Check JWT_SECRET in `backend/.env` matches across restarts

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Change PORT in `backend/.env` or kill the process using the port

### Frontend Can't Connect to API
```
Failed to fetch from http://localhost:3001/api
```
**Solution:** Ensure `VITE_API_URL` in `frontend/.env` is correct and backend is running

---

## Build for Production

```bash
npm run build
```

Creates optimized builds in:
- `frontend/dist/` - React app
- `backend/dist/` - Node.js API

---

## Recent Changes & Fixes

### ✅ Fixed Issues
1. **Auth Response Mismatch** - Fields now properly aligned (camelCase)
2. **Missing Endpoints** - Added PATCH and DELETE for user profile management
3. **Type Definitions** - Added VITE_API_URL to TypeScript types
4. **Documentation** - Updated README with correct tech stack

### ✨ New Features
1. **Premium Loading Screen** - Animated KabossIncLoader component with accessibility

### 📚 Documentation
- `PROJECT_AUDIT_SUMMARY.md` - Detailed audit report
- `QUICK_START.md` - This file

---

## Additional Resources

- **React Documentation:** https://react.dev
- **Vite Documentation:** https://vitejs.dev
- **Express Documentation:** https://expressjs.com
- **Sequelize Documentation:** https://sequelize.org
- **Tailwind CSS:** https://tailwindcss.com
- **TypeScript:** https://www.typescriptlang.org

---

## Support

For issues or questions, refer to:
1. `PROJECT_AUDIT_SUMMARY.md` - Issues found and fixed
2. Backend logs in terminal
3. Browser console for frontend errors
4. Database logs for connection issues

---

**Last Updated:** Project Audit & Refactoring Phase
**Version:** 1.0.0
