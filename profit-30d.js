
// ...
router.get("/profit-30d", requireAuth, async (req, res) => {
  const userId = req.user.role === "admin" ? null : req.user.id;
  
  let ordersQuery = "SELECT * FROM orders WHERE status = 'تم التسليم' AND created_at >= datetime('now', '-30 days')";
  let params = [];
  if (userId) {
    ordersQuery += " AND user_id = $1";
    params.push(userId);
  }

  const orders = await db.all(ordersQuery, params);
  
  let revenue = 0;
  let cost_of_goods = 0;
  let shipping_cost = 0;
  let units_sold = 0;
  
  const productSales = {};

  for (const o of orders) {
    revenue += Number(o.subtotal) || 0;
    shipping_cost += Number(o.shipping_cost_actual || o.delivery_price) || 0;
    
    let items = [];
    try {
      items = JSON.parse(o.items || "[]");
    } catch (e) {}

    for (const item of items) {
      const qty = Number(item.qty) || 0;
      const cost = Number(item.cost_price) || 0;
      const price = Number(item.price) || 0;
      
      cost_of_goods += cost * qty;
      units_sold += qty;
      
      if (!productSales[item.id]) {
        productSales[item.id] = { name: item.name, qty: 0, revenue: 0, cost: 0 };
      }
      productSales[item.id].qty += qty;
      productSales[item.id].revenue += price * qty;
      productSales[item.id].cost += cost * qty;
    }
  }

  let lostShippingQuery = "SELECT COALESCE(SUM(COALESCE(NULLIF(shipping_cost_actual, 0), delivery_price)), 0) AS lost FROM orders WHERE (status IN ('ملغي', 'مرتجع', 'تعذر التوصيل')) AND shipping_cost_incurred = 1 AND created_at >= datetime('now', '-30 days')";
  if (userId) lostShippingQuery += " AND user_id = $1";
  
  const lostRes = await db.get(lostShippingQuery, params);
  shipping_cost += Number(lostRes.lost) || 0;

  const top_products = Object.values(productSales)
    .sort((a, b) => (b.revenue - b.cost) - (a.revenue - a.cost))
    .slice(0, 10)
    .map(p => ({
      name: p.name,
      qty: p.qty,
      revenue: p.revenue,
      profit: p.revenue - p.cost
    }));

  res.json({
    period_days: 30,
    delivered_orders: orders.length,
    units_sold,
    revenue,
    cost_of_goods,
    shipping_cost,
    net_profit: revenue - cost_of_goods - shipping_cost,
    top_products
  });
});

