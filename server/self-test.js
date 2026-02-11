const http = require('http');
const { createServer } = require('./app-server');

function request({ port, method, path, data }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        method,
        path,
        headers: data ? { 'Content-Type': 'application/json' } : {}
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    const health = await request({ port, method: 'GET', path: '/health' });
    if (health.status !== 200 || !health.body.ok) throw new Error('health check failed');

    const list = await request({ port, method: 'GET', path: '/api/inventory' });
    if (!Array.isArray(list.body.data)) throw new Error('inventory api failed');

    const barcode = await request({
      port,
      method: 'POST',
      path: '/api/recognition/barcode',
      data: { imageTag: '6901234567892' }
    });
    if (!barcode.body.data.success) throw new Error('barcode api failed');

    console.log('Server self-test passed');
  } finally {
    server.close();
  }
}

run();
