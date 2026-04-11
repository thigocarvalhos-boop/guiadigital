import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const PORT = Number(process.env.PORT || 3000);

const base64url = (input) => Buffer.from(input).toString('base64url');

const signJwt = (payload, secret, expiresInSec = 8 * 60 * 60) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSec,
    iss: 'guiadigital-api',
    aud: 'guiadigital-app'
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(body));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', secret).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
};

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const computed = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(computed, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const ensureDb = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(DB_FILE)) {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@guiadigital.local';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

    const initialData = {
      schemaVersion: 1,
      users: [
        {
          id: 'admin',
          email,
          role: 'ADMIN',
          passwordHash: hashPassword(password),
          createdAt: new Date().toISOString()
        }
      ]
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
};

const readDb = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeDb = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const runMigrations = () => {
  ensureDb();
  const db = readDb();

  if (!db.schemaVersion || db.schemaVersion < 2) {
    db.users = (db.users || []).map((user) => ({
      ...user,
      status: user.status || 'ACTIVE',
      lastLoginAt: user.lastLoginAt || null
    }));
    db.schemaVersion = 2;
  }

  writeDb(db);
  return db.schemaVersion;
};

const json = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
};

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const start = () => {
  const schemaVersion = runMigrations();

  const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
      });
      return res.end();
    }

    if (req.url === '/health' && req.method === 'GET') {
      return json(res, 200, { status: 'ok', schemaVersion, ts: new Date().toISOString() });
    }

    if (req.url === '/auth/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!email || !password) return json(res, 400, { error: 'email and password are required' });

      const db = readDb();
      const user = (db.users || []).find((u) => u.email.toLowerCase() === email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return json(res, 401, { error: 'invalid credentials' });
      }

      user.lastLoginAt = new Date().toISOString();
      writeDb(db);

      const token = signJwt({ sub: user.id, email: user.email, role: user.role, status: user.status }, JWT_SECRET);
      return json(res, 200, {
        token,
        tokenType: 'Bearer',
        expiresIn: 8 * 60 * 60,
        user: { id: user.id, email: user.email, role: user.role, status: user.status }
      });
    }

    return json(res, 404, { error: 'not found' });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[guiadigital] error: port ${PORT} is already in use`);
    } else if (err.code === 'EACCES') {
      console.error(`[guiadigital] error: permission denied to bind to port ${PORT}`);
    } else {
      console.error(`[guiadigital] error: ${err.message}`);
    }
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`[guiadigital] api running on :${PORT} (schema v${schemaVersion})`);
  });
};

if (process.argv.includes('--migrate-only')) {
  const version = runMigrations();
  console.log(`[guiadigital] migrations applied up to schema version ${version}`);
} else {
  start();
}
