const output = document.getElementById('output');
const inventoryUl = document.getElementById('inventory');
const pageTitle = document.getElementById('page-title');

const tabs = {
  overview: document.getElementById('tab-overview'),
  inventory: document.getElementById('tab-inventory'),
  recognition: document.getElementById('tab-recognition'),
  sync: document.getElementById('tab-sync')
};

const apiBase = 'http://127.0.0.1:3000';
const electronApi = window.inventoryApi;

async function invokeApi(name, payload) {
  if (electronApi && typeof electronApi[name] === 'function') {
    return electronApi[name](payload);
  }

  if (name === 'getInventory') {
    const res = await fetch(`${apiBase}/api/inventory`);
    return (await res.json()).data;
  }

  if (name === 'warnings') {
    const res = await fetch(`${apiBase}/api/warnings?threshold=${payload}`);
    return (await res.json()).data;
  }

  const mapping = {
    inbound: '/api/inbound',
    outbound: '/api/outbound',
    scanBarcode: '/api/recognition/barcode',
    transcribeVoice: '/api/recognition/voice',
    syncData: '/api/sync'
  };

  const res = await fetch(`${apiBase}${mapping[name]}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return json.data;
}

function print(value) {
  output.textContent = JSON.stringify(value, null, 2);
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 1800);
}

function switchTab(name) {
  Object.entries(tabs).forEach(([key, el]) => {
    el.classList.toggle('show', key === name);
  });
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === name);
  });
  const titles = {
    overview: '项目概览',
    inventory: '库存管理',
    recognition: '识别中心',
    sync: '数据同步'
  };
  pageTitle.textContent = titles[name];
}

async function refreshInventory() {
  if (!inventoryUl) return;
  const list = await invokeApi('getInventory');
  inventoryUl.innerHTML = '';
  list.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.sku} | ${item.name} | 库存: ${item.stock}`;
    inventoryUl.appendChild(li);
  });
}

document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.getElementById('btn-toast')?.addEventListener('click', () => showToast('需求文档已提交审核'));
document.getElementById('refresh')?.addEventListener('click', refreshInventory);

document.getElementById('inbound')?.addEventListener('click', async () => {
  try {
    const result = await invokeApi('inbound', {
      sku: document.getElementById('sku').value.trim(),
      quantity: Number(document.getElementById('qty').value),
      type: '采购入库',
      operatorRole: document.getElementById('operatorRole').value
    });
    print(result);
    showToast('入库成功');
    await refreshInventory();
  } catch (error) {
    print({ error: error.message });
  }
});

document.getElementById('outbound')?.addEventListener('click', async () => {
  try {
    const result = await invokeApi('outbound', {
      sku: document.getElementById('sku').value.trim(),
      quantity: Number(document.getElementById('qty').value),
      type: '销售出库',
      operatorRole: document.getElementById('operatorRole').value
    });
    print(result);
    showToast('出库成功');
    await refreshInventory();
  } catch (error) {
    print({ error: error.message });
  }
});

document.getElementById('barcodeBtn')?.addEventListener('click', async () => {
  const result = await invokeApi('scanBarcode', {
    imageTag: document.getElementById('barcodeInput').value.trim()
  });
  print(result);
});

document.getElementById('voiceBtn')?.addEventListener('click', async () => {
  const result = await invokeApi('transcribeVoice', {
    text: document.getElementById('voiceInput').value.trim()
  });
  print(result);
});

document.getElementById('syncBtn')?.addEventListener('click', async () => {
  const payload = await invokeApi('getInventory');
  const result = await invokeApi('syncData', {
    eventType: 'inventory_snapshot',
    data: payload
  });
  print(result);
  showToast('同步任务已提交');
});

document.getElementById('warningBtn')?.addEventListener('click', async () => {
  const threshold = Number(document.getElementById('threshold').value);
  const result = await invokeApi('warnings', threshold);
  print(result);
});

switchTab('overview');
refreshInventory();
