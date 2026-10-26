const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8000;
const DATA_FILE = path.join(__dirname, 'data.json');

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
  soilSamples: []
};

// Ensure data.json exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SERVER_DATA, null, 2), 'utf-8');
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
    fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read server data' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
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
        fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, timestamp: new Date().toISOString() }));
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
  console.log(` Local URL : ${url}`);
  console.log(`=======================================================`);
  
  if (!process.env.PORT && !process.env.RENDER) {
    const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${startCmd} ${url}`, () => {});
  }
});
