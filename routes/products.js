const express = require('express');
const slugify = require('slugify');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const upload = require('./upload');

const router = express.Router();

function getVariants(productId) {
  return db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order, id').all(productId);
}

// يجمع مُعرّف التصنيف نفسه + كل التصنيفات الفرعية بداخله (مهما كان عمق التداخل) في مصفوفة واحدة
function getCategoryIdsWithDescendants(rootId) {
  const ids = [Number(rootId)];
  const children = db.prepare('SELECT id FROM categories WHERE parent_id = ?').all(rootId);
  for (const child of children) {
    ids.push(...getCategoryIdsWithDescendants(child.id));
  }
  return ids;
}


function serialize(p) {
  const base = { ...p, images: JSON.parse(p.images || '[]'), is_active: !!p.is_active, has_variants: !!p.has_variants };
  if (base.has_variants) {
    const variants = getVariants(p.id);
    base.variants = variants;
    base.stock = variants.reduce((sum, v) => sum + v.stock, 0); // مجموع المخزون كقيمة عرض فقط
  }
  return base;
}

// عام: عرض المنتجات (مع فلترة اختيارية بالتصنيف والبحث وslug محدد)
router.get('/', (req, res) => {
  const { category_id, q, slug, limit = 60, offset = 0 } = req.query;
  let sql = 'SELECT * FROM products WHERE is_active = 1';
  const params = [];

  if (slug) {
    sql += ' AND slug = ?';
    params.push(slug);
  }
if (category_id) {
    // شمل التصنيف نفسه وكل تصنيفاته الفرعية، حتى يظهر المنتج عند تصفح التصنيف الأب أيضًا
    const ids = getCategoryIdsWithDescendants(category_id);
    sql += ` AND category_id IN (${ids.map(() => '?').join(',')})`;
    params.push(...ids);
  }
  if (q) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const products = db.prepare(sql).all(...params);
  res.json(products.map(serialize));
});

// عام: كل المنتجات لأغراض الأدمن (تشمل غير المفعّلة)
router.get('/admin/all', requireAuth, (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(products.map(serialize));
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
  res.json(serialize(product));
});

