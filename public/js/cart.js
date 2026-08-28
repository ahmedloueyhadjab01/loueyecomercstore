// إدارة سلة التسوق باستخدام localStorage (لا بيانات دفع حساسة تُخزَّن هنا)
// كل سطر في السلة يُعرَّف بمجموعة (id + variant_id) حتى يبقى كل مقاس/حجم كسطر مستقل تمامًا
const Cart = {
  KEY: 'store_cart_v1',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.updateBadge();
  },

  lineKey(id, variantId) {
    return `${id}::${variantId || 'none'}`;
  },

  add(product, qty = 1, variant = null) {
    const items = this.get();
    const variantId = variant ? variant.id : null;
    const key = this.lineKey(product.id, variantId);
    const existing = items.find((i) => this.lineKey(i.id, i.variant_id) === key);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty,
        variant_id: variantId,
        variant_label: variant ? variant.label : null,
      });
    }
    this.save(items);
  },

  updateQty(id, variantId, qty) {
    let items = this.get();
    const key = this.lineKey(id, variantId);
    if (qty <= 0) {
      items = items.filter((i) => this.lineKey(i.id, i.variant_id) !== key);
    } else {
      const item = items.find((i) => this.lineKey(i.id, i.variant_id) === key);
      if (item) item.qty = qty;
    }
    this.save(items);
  },

  remove(id, variantId) {
    const key = this.lineKey(id, variantId);
    this.save(this.get().filter((i) => this.lineKey(i.id, i.variant_id) !== key));
  },

  clear() {
    this.save([]);
  },

  total() {
    return this.get().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  count() {
    return this.get().reduce((sum, i) => sum + i.qty, 0);
  },

  updateBadge() {
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = this.count();
  },
};

document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());
