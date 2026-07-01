import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import { initDatabase, stopDatabase } from './config/database.js';
import { signToken } from './config/auth.js';
import { verifyTokenMiddleware } from './middleware/auth.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import bookingsRouter from './routes/bookings.js';
import messagesRouter from './routes/messages.js';
import contactsRouter from './routes/contacts.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/', apiLimiter);

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

app.use('/api/bookings', bookingsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/admin', adminRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('SIGINT', async () => { await stopDatabase(); process.exit(0); });
process.on('SIGTERM', async () => { await stopDatabase(); process.exit(0); });

async function start() {
  await initDatabase();

  const { default: seed } = await import('./seed.js');
  await seed();

  app.listen(PORT, () => {
    console.log(`KABOSS Inc API server running on port ${PORT}`);
  });
}

start();
