const http = require('http');
const { URL } = require('url');
const { getInventory, addInbound, addOutbound, getWarnings } = require('../src/services/inventory-service');
const { scanBarcodeByPhoto, transcribeVoice } = require('../src/services/recognition-service');
const { simulatedUpload } = require('../src/services/upload-service');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('JSON 格式错误'));
      }
    });
    req.on('error', reject);
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      return sendJson(res, 200, { ok: true });
    }

    const url = new URL(req.url, 'http://127.0.0.1');

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return sendJson(res, 200, { ok: true, service: 'inventory-server' });
      }

      if (req.method === 'GET' && url.pathname === '/api/inventory') {
        return sendJson(res, 200, { success: true, data: getInventory() });
      }

      if (req.method === 'GET' && url.pathname === '/api/warnings') {
        const threshold = Number(url.searchParams.get('threshold') || 50);
        return sendJson(res, 200, { success: true, data: getWarnings(threshold) });
      }

      if (req.method === 'POST' && url.pathname === '/api/inbound') {
        const payload = await readJson(req);
        const data = addInbound(payload);
        return sendJson(res, 200, { success: true, data });
      }

      if (req.method === 'POST' && url.pathname === '/api/outbound') {
        const payload = await readJson(req);
        const data = addOutbound(payload);
        return sendJson(res, 200, { success: true, data });
      }

      if (req.method === 'POST' && url.pathname === '/api/recognition/barcode') {
        const payload = await readJson(req);
        return sendJson(res, 200, { success: true, data: scanBarcodeByPhoto(payload) });
      }

      if (req.method === 'POST' && url.pathname === '/api/recognition/voice') {
        const payload = await readJson(req);
        return sendJson(res, 200, { success: true, data: transcribeVoice(payload) });
      }

      if (req.method === 'POST' && url.pathname === '/api/sync') {
        const payload = await readJson(req);
        const result = await simulatedUpload(payload);
        return sendJson(res, 200, { success: true, data: result });
      }

      return sendJson(res, 404, { success: false, message: 'Not Found' });
    } catch (error) {
      return sendJson(res, 400, { success: false, message: error.message });
    }
  });
}

module.exports = { createServer };
