const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mock-db.json');

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`Database file not found: ${DB_PATH}`);
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to read database: ${error.message}`);
  }
}

function writeDb(db) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to write database: ${error.message}`);
  }
}

function validateSku(sku) {
  if (!sku || typeof sku !== 'string') {
    throw new Error('SKU must be a non-empty string');
  }
  if (sku.length > 50) {
    throw new Error('SKU length cannot exceed 50 characters');
  }
  if (!/^[A-Za-z0-9\-_]+$/.test(sku)) {
    throw new Error('SKU can only contain alphanumeric characters, hyphens, and underscores');
  }
}

function validateQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Quantity must be a positive integer');
  }
}

function requireRole(role, allowedRoles) {
  if (!allowedRoles.includes(role)) {
    throw new Error(`Insufficient permissions: role '${role}' cannot perform this operation`);
  }
}

function getInventory() {
  const db = readDb();
  return db.products || [];
}

function addInbound({ sku, quantity, type, operatorRole }) {
  if (!operatorRole) {
    throw new Error('operatorRole is required');
  }
  requireRole(operatorRole, ['admin', 'operator']);
  
  validateSku(sku);
  validateQuantity(quantity);
  
  const db = readDb();
  const product = db.products.find((p) => p.sku === sku);
  if (!product) {
    throw new Error(`Product not found: ${sku}`);
  }

  product.stock += quantity;
  db.inbounds.push({
    id: `IN-${Date.now()}`,
    sku,
    quantity,
    type,
    operatorRole,
    createdAt: new Date().toISOString()
  });
  writeDb(db);
  return product;
}

function addOutbound({ sku, quantity, type, operatorRole }) {
  if (!operatorRole) {
    throw new Error('operatorRole is required');
  }
  requireRole(operatorRole, ['admin', 'operator']);
  
  validateSku(sku);
  validateQuantity(quantity);
  
  const db = readDb();
  const product = db.products.find((p) => p.sku === sku);
  if (!product) {
    throw new Error(`Product not found: ${sku}`);
  }
  if (product.stock < quantity) {
    throw new Error(`Insufficient stock for ${sku}. Available: ${product.stock}, Required: ${quantity}`);
  }

  product.stock -= quantity;
  db.outbounds.push({
    id: `OUT-${Date.now()}`,
    sku,
    quantity,
    type,
    operatorRole,
    createdAt: new Date().toISOString()
  });
  writeDb(db);
  return product;
}

function getWarnings(threshold = 50) {
  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new Error('Threshold must be a non-negative integer');
  }
  const db = readDb();
  return db.products
    .filter((p) => p.stock < threshold)
    .map((p) => ({ sku: p.sku, name: p.name, stock: p.stock, level: 'low-stock' }));
}

module.exports = { getInventory, addInbound, addOutbound, getWarnings };
