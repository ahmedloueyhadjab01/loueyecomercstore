const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, requireActiveSubscription } = require('../middleware/auth');
const ShippingService = require('../services/shippingService');

// 1. جلب إعدادات الشحن الخاصة بالتاجر الحالي
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const config = await ShippingService.getVendorConfig(req.user.id);
    if (config) {
      config.credentials_configured = Boolean(config.api_key || config.api_token);
      delete config.api_key;
      delete config.api_token;
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. حفظ / تحديث إعدادات الشحن للتاجر
router.post('/settings', requireAuth, requireActiveSubscription, async (req, res) => {
  try {
    const {
      provider,
      api_key,
      api_token,
      from_wilaya_id,
      from_commune,
      pricing_mode,
      flat_home_price,
      flat_desk_price,
      free_shipping_enabled,
      free_shipping_threshold,
    } = req.body;

    await db.query(
      `INSERT INTO vendor_shipping_configs (
        user_id, provider, api_key, api_token, from_wilaya_id, from_commune,
        pricing_mode, flat_home_price, flat_desk_price, free_shipping_enabled, free_shipping_threshold, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        provider = EXCLUDED.provider,
        api_key = COALESCE(EXCLUDED.api_key, vendor_shipping_configs.api_key),
        api_token = COALESCE(EXCLUDED.api_token, vendor_shipping_configs.api_token),
        from_wilaya_id = EXCLUDED.from_wilaya_id,
        from_commune = EXCLUDED.from_commune,
        pricing_mode = EXCLUDED.pricing_mode,
        flat_home_price = EXCLUDED.flat_home_price,
        flat_desk_price = EXCLUDED.flat_desk_price,
        free_shipping_enabled = EXCLUDED.free_shipping_enabled,
        free_shipping_threshold = EXCLUDED.free_shipping_threshold,
        updated_at = CURRENT_TIMESTAMP`,
      [
        req.user.id,
        provider || 'manual',
        api_key || null,
        api_token || null,
        parseInt(from_wilaya_id, 10) || 16,
        from_commune || '',
        pricing_mode || 'flat',
        flat_home_price !== undefined && flat_home_price !== '' ? Number(flat_home_price) : 600,
        flat_desk_price !== undefined && flat_desk_price !== '' ? Number(flat_desk_price) : 350,
        free_shipping_enabled ? 1 : 0,
        free_shipping_threshold !== undefined && free_shipping_threshold !== '' ? Number(free_shipping_threshold) : 15000,
      ]
    );

    res.json({ success: true, message: 'تم حفظ إعدادات الشحن بنجاح ✅' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'تعذر حفظ إعدادات الشحن' });
  }
});

router.get('/custom-rates', requireAuth, async (req, res) => {
  const rates = await db.all(
    `SELECT d.wilaya_code, d.wilaya_name,
       COALESCE(v.home_price, d.home_price) AS home_price,
       COALESCE(v.desk_price, d.desk_price) AS desk_price,
       COALESCE(v.is_deliverable, 1) AS is_deliverable
     FROM delivery_rates d
     LEFT JOIN vendor_custom_delivery_rates v
       ON v.wilaya_code = d.wilaya_code AND v.user_id = $1
     ORDER BY d.wilaya_code`,
    [req.user.id]
  );
  res.json({
    rates: rates.map((r) => ({
      ...r,
      home_price: parseFloat(r.home_price) || 0,
      desk_price: parseFloat(r.desk_price) || 0,
    })),
  });
});

router.put('/custom-rates', requireAuth, requireActiveSubscription, async (req, res) => {
  const { rates } = req.body;
  if (!Array.isArray(rates) || rates.length > 69) return res.status(400).json({ error: 'بيانات أسعار الولايات غير صالحة' });

  try {
    await db.transaction(async (trx) => {
      for (const rate of rates) {
        const code = Number.parseInt(rate.wilaya_code, 10);
        const home = Number(rate.home_price);
        const desk = Number(rate.desk_price);
        if (!Number.isInteger(code) || !Number.isFinite(home) || !Number.isFinite(desk) || home < 0 || desk < 0) {
          throw new Error('يوجد سعر شحن غير صالح');
        }

        const existing = await trx.get(
          'SELECT id FROM vendor_custom_delivery_rates WHERE user_id = $1 AND wilaya_code = $2',
          [req.user.id, code]
        );
        if (existing) {
          await trx.query(
            'UPDATE vendor_custom_delivery_rates SET home_price = $1, desk_price = $2, is_deliverable = $3 WHERE id = $4',
            [home, desk, rate.is_deliverable ? 1 : 0, existing.id]
          );
        } else {
          await trx.query(
            'INSERT INTO vendor_custom_delivery_rates (user_id, wilaya_code, home_price, desk_price, is_deliverable) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, code, home, desk, rate.is_deliverable ? 1 : 0]
          );
        }
      }
    });
    res.json({ success: true, message: 'تم حفظ أسعار الشحن الخاصة بمتجرك ✅' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'تعذر حفظ أسعار الشحن' });
  }
});

// 3. حساب سعر الشحن للزبون عند إتمام الطلب (Public Endpoint)
router.get('/calculate-cost', async (req, res) => {
  try {
    const { store_id, wilaya_code, delivery_type, subtotal } = req.query;
    if (!store_id || !wilaya_code) {
      return res.status(400).json({ error: 'بيانات غير كافية لحساب الشحن' });
    }

    const storeId = Number.parseInt(store_id, 10);
    const wilayaCode = Number.parseInt(wilaya_code, 10);
    const orderSubtotal = Number(subtotal);
    if (!Number.isInteger(storeId) || storeId < 1 || !Number.isInteger(wilayaCode) || wilayaCode < 1 || !['home', 'desk'].includes(delivery_type || 'home') || !Number.isFinite(orderSubtotal) || orderSubtotal < 0) {
      return res.status(400).json({ error: 'بيانات الشحن غير صالحة' });
    }

    const result = await ShippingService.calculateShippingCost(storeId, wilayaCode, delivery_type || 'home', orderSubtotal);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. توليد شحنة وبوليصة التوصيل بضغطة زر (Vendor only)
router.post('/orders/:orderId/generate-label', requireAuth, requireActiveSubscription, async (req, res) => {
  try {
    const result = await ShippingService.createParcel(req.params.orderId, req.user.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. التتبع اللحظي للطلب عبر API
router.get('/orders/:orderId/live-track', requireAuth, async (req, res) => {
  try {
    const result = await ShippingService.trackParcel(req.params.orderId, req.user.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
