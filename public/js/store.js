let ALL_CATEGORIES = [];
let CURRENT_CATEGORY = '';
let SEARCH_QUERY = '';
let CURRENT_DELIVERY_TYPE = 'home';

function money(n) {
  return `${Number(n).toLocaleString('ar-DZ')} دج`;
}

let CATEGORY_TREE = [];

async function loadCategories() {
  const res = await fetch('/api/categories');
  CATEGORY_TREE = await res.json();

  const nav = document.getElementById('categoryNav');
  nav.querySelectorAll('.cat-btn:not([data-cat=""])').forEach((b) => b.remove());

  for (const cat of CATEGORY_TREE) {
    const btn = document.createElement('button');
    btn.className = 'cat-btn whitespace-nowrap px-4 py-1.5 rounded-full text-sm';
    btn.dataset.cat = cat.id;
    btn.textContent = cat.name;
    nav.appendChild(btn);
  }

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    selectMainCategory(btn.dataset.cat);
  });
}

function selectMainCategory(catId) {
  const nav = document.getElementById('categoryNav');
  const subNav = document.getElementById('subCategoryNav');

  document.querySelectorAll('#categoryNav .cat-btn').forEach((b) => {
    const isActive = b.dataset.cat === catId;
    b.classList.toggle('active-cat', isActive);
    b.classList.toggle('dimmed', !isActive && catId !== '');
  });

  CURRENT_CATEGORY = catId;

  // ابحث عن التصنيفات الفرعية لهذا التصنيف الرئيسي وأظهرها كقائمة منسدلة تحته
  const parent = CATEGORY_TREE.find((c) => String(c.id) === String(catId));
  const children = parent && parent.children ? parent.children : [];

  if (children.length) {
    subNav.classList.remove('hidden');
    subNav.innerHTML =
      `<button data-subcat="${catId}" class="subcat-btn active-cat">الكل في ${escapeHtmlSimple(parent.name)}</button>` +
      children.map((c) => `<button data-subcat="${c.id}" class="subcat-btn">${escapeHtmlSimple(c.name)}</button>`).join('');
    subNav.querySelectorAll('.subcat-btn').forEach((sb) => {
      sb.addEventListener('click', () => {
        subNav.querySelectorAll('.subcat-btn').forEach((b) => b.classList.remove('active-cat'));
        sb.classList.add('active-cat');
        CURRENT_CATEGORY = sb.dataset.subcat;
        loadProducts();
      });
    });
  } else {
    subNav.classList.add('hidden');
    subNav.innerHTML = '';
  }

  loadProducts();
}

