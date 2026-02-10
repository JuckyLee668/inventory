const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mock-db.json');

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function requireRole(role, allowedRoles) {
  if (!allowedRoles.includes(role)) {
    throw new Error(`权限不足：当前角色 ${role} 无法执行该操作`);
  }
}

function getInventory() {
  const db = readDb();
  return db.products;
}

function addInbound({ sku, quantity, type, operatorRole }) {
  requireRole(operatorRole, ['admin', 'operator']);
  const db = readDb();
  const product = db.products.find((p) => p.sku === sku);
  if (!product) throw new Error(`商品不存在: ${sku}`);
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('入库数量必须为正整数');

  product.stock += quantity;
  db.inbounds.push({
    id: `IN-${Date.now()}`,
    sku,
    quantity,
    type,
    createdAt: new Date().toISOString()
  });
  writeDb(db);
  return product;
}

function addOutbound({ sku, quantity, type, operatorRole }) {
  requireRole(operatorRole, ['admin', 'operator']);
  const db = readDb();
  const product = db.products.find((p) => p.sku === sku);
  if (!product) throw new Error(`商品不存在: ${sku}`);
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('出库数量必须为正整数');
  if (product.stock < quantity) throw new Error('库存不足');

  product.stock -= quantity;
  db.outbounds.push({
    id: `OUT-${Date.now()}`,
    sku,
    quantity,
    type,
    createdAt: new Date().toISOString()
  });
  writeDb(db);
  return product;
}

function getWarnings(threshold = 50) {
  const db = readDb();
  return db.products
    .filter((p) => p.stock < threshold)
    .map((p) => ({ sku: p.sku, name: p.name, stock: p.stock, level: 'low-stock' }));
}

module.exports = { getInventory, addInbound, addOutbound, getWarnings };
