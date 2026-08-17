import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
import User from './models/User.js';
import { initDatabase, stopDatabase } from './config/database.js';
import { signToken } from './config/auth.js';
import { verifyTokenMiddleware } from './middleware/auth.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import bookingsRouter from './routes/bookings.js';
import quotesRouter from './routes/quotes.js';
import messagesRouter from './routes/messages.js';
import contactsRouter from './routes/contacts.js';
import adminRouter from './routes/admin.js';
import adminUploadRouter from './routes/admin-upload.js';
import galleryRouter from './routes/gallery.js';
import notificationsRouter from './routes/notifications.js';
import downloadsRouter from './routes/downloads.js';
import adminBookingFilesRouter from './routes/admin-booking-files.js';
import adminChatRouter from './routes/admin-chat.js';
import profilePictureRouter from './routes/profile-picture.js';
import paymentsRouter from './routes/payments.js';
import { initSocket } from './socket/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

const normalizeOrigin = (origin: string | undefined) => {
  if (!origin) return origin;
  return origin.trim().replace(/\/+$/, '');
};

const FRONTEND_URLS = [
  normalizeOrigin(process.env.FRONTEND_URL) || 'http://localhost:5173',
  normalizeOrigin(process.env.ADMIN_URL) || 'http://localhost:5174',
  'https://kabossimage.vercel.app',
  'https://admin-dashboard-3zdgvmqds-httpsgithubcomhaj-250kabossinc.vercel.app',
];

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || FRONTEND_URLS.includes(origin)) return callback(null, true);
    console.warn(`[cors] Blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

let dbReady = false;
let dbError: string | null = null;

async function bootstrapDatabase(): Promise<void> {
  try {
    await initDatabase();
    dbReady = true;
    console.log('Database ready');
  } catch (error: any) {
    dbReady = false;
    dbError = String(error?.message || error);
    console.error('Database initialization failed:', dbError);
  }
}

function dbMiddleware(_req: express.Request, res: express.Response, next: express.NextFunction) {
  if (dbReady) return next();
  res.status(503).json({ error: 'Service starting up. Database not yet ready.', retry: true });
}

app.get('/health', (_req, res) => {
  res.json({ status: dbReady ? 'ok' : 'starting', database: dbReady });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: dbReady ? 'ok' : 'starting', database: dbReady, timestamp: new Date().toISOString() });
});

app.use('/api/', dbMiddleware);

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, displayName, role: 'customer' });

    const token = signToken({ userId: String(user.id), email, role: 'customer' });
    res.status(201).json({ token, user: { id: user.id, _id: String(user.id), email, displayName, role: 'customer' } });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ userId: String(user.id), email: user.email!, role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        _id: String(user.id),
        email: user.email,
displayName: user.displayName,
        role: user.role,
        phone: user.phone,
        profilePictureUrl: (user as any).profilePictureUrl,
      },
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/admin-login', authLimiter, async (req, res) => {
  try {
    // Accept either username or email for admin login
    const { username, email, password } = req.body;

    const identifier = username || email;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Admin username/email and password are required' });
    }

    const user = await User.findOne({
      where: {
        role: 'admin',
        ...(username
          ? { username }
          : { email }),
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

const token = signToken({ userId: String(user.id), email: user.email || '', role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        _id: String(user.id),
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        profilePictureUrl: (user as any).profilePictureUrl,
      },
    });
  } catch (error) {
    console.error('Admin login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Password reset failed:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

app.get('/api/auth/me', verifyTokenMiddleware, async (req: any, res) => {
  try {
    const user = await User.findByPk(req.userId, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.patch('/api/auth/me', verifyTokenMiddleware, async (req: any, res) => {
  try {
    const { displayName, phone, profilePictureUrl } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (displayName) user.displayName = displayName;
    if (phone) user.phone = phone;
    if (profilePictureUrl) (user as any).profilePictureUrl = profilePictureUrl;

    await user.save();
    const updated = user.toJSON();
    delete (updated as any).password;
    res.json(updated);
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/auth/me', verifyTokenMiddleware, async (req: any, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.use('/api/bookings', bookingsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/downloads', downloadsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin', adminUploadRouter);
app.use('/api/admin/chat', adminChatRouter);
app.use('/api/admin/bookings', adminBookingFilesRouter);
app.use('/api/profile-picture', profilePictureRouter);
app.use('/api/payments', paymentsRouter);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
console.log('[uploads] Serving static files from:', UPLOADS_DIR);
app.use('/uploads', express.static(UPLOADS_DIR));



app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

let httpServer: http.Server | null = null;

process.on('SIGINT', async () => {
  try {
    if (httpServer) await new Promise((resolve) => httpServer?.close(resolve));
  } finally {
    await stopDatabase();
    process.exit(0);
  }
});
process.on('SIGTERM', async () => {
  try {
    if (httpServer) await new Promise((resolve) => httpServer?.close(resolve));
  } finally {
    await stopDatabase();
    process.exit(0);
  }
});

async function start() {
  httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: FRONTEND_URLS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  initSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`KABOSS Inc API server running on port ${PORT}`);
  });

  bootstrapDatabase().then(async () => {
    if (!dbReady) return;

    if (process.env.NODE_ENV !== 'production') {
      const { default: seed } = await import('./seed.js');
      await seed();
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && (adminUsername || adminEmail)) {
      const existingAdmin = await User.findOne({ where: { role: 'admin' } });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await User.create({
          username: adminUsername || adminEmail?.split('@')[0] || 'admin',
          email: adminEmail || `${adminUsername}@kabossinc.com`,
          password: hashedPassword,
          displayName: process.env.ADMIN_DISPLAY_NAME || 'Admin',
          role: 'admin',
          emailVerified: true,
        });
        console.log('Created production admin user from environment variables');
      }
    }
  }).catch((err) => {
    console.error('Post-startup database bootstrap failed:', err);
  });
}

start();


