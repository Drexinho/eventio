const { createServer } = require('http');
const { createServer: createHttpsServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const httpPort = parseInt(process.env.HTTP_PORT || '2095', 10);
const httpsPort = parseInt(process.env.HTTPS_PORT || '2096', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port: httpPort });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // HTTP Server (Port 2095)
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // HTTPS Server (Port 2096) - Self-signed certificate for development
  let httpsServer = null;
  
  try {
    // Try to create HTTPS server with self-signed certificate
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
      cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.crt'))
    };
    
    httpsServer = createHttpsServer(httpsOptions, async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });
  } catch (err) {
    console.log('HTTPS server not started - certificates not found or invalid');
    console.log('Only HTTP server will be available on port', httpPort);
  }

  // Start HTTP server
  httpServer.listen(httpPort, (err) => {
    if (err) throw err;
    console.log(`> HTTP Server ready on http://${hostname}:${httpPort}`);
  });

  // Start HTTPS server if certificates are available
  if (httpsServer) {
    httpsServer.listen(httpsPort, (err) => {
      if (err) throw err;
      console.log(`> HTTPS Server ready on https://${hostname}:${httpsPort}`);
    });
  }
});
