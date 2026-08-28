const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const communesData = require('../data/communes.json');

const router = express.Router();

// عام: كل الولايات مع أسعار التوصيل الحالية (تُستخدم في صفحة إتمام الطلب)
router.get('/wilayas', (req, res) => {
  const rows = db.prepare('SELECT * FROM delivery_rates ORDER BY wilaya_code').all();
  res.json(rows);
});

// عام: بلديات ولاية معينة
router.get('/communes/:wilayaCode', (req, res) => {
  const code = parseInt(req.params.wilayaCode, 10);
  const communes = communesData
    .filter((c) => c.wilaya_code === code)
    .map((c) => c.name)
    .sort((a, b) => a.localeCompare(b, 'ar'));
  res.json(communes);
});

// أدمن: تحديث سعر التوصيل (منزل/مكتب) لولاية واحدة
router.put(
  '/wilayas/:code',
  requireAuth,
  [
    body('home_price').isFloat({ min: 0 }).withMessage('سعر التوصيل للمنزل يجب أن يكون رقمًا موجبًا'),
    body('desk_price').isFloat({ min: 0 }).withMessage('سعر التوصيل للمكتب يجب أن يكون رقمًا موجبًا'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    const code = parseInt(req.params.code, 10);
    const row = db.prepare('SELECT * FROM delivery_rates WHERE wilaya_code = ?').get(code);
    if (!row) return res.status(404).json({ error: 'الولاية غير موجودة' });

    db.prepare('UPDATE delivery_rates SET home_price = ?, desk_price = ? WHERE wilaya_code = ?').run(
      parseFloat(req.body.home_price),
      parseFloat(req.body.desk_price),
      code
    );
    res.json(db.prepare('SELECT * FROM delivery_rates WHERE wilaya_code = ?').get(code));
  }
);

// أدمن: تحديث جماعي (لتسريع إدخال كل الأسعار دفعة واحدة)
router.put('/wilayas', requireAuth, (req, res) => {
  const { rates } = req.body; // [{ wilaya_code, home_price, desk_price }]
  if (!Array.isArray(rates)) return res.status(400).json({ error: 'بيانات غير صالحة' });

  const update = db.prepare('UPDATE delivery_rates SET home_price = ?, desk_price = ? WHERE wilaya_code = ?');
  const updateMany = db.transaction((rows) => {
    for (const r of rows) {
      const home = Math.max(0, parseFloat(r.home_price) || 0);
      const desk = Math.max(0, parseFloat(r.desk_price) || 0);
      update.run(home, desk, r.wilaya_code);
    }
  });
  updateMany(rates);

  res.json({ success: true });
});

module.exports = router;
