import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

const port = Number(process.env.PORT || 8787);
// Frontend files live in the project root, one level above /backend.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mimeTypes = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.gif':'image/gif', '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2' };
function serveStatic(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  let decoded; try { decoded = decodeURIComponent(pathname); } catch { return false; }
  if (decoded === '/') decoded = '/index.html';
  const filePath = path.resolve(projectRoot, '.' + decoded);
  if (filePath !== projectRoot && !filePath.startsWith(projectRoot + path.sep)) return false;
  let stat; try { stat = fs.statSync(filePath); } catch { return false; }
  if (!stat.isFile()) return false;
  const type = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'X-Content-Type-Options':'nosniff', 'Cache-Control': path.extname(filePath).toLowerCase() === '.html' ? 'no-cache' : 'public, max-age=300' });
  if (req.method === 'HEAD') { res.end(); return true; }
  fs.createReadStream(filePath).pipe(res);
  return true;
}
const token = process.env.SHOPMAX99_API_TOKEN || '';
const dbPath = path.resolve(process.env.DATABASE_PATH || './data/shopmax99.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec('CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)');

const getRecord = db.prepare('SELECT id, kind, payload, created_at AS createdAt, updated_at AS updatedAt FROM records WHERE id = ?');
const listRecords = db.prepare('SELECT id, kind, payload, created_at AS createdAt, updated_at AS updatedAt FROM records WHERE kind = ? ORDER BY updated_at DESC LIMIT ?');
const insertRecord = db.prepare('INSERT INTO records (id, kind, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
const updateRecord = db.prepare('UPDATE records SET kind = ?, payload = ?, updated_at = ? WHERE id = ?');
const deleteRecord = db.prepare('DELETE FROM records WHERE id = ?');

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > 1024 * 1024) {
        reject(new Error('Request body exceeds 1 MB'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Request body must be valid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return send(res, 200, { ok: true, service: 'shopmax99-backend', database: 'connected' });
  }
  // Local-development bridge for the browser's existing localStorage data.
  // This is intentionally available only on the loopback server (127.0.0.1).
  if (url.pathname === '/api/local-store') {
    const allowed = new Set([
      'shopmax99_cart','shopmax99_wishlist','shopmax99_user','shopmax99_orders',
      'shopmax99_sellers','shopmax99_products','shopmax99_transactions',
      'shopmax99_customer_account','shopmax99_customer_session','shopmax99_users',
      'shopmax99_settings','shopmax99_promocodes','shopmax99_applied_promo',
      'shopmax99_buy_now','shopmax99_admin_session'
    ]);
    const origin = String(req.headers.origin || '');
    const ownOrigin = `http://127.0.0.1:${port}`;
    if (origin && origin !== ownOrigin && origin !== `http://localhost:${port}`) {
      return send(res, 403, { error: 'Origin not allowed' });
    }
    if (req.method === 'GET') {
      const rows = db.prepare('SELECT id, payload FROM records WHERE kind = ?').all('browser_store');
      const values = {};
      for (const row of rows) {
        if (allowed.has(row.id)) { try { values[row.id] = JSON.parse(row.payload); } catch {} }
      }
      return send(res, 200, { values });
    }
    if (req.method === 'PUT') {
      try {
        const body = await readBody(req);
        const key = String(body.key || '');
        if (!allowed.has(key)) return send(res, 400, { error: 'Storage key not allowed' });
        if (!Object.prototype.hasOwnProperty.call(body, 'value')) return send(res, 400, { error: 'value is required' });
        const now = new Date().toISOString();
        const payload = JSON.stringify(body.value);
        const exists = getRecord.get(key);
        if (exists) updateRecord.run('browser_store', payload, now, key);
        else insertRecord.run(key, 'browser_store', payload, now, now);
        return send(res, 200, { ok: true, key });
      } catch (error) {
        const status = /JSON|body/i.test(error.message) ? 400 : 500;
        return send(res, status, { error: status === 400 ? error.message : 'Could not save local store data' });
      }
    }
    if (req.method === 'DELETE') {
      const key = String(url.searchParams.get('key') || '');
      if (!allowed.has(key)) return send(res, 400, { error: 'Storage key not allowed' });
      deleteRecord.run(key);
      return send(res, 200, { ok: true, key });
    }
    res.setHeader('Allow', 'GET, PUT, DELETE');
    return send(res, 405, { error: 'Method not allowed' });
  }
  // Serve ShopMax99 frontend/assets from the same local origin. API routes stay protected below.
  if (!url.pathname.startsWith('/api/')) {
    if (serveStatic(req, res, url.pathname)) return;
    return send(res, 404, { error: 'File not found' });
  }
  if (!token || !safeEqual(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''), token)) {
    return send(res, 401, { error: 'Unauthorized' });
  }
  try {
    if (req.method === 'GET' && url.pathname === '/api/records') {
      const kind = String(url.searchParams.get('kind') || '').trim();
      const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || 100)));
      if (!kind) return send(res, 400, { error: 'kind is required' });
      const records = listRecords.all(kind, limit).map(row => ({ ...row, payload: JSON.parse(row.payload) }));
      return send(res, 200, { records });
    }
    if (req.method === 'GET' && url.pathname.startsWith('/api/records/')) {
      const id = decodeURIComponent(url.pathname.slice('/api/records/'.length));
      const row = getRecord.get(id);
      if (!row) return send(res, 404, { error: 'Record not found' });
      return send(res, 200, { record: { ...row, payload: JSON.parse(row.payload) } });
    }
    if (req.method === 'POST' && url.pathname === '/api/records') {
      const body = await readBody(req);
      const kind = String(body.kind || '').trim();
      if (!/^[a-z][a-z0-9_-]{1,39}$/i.test(kind)) return send(res, 400, { error: 'Invalid kind' });
      if (body.payload === undefined) return send(res, 400, { error: 'payload is required' });
      const now = new Date().toISOString();
      const id = String(body.id || crypto.randomUUID()).trim();
      if (id.length > 120) return send(res, 400, { error: 'Invalid id' });
      try {
        insertRecord.run(id, kind, JSON.stringify(body.payload), now, now);
      } catch {
        return send(res, 409, { error: 'Record id already exists' });
      }
      return send(res, 201, { record: getRecord.get(id) });
    }
    if (req.method === 'PUT' && url.pathname.startsWith('/api/records/')) {
      const id = decodeURIComponent(url.pathname.slice('/api/records/'.length));
      const body = await readBody(req);
      const kind = String(body.kind || '').trim();
      if (!getRecord.get(id)) return send(res, 404, { error: 'Record not found' });
      if (!/^[a-z][a-z0-9_-]{1,39}$/i.test(kind) || body.payload === undefined) return send(res, 400, { error: 'Valid kind and payload are required' });
      updateRecord.run(kind, JSON.stringify(body.payload), new Date().toISOString(), id);
      const row = getRecord.get(id);
      return send(res, 200, { record: { ...row, payload: JSON.parse(row.payload) } });
    }
    if (req.method === 'DELETE' && url.pathname.startsWith('/api/records/')) {
      const id = decodeURIComponent(url.pathname.slice('/api/records/'.length));
      const result = deleteRecord.run(id);
      if (!result.changes) return send(res, 404, { error: 'Record not found' });
      return send(res, 200, { ok: true, id });
    }
    return send(res, 404, { error: 'Route not found' });
  } catch (error) {
    const status = /JSON|body/i.test(error.message) ? 400 : 500;
    return send(res, status, { error: status === 400 ? error.message : 'Internal server error' });
  }
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`ShopMax99 backend listening on http://127.0.0.1:${port}\n`);
});
