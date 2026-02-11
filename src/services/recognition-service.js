function scanBarcodeByPhoto({ imageTag }) {
  const text = (imageTag || '').trim();
  const ean13 = /^\d{13}$/;
  const code128 = /^[A-Za-z0-9\-]{6,20}$/;

  if (ean13.test(text)) {
    return { success: true, format: 'EAN-13', code: text, confidence: 0.99 };
  }

  if (code128.test(text)) {
    return { success: true, format: 'Code 128', code: text, confidence: 0.98 };
  }

  return {
    success: false,
    reason: '无法识别条码，请优化光照/角度后重试',
    confidence: 0.2
  };
}

function transcribeVoice({ text }) {
  const raw = (text || '').trim();
  if (!raw) {
    return { success: false, reason: '语音为空' };
  }

  const dateMatch = raw.match(/(20\d{2}[-/.年]\d{1,2}[-/.月]\d{1,2})/);
  const shelfMatch = raw.match(/(\d+)\s*(天|月|年)/);

  return {
    success: true,
    transcript: raw,
    structured: {
      productName: raw.split(' ')[0],
      productionDate: dateMatch ? dateMatch[1].replace(/[年/.月]/g, '-').replace(/--/g, '-') : null,
      shelfLife: shelfMatch ? `${shelfMatch[1]}${shelfMatch[2]}` : null
    },
    metrics: {
      expectedWer: '<=5%',
      expectedLatencySec: '<=4'
    }
  };
}

module.exports = { scanBarcodeByPhoto, transcribeVoice };
