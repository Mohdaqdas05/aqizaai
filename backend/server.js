require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

require('./config/passport');

const { generalLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const modelRoutes = require('./routes/modelRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// passport.initialize() must be global so strategy callbacks work
app.use(passport.initialize());

// General rate limiter
app.use('/api/', generalLimiter);

// Auth routes — session, cookieParser, and passport session scoped here
// (sessions are only needed for the Google OAuth redirect flow)
const oauthSessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'fallback-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    httpOnly: true,
    maxAge: 10 * 60 * 1000, // 10 minutes — only used for OAuth flow
  },
});
app.use('/api/auth', cookieParser(), oauthSessionMiddleware, passport.session(), authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/models', modelRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  // Force exit after 10 s
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
