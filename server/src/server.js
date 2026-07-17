import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';

import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';

import { validateRequestBody } from './middleware/validateRequestBody.js';
import adminEducationCenterRoutes from './routes/adminEducationCenterRoutes.js';
import databaseRoutes from './routes/databaseRoutes.js';
import educationCenterRoutes from './routes/educationCenterRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import studentloginRouter from './routes/studentloginRouter.js';
import productRoutes from './routes/productRoutes.js';
import counsellingRoutes from './routes/counsellingRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import supportTicketRoutes from './routes/supportTicketRoutes.js';
import { ensureAccountCollections } from './utils/accountCollections.js';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGO_URI;
const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '10mb';
const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || 'uploads');

async function configureMongoDns() {
  if (!mongoUri?.startsWith('mongodb+srv://')) {
    return;
  }

  const clusterHost = new URL(mongoUri).hostname;

  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${clusterHost}`);
  } catch (error) {
    if (error.code !== 'ECONNREFUSED') {
      throw error;
    }

    const fallbackServers = (process.env.MONGO_DNS_SERVERS || '8.8.8.8,1.1.1.1')
      .split(',')
      .map((server) => server.trim())
      .filter(Boolean);

    dns.setServers(fallbackServers);
    await dns.promises.resolveSrv(`_mongodb._tcp.${clusterHost}`);

    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'mongodb_dns_fallback',
        message: 'System DNS refused the MongoDB SRV query; using fallback DNS servers.'
      })
    );
  }
}

function splitOrigins(value = '') {
  return value
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function createAllowedOrigins() {
  return new Set(
    [process.env.CLIENT_URL, process.env.SELLER_URL, process.env.ADMIN_URL]
      .filter(Boolean)
      .flatMap(splitOrigins)
  );
}

function validateEnvironment() {
  const requiredVariables = ['MONGO_URI', 'JWT_SECRET'];

  if (isProduction) {
    requiredVariables.push('CLIENT_URL', 'SELLER_URL', 'ADMIN_URL');
  }

  const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

  if (missingVariables.length) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }

  if (!/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
    throw new Error('MONGO_URI must be a valid MongoDB connection string.');
  }

  if (isProduction && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production.');
  }

  for (const name of ['CLIENT_URL', 'SELLER_URL', 'ADMIN_URL']) {
    for (const origin of splitOrigins(process.env[name])) {
      const parsedOrigin = new URL(origin);

      if (parsedOrigin.origin !== origin) {
        throw new Error(`${name} must contain origins only, without a path.`);
      }

      if (isProduction && parsedOrigin.protocol !== 'https:') {
        throw new Error(`${name} must use HTTPS in production.`);
      }
    }
  }
}

const allowedOrigins = createAllowedOrigins();

function corsOrigin(origin, callback) {
  if (!origin) {
    return callback(null, true);
  }

  const normalizedOrigin = origin.replace(/\/$/, '');

  if (!isProduction || allowedOrigins.has(normalizedOrigin)) {
    return callback(null, true);
  }

  const corsError = new Error('Origin is not allowed by CORS.');
  corsError.status = 403;
  return callback(corsError);
}

const corsOptions = {
  origin: corsOrigin,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
  maxAge: 86400
};

const apiRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});

const authRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many account attempts. Please try again later.'
  }
});

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(compression());

app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    if (!isProduction) {
      return;
    }

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    console.log(
      JSON.stringify({
        level: 'info',
        event: 'http_request',
        method: req.method,
        path: req.originalUrl.split('?')[0],
        status: res.statusCode,
        durationMs: Number(durationMs.toFixed(1)),
        ip: req.ip
      })
    );
  });

  next();
});

app.use(express.json({ limit: jsonBodyLimit }));
app.use(express.urlencoded({ limit: jsonBodyLimit, extended: true }));
app.use(validateRequestBody);

fs.mkdirSync(uploadDirectory, { recursive: true });
app.use(
  '/uploads',
  express.static(uploadDirectory, {
    dotfiles: 'deny',
    etag: true,
    fallthrough: true,
    maxAge: isProduction ? '1d' : 0
  })
);
app.use('/uploads', (_req, res) => {
  res.status(404).json({ success: false, message: 'Upload not found.' });
});

app.get('/api/health', (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    ok: databaseConnected,
    service: 'what-next-server',
    database: databaseConnected ? 'connected' : 'disconnected',
    uptimeSeconds: Math.floor(process.uptime())
  });
});

app.use('/api', apiRateLimiter);
app.use(
  [
    '/api/partners/login',
    '/api/partners/register',
    '/api/user/login',
    '/api/user/signup',
    '/api/education-center/login',
    '/api/education-center/register'
  ],
  authRateLimiter
);

app.use('/api/partners', partnerRoutes);
app.use('/api/user', studentloginRouter);
app.use('/api/education', educationRoutes);
app.use('/api/education-center', educationCenterRoutes);
app.use('/api/admin', adminEducationCenterRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api', productRoutes);
app.use('/api', counsellingRoutes);
app.use('/api', orderRoutes);

if (!isProduction) {
  app.use('/api/database', databaseRoutes);
}

app.use('/api', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.'
  });
});

app.use((error, _req, res, _next) => {
  const status =
    error.type === 'entity.too.large'
      ? 413
      : error instanceof SyntaxError && error.status === 400
        ? 400
        : Number(error.status) || 500;
  const exposeMessage = status < 500 || !isProduction;

  console.error(
    JSON.stringify({
      level: 'error',
      event: 'request_error',
      status,
      message: error.message,
      ...(isProduction ? {} : { stack: error.stack })
    })
  );

  res.status(status).json({
    success: false,
    message: exposeMessage ? error.message : 'Internal server error.'
  });
});

let server;
let isShuttingDown = false;

async function startServer() {
  try {
    validateEnvironment();
    await configureMongoDns();

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000
    });

    const createdCollections = await ensureAccountCollections();

    console.log(
      JSON.stringify({
        level: 'info',
        event: 'database_connected',
        database: mongoose.connection.name,
        createdCollections
      })
    );

    server = app.listen(port, '0.0.0.0', () => {
      console.log(
        JSON.stringify({
          level: 'info',
          event: 'server_started',
          port,
          environment: process.env.NODE_ENV || 'development'
        })
      );
    });

    server.keepAliveTimeout = 65_000;
    server.headersTimeout = 66_000;
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'startup_failed',
        message: error.message
      })
    );
    process.exit(1);
  }
}

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(JSON.stringify({ level: 'info', event: 'shutdown_started', signal }));

  const forcedShutdown = setTimeout(() => {
    console.error(JSON.stringify({ level: 'error', event: 'shutdown_timeout' }));
    process.exit(1);
  }, 10_000);
  forcedShutdown.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }

    await mongoose.disconnect();
    clearTimeout(forcedShutdown);
    process.exit(0);
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', event: 'shutdown_failed', message: error.message }));
    process.exit(1);
  }
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    void shutdown(signal);
  });
});

process.on('unhandledRejection', (error) => {
  console.error(
    JSON.stringify({
      level: 'error',
      event: 'unhandled_rejection',
      message: error instanceof Error ? error.message : String(error)
    })
  );
  void shutdown('unhandledRejection');
});

startServer();
