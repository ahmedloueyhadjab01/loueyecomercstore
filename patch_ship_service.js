const fs = require('fs');
let code = fs.readFileSync('services/shippingService.js', 'utf8');

const target = `    if (!config || !config.api_key || config.provider === 'manual') {
      throw new Error('لا يمكن توليد ملصق بدون ربط API شركة التوصيل يرجى ربط حسابك');
    }`;

const replaceWith = `    if (!config || config.provider === 'manual' || !config.api_key) {
      // Return a local manual label URL
      return { label_url: \`/api/shipping/orders/\${orderId}/manual-label\` };
    }`;

code = code.replace(/if \(\!config \|\| \!config\.api_key \|\| config\.provider === 'manual'\) \{\s*throw new Error\('[^']+'\);\s*\}/, replaceWith);

fs.writeFileSync('services/shippingService.js', code);
console.log('Patched createParcel in shippingService.js');
