const http = require('http');
const https = require('https');
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

  // Gunpack Order API -> Discord Webhook
  if (reqUrl.pathname === '/api/order-gunpack' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const orderData = JSON.parse(body || '{}');
        const webhookUrl = 'https://discord.com/api/webhooks/1573431911143973046/9KKMZgEM6qfliqETq-twbP013cxHoGZmYqatEuef26PXwiVZji01D9n_z7RDWwHXi_HI';
        
        const discordUser = (orderData.discord || '').trim();
        const paymentMethod = (orderData.paymentMethod || '').trim() || 'Банківська карта';
        const comment = (orderData.comment || '').trim() || 'Не вказано';
        const price = orderData.price || '199';
        const product = orderData.product || 'Pink Cute Gunpack';

        const discordPayload = JSON.stringify({
          username: 'Inquisitors Famq Store',
          avatar_url: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png',
          embeds: [{
            title: `🛒 НОВЕ ЗАМОВЛЕННЯ: ${product} (${price} ₴)`,
            description: `Користувач оформив замовлення на платний ганпак через офіційний сайт **Inquisitors Famq**!`,
            color: 15474345, // #EC48A9 Pink
            fields: [
              { name: '👤 Discord замовника', value: discordUser.startsWith('@') ? discordUser : '@' + discordUser, inline: true },
              { name: '💳 Спосіб оплати', value: paymentMethod, inline: true },
              { name: '💰 Сума до сплати', value: `${price} ₴ (ГРН)`, inline: true },
              { name: '📦 Товар', value: `${product} (420 МБ, кастомні моделі + звуки)`, inline: false },
              { name: '💬 Коментар / Контакт', value: comment, inline: false },
              { name: '🕒 Час замовлення', value: new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' }), inline: true },
              { name: '🌐 Джерело', value: 'Розділ Моди (index.html)', inline: true }
            ],
            footer: { text: `Inquisitors Famq • Gunpack Store Bot • ${price} UAH` },
            timestamp: new Date().toISOString()
          }]
        });

        const discordReq = https.request(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(discordPayload)
          }
        }, (dRes) => {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ success: true, status: dRes.statusCode }));
        });

        discordReq.on('error', (err) => {
          console.error('Discord Webhook Error:', err);
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ success: false, error: err.message }));
        });

        discordReq.write(discordPayload);
        discordReq.end();
      } catch (e) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: false, error: 'Invalid payload' }));
      }
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
