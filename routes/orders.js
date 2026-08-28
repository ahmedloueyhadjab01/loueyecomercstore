const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// دوال مساعدة: أي عنصر في الطلب قد يخص متغيّرًا (مقاس/حجم) أو منتجًا بسيطًا - كلها تتعامل مع الاثنين
function decrementStock(item) {
  if (item.variant_id) {
    db.prepare('UPDATE product_variants SET stock = stock - ? WHERE id = ?').run(item.qty, item.variant_id);
  } else {
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.qty, item.id);
  }
}
function incrementStock(item) {
  if (item.variant_id) {
    db.prepare('UPDATE product_variants SET stock = stock + ? WHERE id = ?').run(item.qty, item.variant_id);
  } else {
    db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.qty, item.id);
  }
}
function currentStockOf(item) {
  if (item.variant_id) {
    const v = db.prepare('SELECT stock FROM product_variants WHERE id = ?').get(item.variant_id);
    return v ? v.stock : null;
  }
  const p = db.prepare('SELECT stock FROM products WHERE id = ?').get(item.id);
  return p ? p.stock : null;
}

const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: { error: 'عدد كبير من الطلبات في وقت قصير. الرجاء المحاولة لاحقًا.' },
});

// إنشاء طلب جديد (من صفحة إتمام الشراء بالمتجر) - مع خصم المخزون فعليًا وبأمان (Transaction)
router.post(
  '/',
  orderLimiter,
  [
    body('customer_name').trim().isLength({ min: 2, max: 150 }).withMessage('الاسم مطلوب'),
    body('phone').trim().isLength({ min: 6, max: 30 }).withMessage('رقم هاتف صالح مطلوب'),
    body('address').trim().isLength({ min: 5, max: 500 }).withMessage('العنوان مطلوب'),
    body('wilaya_code').isInt().withMessage('الرجاء اختيار الولاية'),
    body('commune').trim().isLength({ min: 1, max: 150 }).withMessage('الرجاء اختيار البلدية'),
    body('delivery_type').isIn(['home', 'desk']).withMessage('نوع التوصيل غير صالح'),
    body('items').isArray({ min: 1 }).withMessage('السلة فارغة'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { customer_name, phone, address, wilaya_code, commune, delivery_type, items } = req.body;

    const rate = db.prepare('SELECT * FROM delivery_rates WHERE wilaya_code = ?').get(wilaya_code);
    if (!rate) return res.status(400).json({ error: 'ولاية غير معروفة' });

    try {
      // معاملة واحدة: التحقق من المخزون، خصمه، وإنشاء الطلب معًا أو لا شيء منها إطلاقًا
      const createOrder = db.transaction(() => {
        let subtotal = 0;
        const verifiedItems = [];

        for (const item of items) {
          // SELECT ... FOR UPDATE غير مطلوب مع better-sqlite3 لأنه متزامن (synchronous) بطبيعته،
          // فلا يمكن لطلبين أن يقرآ/يكتبا المخزون في نفس اللحظة، وهذا يمنع البيع المضاعف تلقائيًا.
          const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.id);
          if (!product) continue;

          const qty = Math.max(1, Math.min(parseInt(item.qty, 10) || 1, 999));

          let variant = null;
          if (product.has_variants) {
            variant = db
              .prepare('SELECT * FROM product_variants WHERE id = ? AND product_id = ?')
              .get(item.variant_id, product.id);
            if (!variant) {
              const err = new Error(`الرجاء اختيار المقاس/الحجم لـ "${product.name}"`);
              err.isStockError = true;
              throw err;
            }
            if (variant.stock < qty) {
              const err = new Error(`الكمية المتوفرة من "${product.name}" (${variant.label}) هي ${variant.stock} فقط`);
              err.isStockError = true;
              throw err;
            }
            db.prepare('UPDATE product_variants SET stock = stock - ? WHERE id = ?').run(qty, variant.id);
          } else {
            if (product.stock < qty) {
              const err = new Error(`الكمية المتوفرة من "${product.name}" هي ${product.stock} فقط`);
              err.isStockError = true;
              throw err;
            }
            db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(qty, product.id);
          }

          subtotal += product.price * qty;
          verifiedItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            cost_price: variant ? variant.cost_price || 0 : product.cost_price || 0, // لقطة سعر الشراء وقت البيع
            qty,
            variant_id: variant ? variant.id : null,
            variant_label: variant ? variant.label : null,
          });
        }

        if (verifiedItems.length === 0) {
          const err = new Error('المنتجات المطلوبة غير متوفرة');
          throw err;
        }

        const deliveryPrice = delivery_type === 'desk' ? rate.desk_price : rate.home_price;
        const total = subtotal + deliveryPrice;

        const result = db
          .prepare(
            `INSERT INTO orders
             (customer_name, phone, address, wilaya_code, wilaya_name, commune, delivery_type, delivery_price, subtotal, items, total)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            customer_name.trim(),
            phone.trim(),
            address.trim(),
            rate.wilaya_code,
            rate.wilaya_name,
            commune.trim(),
            delivery_type,
            deliveryPrice,
            subtotal,
            JSON.stringify(verifiedItems),
            total
          );

        return { order_id: result.lastInsertRowid, subtotal, delivery_price: deliveryPrice, total };
      });

      const outcome = createOrder();
      res.status(201).json({ success: true, ...outcome });
    } catch (err) {
      // أي خطأ أثناء المعاملة يُلغي كل التغييرات تلقائيًا (لا خصم مخزون جزئي أبدًا)
      return res.status(400).json({ error: err.message || 'تعذر إتمام الطلب' });
    }
  }
);

// عرض كل الطلبات (أدمن فقط)
router.get('/', requireAuth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders.map((o) => ({ ...o, items: JSON.parse(o.items) })));
});

// ملخص مالي (أدمن فقط): الأرباح المحصّلة فعليًا وتكلفة الشحن المخصومة
// - المبيعات تُحتسب فقط من الطلبات "تم التسليم" (لأن الدفع عند الاستلام هو الأسلوب الشائع)
// - تكلفة الشحن تُخصم بمجرد أن يصبح الطلب "قيد التوصيل" لأول مرة (عبر علامة shipping_cost_incurred
//   الدائمة)، وتبقى محتسبة كخسارة حتى لو أُلغي الطلب لاحقًا، لأن المال دُفع فعليًا لشركة التوصيل
//   ولا يُسترجع بمجرد إلغاء الطلب أو رفض الزبون للاستلام
router.get('/stats', requireAuth, (req, res) => {
  const liveSales = db
    .prepare("SELECT COALESCE(SUM(subtotal), 0) AS total FROM orders WHERE status = 'تم التسليم'")
    .get().total;

  const liveShippingCost = db
    .prepare('SELECT COALESCE(SUM(delivery_price), 0) AS total FROM orders WHERE shipping_cost_incurred = 1')
    .get().total;

  const archive = db.prepare('SELECT * FROM financial_archive WHERE id = 1').get();

  const sales = liveSales + archive.archived_sales;
  const shippingCost = liveShippingCost + archive.archived_shipping_cost;

  const counts = db
    .prepare(
      `SELECT
         SUM(CASE WHEN status = 'قيد المعالجة' THEN 1 ELSE 0 END) AS processing,
         SUM(CASE WHEN status = 'قيد التوصيل' THEN 1 ELSE 0 END) AS shipping,
         SUM(CASE WHEN status = 'تم التسليم' THEN 1 ELSE 0 END) AS delivered,
         SUM(CASE WHEN status = 'ملغي' THEN 1 ELSE 0 END) AS cancelled,
         SUM(CASE WHEN status = 'ملغي' AND shipping_cost_incurred = 1 THEN 1 ELSE 0 END) AS cancelled_after_shipping,
         COUNT(*) AS total
       FROM orders`
    )
    .get();

  res.json({
    total_sales: sales,
    total_shipping_cost: shippingCost,
    net_profit: sales - shippingCost,
    counts,
  });
});

// تقرير الأرباح والخسائر لآخر 30 يومًا (أدمن فقط) - يستعمل سعر الشراء الحقيقي المسجَّل لحظة كل عملية بيع
// الربح = (سعر البيع - سعر الشراء) × الكمية، لكل عنصر داخل الطلبات "تم التسليم" فقط، مطروحًا منه تكلفة الشحن
router.get('/profit-30d', requireAuth, (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const deliveredOrders = db
    .prepare("SELECT * FROM orders WHERE status = 'تم التسليم' AND created_at >= ?")
    .all(since);

  const shippingCost30d = db
    .prepare('SELECT COALESCE(SUM(delivery_price), 0) AS total FROM orders WHERE shipping_cost_incurred = 1 AND created_at >= ?')
    .get(since).total;

  let revenue = 0;
  let cogs = 0;
  let unitsSold = 0;
  const perProduct = {};

  for (const order of deliveredOrders) {
    const items = JSON.parse(order.items);
    for (const item of items) {
      const itemRevenue = item.price * item.qty;
      const itemCost = (item.cost_price || 0) * item.qty; // 0 لطلبات قديمة قبل تفعيل تتبّع سعر الشراء
      revenue += itemRevenue;
      cogs += itemCost;
      unitsSold += item.qty;

      const key = `${item.id}${item.variant_label ? ' (' + item.variant_label + ')' : ''}`;
      if (!perProduct[key]) perProduct[key] = { name: item.name + (item.variant_label ? ` (${item.variant_label})` : ''), qty: 0, revenue: 0, profit: 0 };
      perProduct[key].qty += item.qty;
      perProduct[key].revenue += itemRevenue;
      perProduct[key].profit += itemRevenue - itemCost;
    }
  }

  res.json({
    period_days: 30,
    revenue,
    cost_of_goods: cogs,
    shipping_cost: shippingCost30d,
    gross_profit: revenue - cogs,
    net_profit: revenue - cogs - shippingCost30d,
    units_sold: unitsSold,
    delivered_orders: deliveredOrders.length,
    top_products: Object.values(perProduct).sort((a, b) => b.profit - a.profit).slice(0, 10),
  });
});

// حذف طلب نهائيًا (أدمن فقط)
// - "تم التسليم": لا يُعاد المخزون أبدًا (بيع حقيقي ومكتمل)، وتُؤرشف مبيعاته وتكلفة شحنه دائمًا.
// - "ملغي": لا يُعاد المخزون (أُعيد مسبقًا وقت الإلغاء)، وتُؤرشف تكلفة الشحن إن كانت قد سُجّلت مسبقًا.
// - "قيد التوصيل": البضاعة لم تصل للزبون بعد مهما كانت النتيجة، لذا يُعاد المخزون دومًا. أما تكلفة
//   الشحن فلا تُحتسب تلقائيًا هنا إطلاقًا - يجب على الأدمن الإجابة صراحة عبر body.lost_shipping_cost
//   (true/false): "نعم" فعلاً ذهب المندوب ودُفعت التكلفة → تُحتسب كخسارة. "لا" لم تذهب البضاعة فعليًا
//   بعد → لا خسارة إطلاقًا. هذا يمنع الاعتماد الأعمى على علامة تلقائية قد لا تعكس الواقع الفعلي.
// - "قيد المعالجة": يُعاد المخزون دومًا (لم يُشحن أصلًا).
router.delete('/:id', requireAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

  const wasDelivered = order.status === 'تم التسليم';
  const wasCancelled = order.status === 'ملغي';
  const wasInTransit = order.status === 'قيد التوصيل';

  // عند الحذف وهو "قيد التوصيل"، لا بد من إجابة صريحة عن خسارة تكلفة الشحن قبل المتابعة
  if (wasInTransit && req.body.lost_shipping_cost === undefined) {
    return res.status(400).json({
      error: 'الرجاء تحديد ما إذا خسرت تكلفة التوصيل قبل حذف هذا الطلب',
      requires_shipping_cost_answer: true,
    });
  }

  const shouldRestoreStock = !wasDelivered && !wasCancelled; // أي طلب لم يُسلَّم فعليًا ولم يُلغَ مسبقًا
  const lostShippingCost = wasInTransit
    ? req.body.lost_shipping_cost === true || req.body.lost_shipping_cost === 'true'
    : Boolean(order.shipping_cost_incurred); // للحالات الأخرى (تم التسليم/ملغي) نعتمد العلامة المسجَّلة مسبقًا

  const deleteOrder = db.transaction(() => {
    if (shouldRestoreStock) {
      const items = JSON.parse(order.items);
      for (const item of items) {
        incrementStock(item);
      }
    }

    const archivedSales = wasDelivered ? order.subtotal : 0;
    const archivedShipping = lostShippingCost ? order.delivery_price : 0;
    if (archivedSales || archivedShipping) {
      db.prepare(
        `UPDATE financial_archive SET
           archived_sales = archived_sales + ?,
           archived_shipping_cost = archived_shipping_cost + ?
         WHERE id = 1`
      ).run(archivedSales, archivedShipping);
    }

    db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  });

  deleteOrder();
  res.json({ success: true });
});

// تحديث حالة الطلب (أدمن فقط) - يُعيد المخزون تلقائيًا عند الإلغاء، ويخصمه من جديد إذا أُلغي الإلغاء
// كما يُسجّل بشكل دائم أن تكلفة الشحن قد دُفعت فعليًا بمجرد أول وصول لحالة "قيد التوصيل"،
// ولا تُلغى هذه العلامة أبدًا حتى لو أُلغي الطلب لاحقًا (لأن المال دُفع فعليًا لشركة التوصيل)
router.put('/:id/status', requireAuth, [body('status').trim().notEmpty()], (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

  const newStatus = req.body.status;
  const wasCancelled = order.status === 'ملغي';
  const willBeCancelled = newStatus === 'ملغي';

  // بمجرد وصول الطلب لأول مرة لحالة "قيد التوصيل" أو "تم التسليم"، تُسجَّل تكلفة الشحن كخسارة دائمة
  const triggersShippingCost =
    !order.shipping_cost_incurred && (newStatus === 'قيد التوصيل' || newStatus === 'تم التسليم');

  if (wasCancelled === willBeCancelled) {
    // لا تغيير في حالة الإلغاء نفسها، فقط حدّث النص (مثلاً بين "قيد المعالجة" و"قيد التوصيل")
    if (triggersShippingCost) {
      db.prepare('UPDATE orders SET status = ?, shipping_cost_incurred = 1 WHERE id = ?').run(newStatus, req.params.id);
    } else {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(newStatus, req.params.id);
    }
    return res.json({ success: true });
  }

  try {
    const items = JSON.parse(order.items);

    const applyStatusChange = db.transaction(() => {
      if (willBeCancelled) {
        // إعادة الكمية لكل منتج/متغيّر في الطلب إلى المخزون
        // ملاحظة: تكلفة الشحن المسجَّلة مسبقًا (shipping_cost_incurred) لا تُعاد أبدًا هنا، وتبقى خسارة مُحتسبة
        for (const item of items) {
          incrementStock(item);
        }
      } else {
        // إلغاء الإلغاء: تحقق من توفر المخزون من جديد ثم اخصمه (على مستوى المتغيّر إن وُجد)
        for (const item of items) {
          const stock = currentStockOf(item);
          if (stock === null || stock < item.qty) {
            const err = new Error(
              `تعذر إلغاء إلغاء الطلب: الكمية المتوفرة الآن من "${item.name}${item.variant_label ? ' (' + item.variant_label + ')' : ''}" غير كافية`
            );
            throw err;
          }
        }
        for (const item of items) {
          decrementStock(item);
        }
      }
      if (triggersShippingCost) {
        db.prepare('UPDATE orders SET status = ?, shipping_cost_incurred = 1 WHERE id = ?').run(newStatus, req.params.id);
      } else {
        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(newStatus, req.params.id);
      }
    });

    applyStatusChange();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message || 'تعذر تحديث حالة الطلب' });
  }
});

module.exports = router;
