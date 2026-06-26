// ════════════════════════════════════════════════════════════════════════════
// BOUKHMISS FRERES — Local Server
// Run:  node server.js
// Then open:  http://localhost:3000
// clients.json stays in this folder — never sent to the browser
// ════════════════════════════════════════════════════════════════════════════

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT        = 3000;
const DB_FILE     = path.join(__dirname, 'clients.json');
const INDEX_FILE  = path.join(__dirname, 'index.html');

// ── Ensure clients.json exists ───────────────────────────────────────────────
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ clients: [] }, null, 2), 'utf8');
  console.log('Created clients.json');
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.clients) ? parsed.clients : [];
  } catch(e) { return []; }
}

function writeDB(clients) {
  const data = {
    app: 'BOUKHMISS FRERES SARL AU',
    description: 'Base de données clients privée — ne pas partager',
    last_updated: new Date().toISOString(),
    total_clients: clients.length,
    clients: clients
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function send(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:' + PORT,
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(obj));
}

function bodyJSON(req, cb) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try { cb(null, JSON.parse(body)); }
    catch(e) { cb(new Error('Invalid JSON')); }
  });
}

// ── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  // Serve index.html
  if (req.method === 'GET' && req.url === '/') {
    const html = fs.readFileSync(INDEX_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  // ── API: check if account exists ──────────────────────────────────────────
  // POST /api/check   { id }
  if (req.method === 'POST' && req.url === '/api/check') {
    return bodyJSON(req, (err, body) => {
      if (err) return send(res, 400, { error: 'Invalid request' });
      const clients = readDB();
      const exists  = clients.some(u => u.id === body.id);
      send(res, 200, { exists });
    });
  }

  // ── API: login ────────────────────────────────────────────────────────────
  // POST /api/login   { id, pw }
  if (req.method === 'POST' && req.url === '/api/login') {
    return bodyJSON(req, (err, body) => {
      if (err) return send(res, 400, { error: 'Invalid request' });
      const clients = readDB();
      const user    = clients.find(u => u.id === body.id && u.pw === body.pw);
      if (user) {
        // Return user info but NEVER return the full clients list
        send(res, 200, { ok: true, name: user.name, service: user.service, date: user.date });
      } else {
        const idExists = clients.some(u => u.id === body.id);
        send(res, 200, { ok: false, reason: idExists ? 'wrong_password' : 'not_found' });
      }
    });
  }

  // ── API: register ─────────────────────────────────────────────────────────
  // POST /api/register   { name, id, pw, service }
  if (req.method === 'POST' && req.url === '/api/register') {
    return bodyJSON(req, (err, body) => {
      if (err) return send(res, 400, { error: 'Invalid request' });
      if (!body.name || !body.id || !body.pw) return send(res, 400, { error: 'Missing fields' });
      const clients = readDB();
      if (clients.some(u => u.id === body.id)) {
        return send(res, 200, { ok: false, reason: 'already_exists' });
      }
      const newUser = {
        name:    body.name.trim(),
        id:      body.id.trim(),
        pw:      body.pw,
        service: (body.service || '').trim() || 'Non précisé',
        date:    new Date().toLocaleDateString('fr-MA'),
        registered_at: new Date().toISOString()
      };
      clients.push(newUser);
      writeDB(clients);   // ← writes directly into clients.json in your folder
      console.log('[NEW CLIENT] ' + newUser.name + ' (' + newUser.id + ') — ' + newUser.date);
      send(res, 200, { ok: true, name: newUser.name, service: newUser.service, date: newUser.date });
    });
  }

  // 404
  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   BOUKHMISS FRERES — Serveur local       ║');
  console.log('  ║   http://localhost:' + PORT + '                   ║');
  console.log('  ║   clients.json : privé dans ce dossier   ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
