const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const SOCIAL_KEYS = ['social_whatsapp', 'social_instagram', 'social_facebook', 'social_tiktok', 'social_telegram'];

// عام: قراءة روابط التواصل الاجتماعي (تُستخدم في الأيقونات بالمتجر) - فارغة تعني "غير مفعّل، لا تُعرض"
router.get('/social', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings WHERE key IN (' + SOCIAL_KEYS.map(() => '?').join(',') + ')').all(...SOCIAL_KEYS);
  const map = {};
  for (const k of SOCIAL_KEYS) map[k] = '';
  for (const r of rows) map[r.key] = r.value;
  res.json(map);
});

// أدمن فقط: تحديث روابط التواصل الاجتماعي دفعة واحدة
router.put('/social', requireAuth, (req, res) => {
  const update = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
  const applyAll = db.transaction(() => {
    for (const key of SOCIAL_KEYS) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        update.run(String(req.body[key] || '').trim(), key);
      }
    }
  });
  applyAll();
  res.json({ success: true });
});

module.exports = router;
