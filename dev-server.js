/**
 * THE WAY (দ্য ওয়ে) — Local Development Server
 * Zero-dependency Node.js server that serves static frontend files & executes /api serverless functions.
 * Run with: node dev-server.js (or npm start)
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

// Load environment variables from .env or .env.local if present
function loadEnv() {
  ['.env', '.env.local'].forEach(file => {
    const p = path.join(__dirname, file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = val;
          }
        }
      });
    }
  });

  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = 'theway_dev_session_secret_12345';
  }
}
loadEnv();

const PORT = process.env.PORT || 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = reqUrl.pathname || '/';

  // Global anti-cache headers for dynamic & local dev
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // ── Handle /sitemap.xml ───────────────────────────────────────────
  if (pathname === '/sitemap.xml') {
    const sitemapApi = path.join(__dirname, 'api', 'sitemap.js');
    if (fs.existsSync(sitemapApi)) {
      try {
        const handler = require(sitemapApi);
        req.query = Object.fromEntries(reqUrl.searchParams.entries());
        res.status = function(c) { this.statusCode = c; return this; };
        res.send = function(d) { this.end(d); return this; };
        return await handler(req, res);
      } catch(e) {}
    }
  }

  // ── Handle /api/* serverless routes ────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const apiName = pathname.replace(/^\/api\//, '').split('/')[0].replace(/\.js$/, '');
    const apiFile = path.join(__dirname, 'api', `${apiName}.js`);

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

    if (fs.existsSync(apiFile)) {
      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const rawBuffer = Buffer.concat(chunks);
        const rawBody = rawBuffer.toString('utf8');

        let parsedBody = null;
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/json') && rawBody.trim()) {
          try { parsedBody = JSON.parse(rawBody); } catch(e) {}
        } else if (rawBody) {
          parsedBody = rawBody;
        }

        req.query = Object.fromEntries(reqUrl.searchParams.entries());
        req.body = parsedBody;
        req.rawBody = rawBuffer;

        res.status = function(code) {
          this.statusCode = code;
          return this;
        };
        res.json = function(data) {
          this.setHeader('Content-Type', 'application/json');
          this.end(JSON.stringify(data));
          return this;
        };

        Object.keys(require.cache).forEach(k => {
          if (k.includes(path.join(__dirname, 'api'))) {
            delete require.cache[k];
          }
        });
        const handler = require(apiFile);

        return await handler(req, res);
      } catch (err) {
        console.error('[API Error]', pathname, err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      }
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: `API route /api/${apiName} not found` }));
    }
  }

  // ── Pretty URL rewrites ───────────────────────────────────────────
  if (pathname.startsWith('/article/')) {
    const slug = pathname.replace(/^\/article\//, '').replace(/\/$/, '');
    reqUrl.searchParams.set('slug', slug);
    pathname = '/article.html';
  } else if (pathname.startsWith('/section/')) {
    const sec = pathname.replace(/^\/section\//, '').replace(/\/$/, '');
    reqUrl.searchParams.set('sec', sec);
    pathname = '/section.html';
  } else if (pathname === '/events' || pathname === '/events/') {
    pathname = '/events.html';
  } else if (pathname === '/admin' || pathname === '/admin/') {
    pathname = '/admin.html';
  } else if (pathname === '/login' || pathname === '/login/') {
    pathname = '/admin-login.html';
  } else if (pathname === '/books' || pathname === '/books/') {
    pathname = '/books.html';
  } else if (pathname === '/') {
    pathname = '/index.html';
  }

  // ── Static Files ──────────────────────────────────────────────────
  const filePath = path.join(__dirname, pathname);

  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end('<h1>404 — পৃষ্ঠা পাওয়া যায়নি</h1><p><a href="/">হোমপেজে ফিরে যান</a></p>');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Anti-cache headers for HTML, JS, CSS in dev mode
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    } else if (ext === '.css' || ext === '.js') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate, max-age=0');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`  ★ THE WAY (দ্য ওয়ে) — Local Development Server`);
  console.log(`  ★ Portal URL:    http://localhost:${PORT}`);
  console.log(`  ★ Admin HQ:      http://localhost:${PORT}/admin.html`);
  console.log(`  ★ Book Library:  http://localhost:${PORT}/books.html`);
  console.log(`  ★ Articles API:  http://localhost:${PORT}/api/articles?action=list`);
  console.log('════════════════════════════════════════════════════════════════');
});