router.post(
  '/',
  requireAuth,
  upload.array('images', 6),
  [
    body('name').trim().isLength({ min: 1, max: 200 }).withMessage('اسم المنتج مطلوب'),
    body('price').isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقمًا موجبًا'),
    body('stock').optional().isInt({ min: 0 }).withMessage('المخزون يجب أن يكون رقمًا صحيحًا'),
    body('cost_price').optional().isFloat({ min: 0 }).withMessage('سعر الشراء يجب أن يكون رقمًا موجبًا'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, description = '', price, compare_price, sku, stock = 0, cost_price = 0, category_id } = req.body;

    // المتغيرات حرة تمامًا: الأدمن يقرر إن كان المنتج له متغيرات (مقاسات/أحجام/أي شيء) أم لا
    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
        if (!Array.isArray(variants)) variants = [];
      } catch {
        return res.status(400).json({ error: 'صيغة المتغيرات غير صالحة' });
      }
    }
    const hasVariants = variants.length > 0;
    if (hasVariants) {
      for (const v of variants) {
        if (!v.label || typeof v.label !== 'string' || !v.label.trim()) {
          return res.status(400).json({ error: 'كل متغيّر يحتاج اسمًا (مثلًا: 40 أو M)' });
        }
      }
    }

    let slug = slugify(name, { lower: true, strict: true, locale: 'ar' }) || `p-${Date.now()}`;
    const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
    if (existing) slug = `${slug}-${Date.now()}`;

    const imagePaths = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const mainImage = imagePaths[0] || null;
    const initialStock = hasVariants ? 0 : parseInt(stock, 10) || 0;
    const initialCost = hasVariants ? 0 : parseFloat(cost_price) || 0;

    const createProduct = db.transaction(() => {
      const result = db
        .prepare(
          `INSERT INTO products (name, slug, description, price, compare_price, sku, stock, cost_price, has_variants, category_id, image, images)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          name.trim(),
          slug,
          description,
          parseFloat(price),
          compare_price ? parseFloat(compare_price) : null,
          sku || null,
          initialStock,
          initialCost,
          hasVariants ? 1 : 0,
          category_id || null,
          mainImage,
          JSON.stringify(imagePaths)
        );

      const productId = result.lastInsertRowid;

      if (hasVariants) {
        const insertVariant = db.prepare(
          'INSERT INTO product_variants (product_id, label, stock, cost_price, sort_order) VALUES (?, ?, ?, ?, ?)'
        );
        const insertVariantRestock = db.prepare(
          'INSERT INTO variant_restocks (variant_id, qty_added, cost_price) VALUES (?, ?, ?)'
        );
        variants.forEach((v, idx) => {
          const vStock = Math.max(0, parseInt(v.stock, 10) || 0);
          const vCost = Math.max(0, parseFloat(v.cost_price) || 0);
          const vResult = insertVariant.run(productId, v.label.trim(), vStock, vCost, idx);
          if (vStock > 0) insertVariantRestock.run(vResult.lastInsertRowid, vStock, vCost);
        });
      } else if (initialStock > 0) {
        // نسجّل الدفعة الأولى في سجل التزويد أيضًا حتى يظهر ضمن تاريخ الشراء منذ البداية
        db.prepare('INSERT INTO stock_restocks (product_id, qty_added, cost_price) VALUES (?, ?, ?)').run(
          productId,
          initialStock,
          initialCost
        );
      }

      return productId;
    });

    const newId = createProduct();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(newId);
    res.status(201).json(serialize(product));
  }
);

// تعديل بيانات المنتج (أدمن فقط)
// ملاحظة مهمة: المخزون (stock) غير قابل للتعديل من هنا نهائيًا وعن قصد. لا يوجد "overwrite" مباشر
// لقيمة المخزون أبدًا، لأن نموذج التعديل قد يبقى مفتوحًا في متصفح الأدمن بينما يتغيّر المخزون فعليًا
// في الخلفية (طلب جديد، حذف، إلخ)، فحفظ نموذج قديم كان يُعيد كتابة رقم قديم فوق الرقم الحقيقي الحالي
// (هذا هو سبب ظهور أرقام مخزون خاطئة سابقًا). أي تغيير في الكمية يجب أن يمر حصريًا عبر عمليات
// جمع/طرح آمنة: الطلبات، الإلغاء، الحذف، أو مسار POST /:id/restock أدناه.
router.put('/:id', requireAuth, upload.array('images', 6), (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });

  const {
    name = product.name,
    description = product.description,
    price = product.price,
    compare_price,
    sku,
    category_id,
    is_active,
  } = req.body;

  let images = JSON.parse(product.images || '[]');
  if (req.files && req.files.length) {
    images = req.files.map((f) => `/uploads/${f.filename}`);
  }
  const mainImage = images[0] || product.image;

  db.prepare(
    `UPDATE products SET name=?, description=?, price=?, compare_price=?, sku=?, category_id=?, image=?, images=?, is_active=?
     WHERE id=?`
  ).run(
    name,
    description,
    parseFloat(price),
    compare_price ? parseFloat(compare_price) : null,
    sku || null,
    category_id || null,
    mainImage,
    JSON.stringify(images),
    is_active === undefined ? product.is_active : (is_active === 'true' || is_active === true ? 1 : 0),
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(serialize(updated));
});

// تزويد المخزون بكمية جديدة (أدمن فقط) - فقط للمنتجات البسيطة (بدون متغيرات)
router.post(
  '/:id/restock',
  requireAuth,
  [
    body('qty').isInt({ min: 1 }).withMessage('الكمية المضافة يجب أن تكون رقمًا صحيحًا أكبر من صفر'),
    body('cost_price').isFloat({ min: 0 }).withMessage('سعر الشراء مطلوب ويجب أن يكون رقمًا موجبًا'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    if (product.has_variants) {
      return res.status(400).json({ error: 'هذا المنتج له متغيرات (مقاسات/أحجام) - زوّد كل متغيّر على حدة' });
    }

    const qtyAdded = parseInt(req.body.qty, 10);
    const newCostPrice = parseFloat(req.body.cost_price);

    const oldStock = product.stock;
    const oldCost = product.cost_price || 0;
    const totalStock = oldStock + qtyAdded;
    // متوسط مرجّح: يحافظ على قيمة الكمية القديمة بدل محوها، ويعطي وزنًا عادلًا لكل دفعة حسب كميتها
    const weightedAvgCost = totalStock > 0 ? (oldStock * oldCost + qtyAdded * newCostPrice) / totalStock : newCostPrice;

    const doRestock = db.transaction(() => {
      db.prepare('UPDATE products SET stock = stock + ?, cost_price = ? WHERE id = ?').run(
        qtyAdded,
        weightedAvgCost,
        req.params.id
      );
      db.prepare('INSERT INTO stock_restocks (product_id, qty_added, cost_price) VALUES (?, ?, ?)').run(
        req.params.id,
        qtyAdded,
        newCostPrice
      );
    });
    doRestock();

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(serialize(updated));
  }
);

// إضافة متغيّر جديد (مقاس/حجم/أي تسمية حرة) لمنتج له متغيرات - يحوّل المنتج تلقائيًا لوضع "له متغيرات"
router.post(
  '/:id/variants',
  requireAuth,
  [
    body('label').trim().isLength({ min: 1, max: 50 }).withMessage('اسم المتغيّر مطلوب (مثلًا: 40 أو M)'),
    body('qty').optional().isInt({ min: 0 }).withMessage('الكمية يجب أن تكون رقمًا صحيحًا'),
    body('cost_price').optional().isFloat({ min: 0 }).withMessage('سعر الشراء يجب أن يكون رقمًا موجبًا'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    if (!product.has_variants && product.stock > 0) {
      return res.status(400).json({
        error: 'هذا منتج بسيط وله مخزون عام بالفعل. لا يمكن تحويله لمتغيرات إلا بعد تصفير مخزونه العام أو حذفه وإعادة إنشائه بمتغيرات.',
      });
    }

    const qty = Math.max(0, parseInt(req.body.qty, 10) || 0);
    const costPrice = Math.max(0, parseFloat(req.body.cost_price) || 0);

    const addVariant = db.transaction(() => {
      if (!product.has_variants) {
        db.prepare('UPDATE products SET has_variants = 1, stock = 0, cost_price = 0 WHERE id = ?').run(req.params.id);
      }
      const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM product_variants WHERE product_id = ?').get(req.params.id).m;
      const result = db
        .prepare('INSERT INTO product_variants (product_id, label, stock, cost_price, sort_order) VALUES (?, ?, ?, ?, ?)')
        .run(req.params.id, req.body.label.trim(), qty, costPrice, maxOrder + 1);
      if (qty > 0) {
        db.prepare('INSERT INTO variant_restocks (variant_id, qty_added, cost_price) VALUES (?, ?, ?)').run(
          result.lastInsertRowid,
          qty,
          costPrice
        );
      }
    });
    addVariant();

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.status(201).json(serialize(updated));
  }
);

// تزويد متغيّر موجود بكمية جديدة (نفس منطق المتوسط المرجّح، لكن لكل متغيّر على حدة)
router.post(
  '/:id/variants/:variantId/restock',
  requireAuth,
  [
    body('qty').isInt({ min: 1 }).withMessage('الكمية المضافة يجب أن تكون رقمًا صحيحًا أكبر من صفر'),
    body('cost_price').isFloat({ min: 0 }).withMessage('سعر الشراء مطلوب ويجب أن يكون رقمًا موجبًا'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const variant = db
      .prepare('SELECT * FROM product_variants WHERE id = ? AND product_id = ?')
      .get(req.params.variantId, req.params.id);
    if (!variant) return res.status(404).json({ error: 'المتغيّر غير موجود' });

    const qtyAdded = parseInt(req.body.qty, 10);
    const newCostPrice = parseFloat(req.body.cost_price);
    const oldStock = variant.stock;
    const oldCost = variant.cost_price || 0;
    const totalStock = oldStock + qtyAdded;
    const weightedAvgCost = totalStock > 0 ? (oldStock * oldCost + qtyAdded * newCostPrice) / totalStock : newCostPrice;

    const doRestock = db.transaction(() => {
      db.prepare('UPDATE product_variants SET stock = stock + ?, cost_price = ? WHERE id = ?').run(
        qtyAdded,
        weightedAvgCost,
        req.params.variantId
      );
      db.prepare('INSERT INTO variant_restocks (variant_id, qty_added, cost_price) VALUES (?, ?, ?)').run(
        req.params.variantId,
        qtyAdded,
        newCostPrice
      );
    });
    doRestock();

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(serialize(updated));
  }
);

// حذف متغيّر (فقط إن كان مخزونه صفرًا، لتفادي محو كمية موجودة فعليًا بالخطأ)
router.delete('/:id/variants/:variantId', requireAuth, (req, res) => {
  const variant = db
    .prepare('SELECT * FROM product_variants WHERE id = ? AND product_id = ?')
    .get(req.params.variantId, req.params.id);
  if (!variant) return res.status(404).json({ error: 'المتغيّر غير موجود' });
  if (variant.stock > 0) {
    return res.status(400).json({ error: 'لا يمكن حذف متغيّر مخزونه أكبر من صفر. زوّده إلى صفر أولًا أو عدّله يدويًا.' });
  }
  db.prepare('DELETE FROM product_variants WHERE id = ?').run(req.params.variantId);
  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(serialize(updated));
});

router.delete('/:id', requireAuth, (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
