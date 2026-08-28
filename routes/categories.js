const express = require('express');
const slugify = require('slugify');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function buildTree(categories, parentId = null) {
  return categories
    .filter((c) => c.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'ar'))
    .map((c) => ({
      ...c,
      children: buildTree(categories, c.id),
    }));
}

// عام: عرض كل التصنيفات كشجرة (يستخدمها المتجر لعرض القائمة)
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.json(buildTree(categories, null));
});

// عام: عرض التصنيفات كقائمة مسطحة (تفيد في نموذج اختيار "التصنيف الأب" بالأدمن)
router.get('/flat', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

// إضافة تصنيف جديد (هذا ما يشغّله زر "+")
router.post(
  '/',
  requireAuth,
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('اسم التصنيف مطلوب (حتى 100 حرف)'),
    body('parent_id').optional({ nullable: true }).isInt().withMessage('تصنيف أب غير صالح'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, parent_id } = req.body;
    let slug = slugify(name, { lower: true, strict: true, locale: 'ar' }) || `cat-${Date.now()}`;

    // ضمان تفرّد الـ slug
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (existing) slug = `${slug}-${Date.now()}`;

    if (parent_id) {
      const parent = db.prepare('SELECT id FROM categories WHERE id = ?').get(parent_id);
      if (!parent) return res.status(400).json({ error: 'التصنيف الأب غير موجود' });
    }

    const result = db
      .prepare('INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)')
      .run(name.trim(), slug, parent_id || null);

    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCategory);
  }
);

// تعديل تصنيف
router.put(
  '/:id',
  requireAuth,
  [body('name').trim().isLength({ min: 1, max: 100 })],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    const { name } = req.body;
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) return res.status(404).json({ error: 'التصنيف غير موجود' });

    db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
    res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
  }
);

// حذف تصنيف (وكل التصنيفات الفرعية بداخله تلقائيًا بسبب ON DELETE CASCADE)
router.delete('/:id', requireAuth, (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) return res.status(404).json({ error: 'التصنيف غير موجود' });

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
