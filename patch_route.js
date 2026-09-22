const fs = require('fs');
let code = fs.readFileSync('routes/shipping.js', 'utf8');

const newRoute = `
// 6. Manual Local Label Print
router.get('/orders/:orderId/manual-label', requireAuth, async (req, res) => {
  try {
    const order = await db.get('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.orderId, req.user.id]);
    if (!order) return res.status(404).send('الطلبية غير موجودة');

    const ShippingService = require('../services/shippingService');
    const config = await ShippingService.getVendorConfig(req.user.id);
    
    // Get store name
    const vendor = await db.get('SELECT store_name, phone FROM users WHERE id = $1', [req.user.id]);

    let providerName = (config && config.manual_provider_name) ? config.manual_provider_name : 'شركة التوصيل';
    let storeName = vendor ? (vendor.store_name || 'متجري') : 'متجري';
    let storePhone = vendor ? (vendor.phone || '') : '';
    
    const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);

    const html = \`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>وصل شحن - \${order.id}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; color: #000; padding: 20px; }
        .label-container { max-width: 400px; margin: 0 auto; border: 2px solid #000; padding: 15px; border-radius: 8px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .store-info h2 { margin: 0; font-size: 1.2rem; }
        .store-info p { margin: 2px 0; font-size: 0.9rem; }
        .provider { font-weight: bold; font-size: 1.4rem; text-align: left; }
        .order-info { margin-bottom: 15px; }
        .order-info p { margin: 5px 0; font-size: 1rem; }
        .order-info span { font-weight: bold; }
        .customer-info { border: 1px dashed #000; padding: 10px; margin-bottom: 15px; background: #f9f9f9; }
        .customer-info h3 { margin: 0 0 10px 0; font-size: 1.1rem; }
        .customer-info p { margin: 5px 0; font-size: 1.1rem; font-weight: bold; }
        .items { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .items th, .items td { border: 1px solid #000; padding: 6px; text-align: right; font-size: 0.9rem; }
        .items th { background: #eee; }
        .total { text-align: left; font-size: 1.3rem; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
        .barcode { text-align: center; margin-top: 20px; font-family: monospace; font-size: 1.2rem; letter-spacing: 2px; }
        @media print {
          body { padding: 0; margin: 0; }
          .label-container { border: none; width: 100%; max-width: 100%; }
        }
      </style>
    </head>
    <body onload="window.print()">
      <div class="label-container">
        <div class="header">
          <div class="store-info">
            <h2>\${storeName}</h2>
            \${storePhone ? \`<p>هاتف المَتجر: \${storePhone}</p>\` : ''}
          </div>
          <div class="provider">\${providerName}</div>
        </div>
        
        <div class="order-info">
          <p>رقم الطلبية: <span>#\${order.id}</span></p>
          <p>تاريخ الطلب: <span>\${new Date(order.created_at).toLocaleDateString('ar-DZ')}</span></p>
          <p>التوصيل إلى: <span>\${order.delivery_type === 'desk' ? 'المكتب (Stop Desk)' : 'المنزل'}</span></p>
        </div>

        <div class="customer-info">
          <h3>المرسل إليه:</h3>
          <p>\${order.customer_name}</p>
          <p>\${order.phone}</p>
          <p>\${order.wilaya_name || ''} - \${order.commune || ''}</p>
          <p style="font-size: 0.9rem; font-weight: normal;">\${order.address || ''}</p>
        </div>

        <table class="items">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
            </tr>
          </thead>
          <tbody>
            \${items.map(i => \`
              <tr>
                <td>\${i.name} \${i.variant_label ? '('+i.variant_label+')' : ''}</td>
                <td>\${i.qty}</td>
              </tr>
            \`).join('')}
          </tbody>
        </table>

        <div class="total">
          المبلغ المطلوب (COD): \${parseFloat(order.total).toLocaleString('ar-DZ')} د.ج
        </div>
        
        <div class="barcode">
          *\${order.id}-\${order.phone.slice(-4)}*
        </div>
      </div>
    </body>
    </html>
    \`;
    
    res.send(html);
  } catch (err) {
    res.status(500).send('خطأ: ' + err.message);
  }
});

module.exports = router;
`;

code = code.replace(/module\.exports = router;/, newRoute);
fs.writeFileSync('routes/shipping.js', code);
console.log('Added manual-label route');
