# KABOSS Inc - Enterprise Full-Stack Website

A production-ready, multi-service business center website built for KABOSS Inc, located in Nyamasheke District, Rwanda.

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, GSAP, TanStack Query, React Router, Zustand, Recharts

**Backend:** Node.js, Express.js, TypeScript, Firebase Admin SDK

**Database:** Firebase Firestore

**Auth:** Firebase Authentication

**Storage:** Firebase Storage

## Features

### Public Website
- Home with animated hero, stats counters, service cards, testimonials
- About with mission, vision, values, business hours
- Services with filtering and detailed views
- Gallery with categories, search, lightbox
- Partners, Testimonials, FAQ (searchable), News, Contact
- Privacy Policy, Terms & Conditions, 404 page
- Dark/Light mode, glassmorphism UI, scroll progress, floating WhatsApp
- Fully responsive, SEO optimized

### Customer Portal (under development)
- User registration, login, password reset, email verification
- Dashboard with overview, bookings, messages, downloads
- Booking system with status tracking
- Internal messaging with file attachments
- Download center for completed work

### Admin Dashboard (under development)
- Content management for all site sections
- Booking management, user management
- Gallery, partners, testimonials CRUD
- Analytics with charts (Recharts)
- Announcement system

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (with Firestore, Auth, Storage enabled)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd KABOSSInc

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Environment Setup

1. Copy the example env files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

2. Fill in your Firebase credentials in both `.env` files.

### Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore, Authentication (Email/Password), and Storage
3. Get your Firebase config from Project Settings > Web Apps
4. Generate Admin SDK private key: Project Settings > Service Accounts > Generate New Private Key

### Development

```bash
# Terminal 1: Start frontend
cd frontend
npm run dev

# Terminal 2: Start backend
cd backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Health: http://localhost:3001/api/health

### Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

## Project Structure

```
KABOSSInc/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── layout/       # Header, Footer, MainLayout
│   │   │   ├── home/         # Home page sections
│   │   │   ├── services/     # Service cards
│   │   │   ├── gallery/      # Gallery grid
│   │   │   ├── booking/      # Booking forms
│   │   │   ├── messaging/    # Chat system
│   │   │   ├── dashboard/    # Customer dashboard
│   │   │   └── admin/        # Admin panel
│   │   ├── pages/            # Route pages
│   │   ├── layouts/          # Layout wrappers
│   │   ├── lib/              # Utilities, Firebase
│   │   ├── hooks/            # Custom hooks
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   ├── services/         # API services
│   │   └── data/             # Static data
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── config/           # Firebase admin setup
│   │   ├── routes/           # API routes
│   │   ├── middleware/        # Auth, rate limiting
│   │   ├── controllers/      # Route handlers
│   │   └── services/         # Business logic
│   ├── .env.example
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/contacts | No | Contact form |
| GET | /api/bookings | Yes | User bookings |
| POST | /api/bookings | Yes | Create booking |
| PATCH | /api/bookings/:id/status | Yes | Update status |
| GET | /api/messages/conversations | Yes | List conversations |
| GET | /api/messages/:id | Yes | Get messages |
| POST | /api/messages | Yes | Send message |

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel
```

### Backend (Render, Railway, or Cloud Run)
```bash
cd backend
npm run build
# Deploy the dist/ folder
```

## License

Private - KABOSS Inc