function escapeHtmlSimple(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadProducts() {
  const params = new URLSearchParams();
  if (CURRENT_CATEGORY) params.set('category_id', CURRENT_CATEGORY);
  if (SEARCH_QUERY) params.set('q', SEARCH_QUERY);

  const res = await fetch(`/api/products?${params.toString()}`);
  const products = await res.json();

  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyState');
  grid.innerHTML = '';

  if (!products.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  for (const p of products) {
    const outOfStock = p.stock <= 0;
    const card = document.createElement('div');
    card.className = 'product-card fade-in overflow-hidden flex flex-col';
    card.innerHTML = `
      <a href="/product.html?slug=${encodeURIComponent(p.slug)}" class="aspect-square bg-sand-deep overflow-hidden block border-b-2 border-ink relative">
        <img src="${p.image || '/img/placeholder.svg'}" alt="${escapeHtml(p.name)}" class="w-full h-full object-cover ${outOfStock ? 'opacity-40 grayscale' : ''}" loading="lazy" />
        ${outOfStock ? '<span class="absolute top-2 right-2 bg-ink text-white text-xs font-extrabold px-2 py-1 rounded-full">نفد المخزون</span>' : ''}
      </a>
      <div class="p-3 flex flex-col flex-1 gap-2">
        <a href="/product.html?slug=${encodeURIComponent(p.slug)}" class="text-sm font-bold line-clamp-2 flex-1 hover:text-forest">${escapeHtml(p.name)}</a>
        <div class="flex items-center justify-between">
          <span class="price-ticket">${money(p.price)}</span>
          ${p.compare_price ? `<span class="text-xs text-ink/40 line-through">${money(p.compare_price)}</span>` : ''}
        </div>
        <button class="add-to-cart btn-primary w-full text-sm py-2 rounded-xl font-extrabold" ${outOfStock ? 'disabled' : ''} style="${outOfStock ? 'opacity:.5;cursor:not-allowed' : ''}">
          ${outOfStock ? 'غير متوفر حاليًا' : 'أضف للسلة'}
        </button>
      </div>
    `;
    if (!outOfStock) {
      const btn = card.querySelector('.add-to-cart');
      if (p.has_variants) {
        btn.textContent = 'اختر المقاس';
        btn.addEventListener('click', () => {
          window.location.href = `/product.html?slug=${encodeURIComponent(p.slug)}`;
        });
      } else {
        btn.addEventListener('click', () => {
          const inCart = Cart.get().find((i) => i.id === p.id && !i.variant_id);
          const currentQty = inCart ? inCart.qty : 0;
          if (currentQty + 1 > p.stock) {
            showToast(`الكمية المتوفرة من هذا المنتج ${p.stock} فقط ⚠️`);
            return;
          }
          Cart.add(p, 1);
          showToast('تمت إضافة المنتج إلى السلة ✅');
        });
      }
    }
    grid.appendChild(card);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(msg) {
  const toast = document.getElementById('successToast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2200);
}

// ---------- سلة التسوق (Drawer) ----------
function renderCartDrawer() {
  const items = Cart.get();
  const container = document.getElementById('cartItems');
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<p class="text-center text-ink/40 mt-10 font-bold">السلة فارغة</p>';
  }

  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-3 border-b border-ink/10 pb-3';
    row.innerHTML = `
      <img src="${item.image || '/img/placeholder.svg'}" class="w-14 h-14 object-cover rounded-lg bg-sand-deep border-2 border-ink" />
      <div class="flex-1">
        <p class="text-sm font-bold line-clamp-1">${escapeHtml(item.name)}${item.variant_label ? ` <span class="text-xs text-gold font-extrabold">(${escapeHtml(item.variant_label)})</span>` : ''}</p>
        <p class="text-xs text-ink/50">${money(item.price)}</p>
        <div class="flex items-center gap-2 mt-1">
          <button class="qty-btn dec btn-outline rounded-lg w-6 h-6 text-sm">-</button>
          <span class="text-sm font-bold">${item.qty}</span>
          <button class="qty-btn inc btn-outline rounded-lg w-6 h-6 text-sm">+</button>
        </div>
      </div>
      <button class="remove-btn text-terracotta text-xs font-extrabold">حذف</button>
    `;
    row.querySelector('.inc').addEventListener('click', () => { Cart.updateQty(item.id, item.variant_id, item.qty + 1); renderCartDrawer(); });
    row.querySelector('.dec').addEventListener('click', () => { Cart.updateQty(item.id, item.variant_id, item.qty - 1); renderCartDrawer(); });
    row.querySelector('.remove-btn').addEventListener('click', () => { Cart.remove(item.id, item.variant_id); renderCartDrawer(); });
    container.appendChild(row);
  }

  document.getElementById('cartTotal').textContent = money(Cart.total());
}

function openCart() {
  renderCartDrawer();
  document.getElementById('cartOverlay').classList.remove('hidden');
  document.getElementById('cartDrawer').classList.add('open');
}
function closeCart() {
  document.getElementById('cartOverlay').classList.add('hidden');
  document.getElementById('cartDrawer').classList.remove('open');
}

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);

// ---------- إتمام الطلب: الولاية / البلدية / نوع التوصيل ----------
const wilayaSelect = document.getElementById('wilayaSelect');
const communeSelect = document.getElementById('communeSelect');

Locations.loadWilayas(wilayaSelect);

wilayaSelect.addEventListener('change', async () => {
  const code = wilayaSelect.value;
  if (!code) {
    communeSelect.disabled = true;
    communeSelect.innerHTML = '<option value="">البلدية...</option>';
  } else {
    await Locations.loadCommunes(code, communeSelect);
  }
  updateDeliveryPrices();
});

document.querySelectorAll('.delivery-option').forEach((label) => {
  label.addEventListener('click', () => {
    document.querySelectorAll('.delivery-option').forEach((l) => l.classList.remove('selected'));
    label.classList.add('selected');
    label.querySelector('input').checked = true;
    CURRENT_DELIVERY_TYPE = label.dataset.type;
    updateGrandTotal();
  });
});
document.querySelector('.delivery-option[data-type="home"]').classList.add('selected');

function currentDeliveryPrice() {
  const rate = Locations.getRate(wilayaSelect.value);
  if (!rate) return 0;
  return CURRENT_DELIVERY_TYPE === 'desk' ? rate.desk_price : rate.home_price;
}

function updateDeliveryPrices() {
  const rate = Locations.getRate(wilayaSelect.value);
  const hint = document.getElementById('selectWilayaHint');
  document.querySelectorAll('.delivery-option').forEach((label) => {
    const priceEl = label.querySelector('.delivery-price');
    if (!rate) {
      priceEl.textContent = '—';
      return;
    }
    const price = label.dataset.type === 'desk' ? rate.desk_price : rate.home_price;
    priceEl.textContent = money(price);
  });
  hint.classList.toggle('hidden', !!rate);
  updateGrandTotal();
}

function updateGrandTotal() {
  const grand = Cart.total() + currentDeliveryPrice();
  document.getElementById('checkoutGrandTotal').textContent = money(grand);
}

// ---------- إتمام الطلب ----------
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (!Cart.get().length) return;
  closeCart();
  updateGrandTotal();
  document.getElementById('checkoutOverlay').classList.remove('hidden');
});
document.getElementById('cancelCheckout').addEventListener('click', () => {
  document.getElementById('checkoutOverlay').classList.add('hidden');
});

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('checkoutError');
  errorEl.classList.add('hidden');

  const payload = {
    customer_name: form.customer_name.value,
    phone: form.phone.value,
    address: form.address.value,
    wilaya_code: Number(wilayaSelect.value),
    commune: communeSelect.value,
    delivery_type: CURRENT_DELIVERY_TYPE,
    items: Cart.get().map((i) => ({ id: i.id, qty: i.qty, variant_id: i.variant_id || undefined })),
  };

  if (!payload.wilaya_code || !payload.commune) {
    errorEl.textContent = 'الرجاء اختيار الولاية والبلدية';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'حدث خطأ');

    Cart.clear();
    document.getElementById('checkoutOverlay').classList.add('hidden');
    form.reset();
    communeSelect.disabled = true;
    communeSelect.innerHTML = '<option value="">البلدية...</option>';
    showToast(`تم إرسال طلبك بنجاح 🎉 رقم الطلب: ${data.order_id}`);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

// ---------- البحث ----------
let searchTimeout;
function handleSearch(value) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    SEARCH_QUERY = value.trim();
    loadProducts();
  }, 350);
}
document.getElementById('searchInput').addEventListener('input', (e) => handleSearch(e.target.value));
document.getElementById('searchInputMobile').addEventListener('input', (e) => handleSearch(e.target.value));

// ---------- تشغيل ----------
(async function init() {
  await loadCategories();
  await loadProducts();
})();
