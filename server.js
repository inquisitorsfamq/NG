const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Set of active SSE client connections (real-time live visitors)
const activeClients = new Set();

function broadcastCount() {
  const data = JSON.stringify({ count: activeClients.size });
  const message = `data: ${data}\n\n`;
  for (const client of activeClients) {
    try {
      client.write(message);
    } catch (e) {
      activeClients.delete(client);
    }
  }
}

// Periodic keep-alive ping for SSE connections
setInterval(() => {
  for (const client of activeClients) {
    try {
      client.write(': ping\n\n');
    } catch (e) {
      activeClients.delete(client);
    }
  }
}, 15000);

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  // Real-time Live Visitors SSE endpoint
  if (reqUrl.pathname === '/api/online') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    activeClients.add(res);
    broadcastCount();

    req.on('close', () => {
      activeClients.delete(res);
      broadcastCount();
    });
    return;
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, reqUrl.pathname === '/' ? 'index.html' : reqUrl.pathname);

  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Не знайдено');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`⚔️  INQUISITORS FAMQ 2.0 - СЕРВЕР ЗАПУЩЕНО!`);
  console.log(`🌐 Адреса: http://localhost:${PORT}`);
  console.log(`📊 Реальний лічильник онлайну активний (/api/online)`);
  console.log(`==================================================\n`);
});
