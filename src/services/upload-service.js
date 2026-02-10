const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mock-db.json');

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

async function simulatedUpload(payload) {
  const maxAttempts = 3;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;
    const fakeNetworkError = Math.random() < 0.2;

    if (!fakeNetworkError) {
      const db = readDb();
      db.uploads.push({
        id: `UP-${Date.now()}`,
        payload,
        attempt,
        uploadedAt: new Date().toISOString()
      });
      writeDb(db);
      return { success: true, attempt, message: '上传成功（模拟）' };
    }

    const backoff = 100 * (2 ** (attempt - 1));
    await new Promise((resolve) => setTimeout(resolve, backoff));
  }

  return { success: false, attempt: maxAttempts, message: '上传失败，已达到最大重试次数' };
}

module.exports = { simulatedUpload };
