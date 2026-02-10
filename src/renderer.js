const output = document.getElementById('output');
const inventoryUl = document.getElementById('inventory');

function print(value) {
  output.textContent = JSON.stringify(value, null, 2);
}

async function refreshInventory() {
  const list = await window.inventoryApi.getInventory();
  inventoryUl.innerHTML = '';
  list.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.sku} | ${item.name} | 库存: ${item.stock}`;
    inventoryUl.appendChild(li);
  });
}

document.getElementById('refresh').addEventListener('click', refreshInventory);

document.getElementById('inbound').addEventListener('click', async () => {
  try {
    const result = await window.inventoryApi.inbound({
      sku: document.getElementById('sku').value.trim(),
      quantity: Number(document.getElementById('qty').value),
      type: '采购入库',
      operatorRole: document.getElementById('operatorRole').value
    });
    print(result);
    await refreshInventory();
  } catch (error) {
    print({ error: error.message });
  }
});

document.getElementById('outbound').addEventListener('click', async () => {
  try {
    const result = await window.inventoryApi.outbound({
      sku: document.getElementById('sku').value.trim(),
      quantity: Number(document.getElementById('qty').value),
      type: '销售出库',
      operatorRole: document.getElementById('operatorRole').value
    });
    print(result);
    await refreshInventory();
  } catch (error) {
    print({ error: error.message });
  }
});

document.getElementById('barcodeBtn').addEventListener('click', async () => {
  const result = await window.inventoryApi.scanBarcode({
    imageTag: document.getElementById('barcodeInput').value.trim()
  });
  print(result);
});

document.getElementById('voiceBtn').addEventListener('click', async () => {
  const result = await window.inventoryApi.transcribeVoice({
    text: document.getElementById('voiceInput').value.trim()
  });
  print(result);
});

document.getElementById('syncBtn').addEventListener('click', async () => {
  const payload = await window.inventoryApi.getInventory();
  const result = await window.inventoryApi.syncData({
    eventType: 'inventory_snapshot',
    data: payload
  });
  print(result);
});

document.getElementById('warningBtn').addEventListener('click', async () => {
  const threshold = Number(document.getElementById('threshold').value);
  const result = await window.inventoryApi.warnings(threshold);
  print(result);
});

refreshInventory();
