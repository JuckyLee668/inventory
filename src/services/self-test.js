const fs = require('fs');
const path = require('path');
const { getInventory, addInbound, addOutbound, getWarnings } = require('./inventory-service');
const { scanBarcodeByPhoto, transcribeVoice } = require('./recognition-service');

const DB_PATH = path.join(__dirname, '..', 'data', 'mock-db.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run() {
  const originalDb = fs.readFileSync(DB_PATH, 'utf8');

  try {
    const inventory = getInventory();
    assert(Array.isArray(inventory), '库存读取失败');

    const barcode = scanBarcodeByPhoto({ imageTag: '6901234567892' });
    assert(barcode.success === true, '条码识别失败');

    const voice = transcribeVoice({ text: '纯牛奶 2026-01-01 保质期 30 天' });
    assert(voice.success === true, '语音识别失败');

    const before = getInventory().find((p) => p.sku === 'SKU-1001').stock;
    addInbound({ sku: 'SKU-1001', quantity: 1, type: '采购入库', operatorRole: 'admin' });
    addOutbound({ sku: 'SKU-1001', quantity: 1, type: '销售出库', operatorRole: 'admin' });
    const after = getInventory().find((p) => p.sku === 'SKU-1001').stock;
    assert(before === after, '出入库平衡校验失败');

    const warnings = getWarnings(500);
    assert(warnings.length >= 1, '预警校验失败');

    console.log('Self-test passed');
  } finally {
    fs.writeFileSync(DB_PATH, originalDb, 'utf8');
  }
}

run();
