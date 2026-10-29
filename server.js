const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Pool } = require('pg');

const PORT = process.env.PORT || 8000;
const DATA_FILE = path.join(__dirname, 'data.json');
const DATABASE_URL = process.env.DATABASE_URL;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const DEFAULT_SERVER_DATA = {
  villages: [
    "Harohalli", "Bidadi", "Nelamangala", "Kunigal", "Magadi",
    "Channapatna", "Ramanagara", "Maddur", "Mandya", "Malavalli",
    "Kanakapura", "Tavarekere", "Devanahalli", "Doddaballapura", "Hosakote",
    "Anekal", "Kengeri", "Jigani", "Attibele", "Sarjapura",
    "Vijayapura", "Solur", "Kudur", "Maralawadi", "Kailancha",
    "Uyyamballi", "Satanur", "Kasaba", "Halagur", "Koppa",
    "Bellur", "Nagamangala", "Pandavapura", "Srirangapatna", "Krishnarajpet",
    "Gubbi", "Tumkur", "Sira", "Tiptur", "Turuvekere"
  ],
  shops: [
    { id: "SHP-101", shopName: "Harohalli Village Soil Partner Centre", shopkeeper: "Manjunath Gowda", phone: "9845011223", category: "Village Soil Partner", village: "Harohalli", address: "Main Road, Harohalli Bus Stand", samplesCollected: 0 },
    { id: "SHP-102", shopName: "Bidadi Retail Soil Partner", shopkeeper: "Suresh Reddy", phone: "9845022334", category: "Retail Soil Partner", village: "Bidadi", address: "Station Road, Bidadi Circle", samplesCollected: 0 },
    { id: "SHP-103", shopName: "Ramanagara Central Soil Collection Hub", shopkeeper: "Kiran Kumar", phone: "9845033445", category: "All Registered Soil Collection Partners", village: "Ramanagara", address: "APMC Yard, Ramanagara", samplesCollected: 0 }
  ],
  testingCentres: [
    { id: "TC-CENTRAL", name: "Arkashine Central Diagnostic Lab", type: "Arkashine Central Lab", machineSerial: "ARK-CENTRAL-LAB-01", operatorName: "Dr. Vignesh Shastry (Chief Analyst)", operatorPhone: "9880011223", location: "Bengaluru Central Diagnostic Hub", dateDeployed: "2026-01-10", status: "Active", totalTestsCount: 0 },
    { id: "TC-MACH-101", name: "Field Unit 1 - Ramanagara Machine Station", type: "Deployed Machine", machineSerial: "ARK-PORT-SCANNER-M04", operatorName: "Anand Murthy (Field Chemist)", operatorPhone: "9880022334", location: "APMC Complex, Ramanagara", dateDeployed: "2026-03-15", status: "Active", totalTestsCount: 0 },
    { id: "TC-MACH-102", name: "Field Unit 2 - Mandya Mobile Testing Centre", type: "Deployed Machine", machineSerial: "ARK-PORT-SCANNER-M09", operatorName: "Pooja Hegde (Testing Executive)", operatorPhone: "9880033445", location: "Near Sugar Factory Circle, Mandya", dateDeployed: "2026-05-20", status: "Active", totalTestsCount: 0 }
  ],
  farmers: [],
  soilSamples: [],
  users: [
    {
      id: "USR-ADMIN",
      fullName: "Operations Admin",
      username: "admin",
      phone: "9845011223",
      role: "Operations Manager",
      password: "password123",
      createdAt: "2026-10-29"
    }
  ]
};

// Ensure data.json exists locally as disk backup
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SERVER_DATA, null, 2), 'utf-8');
}

// ─── NEON DATABASE SETUP ────────────────────────────────────────────────
let dbPool = null;

if (DATABASE_URL) {
  try {
    dbPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    dbPool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `).then(() => {
      console.log('✅ Connected to Neon Database! Permanent storage active.');
      return dbPool.query("SELECT id FROM app_state WHERE id = 'arkashine_central'");
    }).then(res => {
      if (res && res.rows.length === 0) {
        let initData = DEFAULT_SERVER_DATA;
        if (fs.existsSync(DATA_FILE)) {
          try { initData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e) {}
        }
        return dbPool.query(
          "INSERT INTO app_state (id, data, updated_at) VALUES ('arkashine_central', $1, CURRENT_TIMESTAMP)",
          [initData]
        );
      }
    }).catch(err => {
      console.error('⚠️ Neon Database init error:', err.message);
    });
  } catch (e) {
    console.error('⚠️ Failed to initialize Neon Pool:', e.message);
  }
} else {
  console.log('ℹ️ Running without DATABASE_URL: using local data.json fallback.');
}

function serveFromDisk(res) {
  fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read server data' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Global CORS & No-Cache Headers (Ensures all devices always get latest data)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = req.url.split('?')[0];

  // ─── API: GET /api/data (Central Database Read) ──────────────────────
  if (req.method === 'GET' && parsedUrl === '/api/data') {
    if (dbPool) {
      dbPool.query("SELECT data FROM app_state WHERE id = 'arkashine_central'")
        .then(result => {
          if (result.rows.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows[0].data));
          } else {
            serveFromDisk(res);
          }
        })
        .catch(err => {
          console.error("Neon read error, falling back to disk:", err.message);
          serveFromDisk(res);
        });
      return;
    }

    serveFromDisk(res);
    return;
  }

  // ─── API: POST /api/data (Central Database Write) ─────────────────────
  if (req.method === 'POST' && parsedUrl === '/api/data') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e7) req.connection.destroy(); // 20MB limit
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);

        // Save local backup file
        try { fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8'); } catch(e) {}

        if (dbPool) {
          dbPool.query(`
            INSERT INTO app_state (id, data, updated_at)
            VALUES ('arkashine_central', $1, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP;
          `, [parsed])
          .then(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, storage: 'neon_postgres', timestamp: new Date().toISOString() }));
          })
          .catch(err => {
            console.error("Neon write error:", err.message);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, storage: 'disk_fallback', timestamp: new Date().toISOString() }));
          });
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, storage: 'disk', timestamp: new Date().toISOString() }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // ─── STATIC FILE SERVING ──────────────────────────────────────────────
  let reqPath = parsedUrl === '/' ? '/index.html' : parsedUrl;
  let filePath = path.join(__dirname, reqPath);
  let ext = path.extname(filePath).toLowerCase();
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`=======================================================`);
  console.log(` Arkashine Soil Collection Centre Tracking Dashboard`);
  console.log(` Server running on port: ${PORT}`);
  console.log(` Shared Central API Endpoint : http://localhost:${PORT}/api/data`);
  console.log(` Neon Database: ${DATABASE_URL ? 'CONFIGURED (Cloud Persistence Active)' : 'Not configured (Local Disk Mode)'}`);
  console.log(` Local URL : ${url}`);
  console.log(`=======================================================`);
  
  if (!process.env.PORT && !process.env.RENDER) {
    const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${startCmd} ${url}`, () => {});
  }
});
