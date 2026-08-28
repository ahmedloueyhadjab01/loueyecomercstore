function money(n) { return `${Number(n).toLocaleString('ar-DZ')} دج`; }
function escapeHtml(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  t.style.background = isError ? '#C1443C' : '#1E6F54';
  t.style.borderColor = isError ? '#9A332C' : '#123F30';
  setTimeout(() => t.classList.add('hidden'), 2500);
}

// ---------- إدارة شاشات المصادقة (تسجيل، دخول، OTP، استعادة) ----------

function showAuthCard(cardId) {
  ['loginCard', 'registerCard', 'otpCard', 'forgotCard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById(cardId);
  if (target) target.classList.remove('hidden');
}

// التنقل بين الشاشات
document.getElementById('toRegisterBtn')?.addEventListener('click', () => showAuthCard('registerCard'));
document.getElementById('toForgotBtn')?.addEventListener('click', () => showAuthCard('forgotCard'));
document.getElementById('toLoginFromRegisterBtn')?.addEventListener('click', () => showAuthCard('loginCard'));
document.getElementById('toLoginFromForgotBtn')?.addEventListener('click', () => showAuthCard('loginCard'));
document.getElementById('backToLoginFromOtp')?.addEventListener('click', () => showAuthCard('loginCard'));

async function checkSession() {
  const res = await fetch('/api/auth/me');
  if (res.ok) {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    initDashboard();
  }
}

// 1. تسجيل الدخول (يقبل اسم المستخدم أو الإيميل)
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('loginError');
  errorEl.classList.add('hidden');
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username.value, password: form.password.value }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403 && data.need_verification) {
        // إذا كان الحساب غير مفعل، توجيهه لصفحة OTP
        document.getElementById('otpFormEmail').value = data.email;
        document.getElementById('otpEmailTarget').textContent = data.email;
        document.getElementById('otpFormType').value = 'register';
        showAuthCard('otpCard');
        showToast('حسابك يحتاج تفعيل. أدخل الرمز المرسل لإيميلك', true);
        return;
      }
      throw new Error(data.error || 'تعذّر تسجيل الدخول');
    }
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    initDashboard();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

// 2. تسجيل تاجر جديد (إرسال OTP)
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('registerError');
  errorEl.classList.add('hidden');
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_name: form.store_name.value.trim(),
        username: form.username.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // توجيه المستخدم لصفحة إدخال رمز التحقق OTP
    document.getElementById('otpFormEmail').value = form.email.value.trim();
    document.getElementById('otpEmailTarget').textContent = form.email.value.trim();
    document.getElementById('otpFormType').value = 'register';
    showAuthCard('otpCard');
    showToast('تم إرسال رمز التحقق إلى إيميلك 📩');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

// 3. تأكيد رمز التحقق (OTP)
document.getElementById('otpForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('otpError');
  errorEl.classList.add('hidden');
  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email.value,
        code: form.code.value.trim(),
        type: form.type.value,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showToast(data.message || 'تم التفعيل بنجاح! ✨');
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    initDashboard();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

// إعادة إرسال رمز OTP
document.getElementById('resendOtpBtn').addEventListener('click', async () => {
  const email = document.getElementById('otpFormEmail').value;
  const type = document.getElementById('otpFormType').value;
  if (!email) return;
  try {
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast('تمت إعادة إرسال الرمز بنجاح 📩');
  } catch (err) {
    showToast(err.message, true);
  }
});

// 4. نسيت كلمة السر - خطوة 1: طلب الرمز
document.getElementById('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('forgotError');
  errorEl.classList.add('hidden');
  try {
    const email = form.email.value.trim();
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    document.getElementById('resetEmail').value = email;
    form.classList.add('hidden');
    document.getElementById('resetPasswordForm').classList.remove('hidden');
    showToast('تم إرسال رمز التحقق إلى بريدك الإلكتروني 🔑');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

// 4. نسيت كلمة السر - خطوة 2: إدخال الرمز وكلمة السر الجديدة
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('resetError');
  errorEl.classList.add('hidden');
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email.value,
        code: form.code.value.trim(),
        new_password: form.new_password.value,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    showToast('تم تغيير كلمة السر بنجاح! يمكنك الآن تسجيل الدخول.');
    form.reset();
    document.getElementById('forgotForm').reset();
    document.getElementById('forgotForm').classList.remove('hidden');
    form.classList.add('hidden');
    showAuthCard('loginCard');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  location.reload();
});

document.getElementById('deleteAccountBtn')?.addEventListener('click', async () => {
  const confirmDelete = confirm('⚠️ هل أنت أصلًا متأكد من حذف حسابك والقيام بهذه الخطوة؟\n\nسيتم حذف متجرك وحسابك نهائيًا وفك أي ارتباط مع البريد الإلكتروني، ولا يمكن استعادة الحساب بعد الحذف.');
  if (!confirmDelete) return;

  try {
    const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذّر حذف الحساب');

    alert(data.message || 'تم حذف حسابك نهائياً.');
    location.reload();
  } catch (err) {
    showToast(err.message, true);
  }
});

// ---------- التبويبات ----------
function initDashboard() {
  document.querySelectorAll('.admin-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach((b) => b.classList.remove('active-tab'));
      btn.classList.add('active-tab');
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.add('hidden'));
      document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
    });
  });
  document.querySelector('.admin-tab-btn').classList.add('active-tab');

  loadCategoryTree();
  loadProducts();
  loadOrders();
  loadDeliveryRates();
  loadFeedUrls();
  loadSocialSettings();
  loadProfit30d();
}

function loadFeedUrls() {
  const base = location.origin;
  document.getElementById('fbFeedUrl').textContent = `${base}/api/feed/facebook.xml`;
  document.getElementById('ttFeedUrl').textContent = `${base}/api/feed/tiktok.csv`;
}

// ---------- روابط التواصل الاجتماعي ----------
async function loadSocialSettings() {
  const res = await fetch('/api/settings/social');
  if (!res.ok) return;
  const data = await res.json();
  const form = document.getElementById('socialForm');
  for (const key in data) {
    if (form[key]) form[key].value = data[key] || '';
  }
}

document.getElementById('socialForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('socialFormError');
  errorEl.classList.add('hidden');
  const payload = {
    social_whatsapp: form.social_whatsapp.value.trim(),
    social_instagram: form.social_instagram.value.trim(),
    social_facebook: form.social_facebook.value.trim(),
    social_tiktok: form.social_tiktok.value.trim(),
    social_telegram: form.social_telegram.value.trim(),
  };
  try {
    const res = await fetch('/api/settings/social', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر الحفظ');
    showToast('تم حفظ روابط التواصل الاجتماعي ✅');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

// ---------- التصنيفات (زر +) ----------
let CATEGORY_MODAL_PARENT = null;

function renderCategoryNode(cat, container) {
  const wrap = document.createElement('div');
  wrap.className = 'border-r-2 border-ink/10 pr-3';
  wrap.innerHTML = `
    <div class="flex items-center justify-between bg-sand rounded-lg px-3 py-2 mb-2 border border-ink/10">
      <span class="font-bold text-sm">${escapeHtml(cat.name)}</span>
      <div class="flex gap-2">
        <button class="add-sub-btn text-xs bg-forest text-white w-6 h-6 rounded-full font-black" title="إضافة تصنيف فرعي">+</button>
        <button class="del-cat-btn text-xs text-terracotta font-extrabold">حذف</button>
      </div>
    </div>
    <div class="children pr-4 space-y-2"></div>
  `;
  wrap.querySelector('.add-sub-btn').addEventListener('click', () => openCategoryModal(cat.id, cat.name));
  wrap.querySelector('.del-cat-btn').addEventListener('click', () => deleteCategory(cat.id, cat.name));

  const childrenContainer = wrap.querySelector('.children');
  for (const child of cat.children || []) {
    renderCategoryNode(child, childrenContainer);
  }
  container.appendChild(wrap);
}

async function loadCategoryTree() {
  const res = await fetch('/api/categories');
  const tree = await res.json();
  const container = document.getElementById('categoryTree');
  container.innerHTML = '';
  if (!tree.length) {
    container.innerHTML = '<p class="text-ink/40 text-sm font-bold">لا توجد تصنيفات بعد. اضغط "+ إضافة تصنيف رئيسي" للبدء.</p>';
  }
  for (const cat of tree) renderCategoryNode(cat, container);

  const flat = flattenForSelect(tree);
  const select = document.getElementById('productCategorySelect');
  select.innerHTML = '<option value="">بدون تصنيف</option>' + flat.map(c =>
    `<option value="${c.id}">${'　'.repeat(c.depth)}${escapeHtml(c.name)}</option>`).join('');
}

function flattenForSelect(tree, depth = 0) {
  let out = [];
  for (const c of tree) {
    out.push({ id: c.id, name: c.name, depth });
    out = out.concat(flattenForSelect(c.children || [], depth + 1));
  }
  return out;
}

function openCategoryModal(parentId = null, parentName = null) {
  CATEGORY_MODAL_PARENT = parentId;
  document.getElementById('categoryModalTitle').textContent = parentId
    ? `إضافة تصنيف فرعي داخل "${parentName}"`
    : 'إضافة تصنيف رئيسي';
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryFormError').classList.add('hidden');
  document.getElementById('categoryModal').classList.remove('hidden');
}

document.getElementById('addRootCategoryBtn').addEventListener('click', () => openCategoryModal(null));
document.getElementById('closeCategoryModal').addEventListener('click', () => document.getElementById('categoryModal').classList.add('hidden'));

document.getElementById('categoryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('categoryFormError');
  errorEl.classList.add('hidden');
  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name.value, parent_id: CATEGORY_MODAL_PARENT }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('categoryModal').classList.add('hidden');
    showToast('تمت إضافة التصنيف بنجاح ✅');
    loadCategoryTree();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

async function deleteCategory(id, name) {
  if (!confirm(`حذف التصنيف "${name}" وكل ما بداخله من تصنيفات فرعية؟`)) return;
  const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  if (res.ok) { showToast('تم الحذف'); loadCategoryTree(); }
  else showToast('تعذر الحذف', true);
}

// ---------- المنتجات ----------
async function loadProducts() {
  const res = await fetch('/api/products/admin/all');
  const products = await res.json();
  const table = document.getElementById('productsTable');

  if (!products.length) {
    table.innerHTML = '<p class="p-6 text-ink/40 text-sm font-bold">لا توجد منتجات بعد.</p>';
    return;
  }

  table.innerHTML = `
    <table class="w-full text-sm">
      <thead class="bg-sand text-ink/60">
        <tr>
          <th class="p-3 text-right">الصورة</th>
          <th class="p-3 text-right">الاسم</th>
          <th class="p-3 text-right">السعر</th>
          <th class="p-3 text-right">المخزون</th>
          <th class="p-3 text-right">الحالة</th>
          <th class="p-3 text-right">إجراءات</th>
        </tr>
      </thead>
      <tbody id="productsTbody"></tbody>
    </table>
  `;
  const tbody = document.getElementById('productsTbody');
  for (const p of products) {
    const tr = document.createElement('tr');
    tr.className = 'border-t border-ink/10';
    tr.innerHTML = `
      <td class="p-3"><img src="${p.image || '/img/placeholder.svg'}" class="w-10 h-10 object-cover rounded-lg bg-sand border border-ink/10" /></td>
      <td class="p-3 font-bold">${escapeHtml(p.name)}</td>
      <td class="p-3">${money(p.price)}</td>
      <td class="p-3">${p.stock}${p.has_variants ? ' <span class="text-[10px] bg-gold/20 text-gold border border-gold/40 rounded-full px-2 py-0.5 font-bold">مقاسات</span>' : ''}</td>
      <td class="p-3">${p.is_active ? '<span class="text-forest font-bold">مفعّل</span>' : '<span class="text-ink/40">معطّل</span>'}</td>
      <td class="p-3 flex gap-2">
        <button class="edit-btn text-forest font-extrabold">تعديل</button>
        <button class="del-btn text-terracotta font-extrabold">حذف</button>
      </td>
    `;
    tr.querySelector('.edit-btn').addEventListener('click', () => openProductModal(p));
    tr.querySelector('.del-btn').addEventListener('click', () => deleteProduct(p.id, p.name));
    tbody.appendChild(tr);
  }
}

let RESTOCK_PRODUCT = null;
let RESTOCK_VARIANT = null; // إن كانت null فالتزويد للمنتج نفسه، وإلا فللمتغيّر المحدَّد
let VARIANT_ROW_ID = 0;

function addVariantRow(label = '', qty = '', cost = '') {
  const id = `vrow-${VARIANT_ROW_ID++}`;
  const row = document.createElement('div');
  row.className = 'grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center';
  row.dataset.rowId = id;
  row.innerHTML = `
    <input class="v-label field px-2 py-1.5 text-xs" placeholder="مثال: 42" value="${escapeHtml(label)}" />
    <input class="v-qty field px-2 py-1.5 text-xs" type="number" min="0" placeholder="الكمية" value="${qty}" />
    <input class="v-cost field px-2 py-1.5 text-xs" type="number" step="0.01" min="0" placeholder="سعر الشراء" value="${cost}" />
    <button type="button" class="v-remove text-terracotta font-extrabold text-xs px-1">حذف</button>
  `;
  row.querySelector('.v-remove').addEventListener('click', () => row.remove());
  document.getElementById('variantRows').appendChild(row);
}

document.getElementById('hasVariantsCheckbox').addEventListener('change', (e) => {
  const builder = document.getElementById('variantsBuilder');
  const stockFields = document.getElementById('stockFieldsNew');
  if (e.target.checked) {
    builder.classList.remove('hidden');
    stockFields.classList.add('hidden');
    if (!document.getElementById('variantRows').children.length) addVariantRow();
  } else {
    builder.classList.add('hidden');
    stockFields.classList.remove('hidden');
  }
});
document.getElementById('addVariantRowBtn').addEventListener('click', () => addVariantRow());

function openProductModal(product = null) {
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('productFormError').classList.add('hidden');
  document.getElementById('productModalTitle').textContent = product ? 'تعديل المنتج' : 'منتج جديد';
  form.id.value = product ? product.id : '';

  const newFields = document.getElementById('stockFieldsNew');
  const editSummary = document.getElementById('stockSummaryEdit');
  const variantsToggleWrap = document.getElementById('variantsToggleWrap');
  const variantsBuilder = document.getElementById('variantsBuilder');
  const variantsEditPanel = document.getElementById('variantsEditPanel');
  document.getElementById('variantRows').innerHTML = '';
  document.getElementById('hasVariantsCheckbox').checked = false;

  if (product) {
    form.name.value = product.name;
    form.description.value = product.description || '';
    form.price.value = product.price;
    form.compare_price.value = product.compare_price || '';
    form.sku.value = product.sku || '';
    form.category_id.value = product.category_id || '';
    form.is_active.checked = !!product.is_active;

    // المخزون لا يُعدَّل من هنا أبدًا (يمنع الكتابة فوق قيمة قد تكون تغيّرت في الخلفية)
    newFields.classList.add('hidden');
    variantsToggleWrap.classList.add('hidden');
    variantsBuilder.classList.add('hidden');
    RESTOCK_PRODUCT = product;

    if (product.has_variants) {
      editSummary.classList.add('hidden');
      variantsEditPanel.classList.remove('hidden');
      renderVariantsEditPanel(product);
    } else {
      editSummary.classList.remove('hidden');
      variantsEditPanel.classList.add('hidden');
      document.getElementById('stockSummaryValue').textContent = product.stock;
    }
  } else {
    newFields.classList.remove('hidden');
    variantsToggleWrap.classList.remove('hidden');
    variantsBuilder.classList.add('hidden');
    editSummary.classList.add('hidden');
    variantsEditPanel.classList.add('hidden');
    RESTOCK_PRODUCT = null;
  }
  document.getElementById('productModal').classList.remove('hidden');
}
document.getElementById('newProductBtn').addEventListener('click', () => openProductModal());
document.getElementById('closeProductModal').addEventListener('click', () => document.getElementById('productModal').classList.add('hidden'));

function renderVariantsEditPanel(product) {
  const list = document.getElementById('variantsEditList');
  const variants = product.variants || [];
  if (!variants.length) {
    list.innerHTML = '<p class="text-xs text-ink/40">لا توجد مقاسات بعد.</p>';
  } else {
    list.innerHTML = variants.map(v => `
      <div class="flex items-center justify-between bg-white rounded-lg border border-ink/10 px-3 py-2 text-sm">
        <span class="font-bold">${escapeHtml(v.label)} <span class="text-ink/40 font-normal text-xs">— المخزون: ${v.stock}</span></span>
        <div class="flex gap-3">
          <button type="button" class="v-restock-btn text-forest font-extrabold text-xs" data-vid="${v.id}" data-label="${escapeHtml(v.label)}" data-stock="${v.stock}">+ تزويد</button>
          <button type="button" class="v-delete-btn text-terracotta font-extrabold text-xs" data-vid="${v.id}" data-label="${escapeHtml(v.label)}" data-stock="${v.stock}">حذف</button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('.v-restock-btn').forEach(btn => {
      btn.addEventListener('click', () => openRestockModal(product, { id: btn.dataset.vid, label: btn.dataset.label, stock: btn.dataset.stock }));
    });
    list.querySelectorAll('.v-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteVariant(product.id, btn.dataset.vid, btn.dataset.label, Number(btn.dataset.stock)));
    });
  }
}

async function deleteVariant(productId, variantId, label, stock) {
  if (stock > 0) {
    showToast(`زوّد "${label}" إلى صفر أولًا قبل حذفه`, true);
    return;
  }
  if (!confirm(`حذف المقاس "${label}" نهائيًا؟`)) return;
  const res = await fetch(`/api/products/${productId}/variants/${variantId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) { showToast(data.error || 'تعذر الحذف', true); return; }
  showToast('تم حذف المقاس');
  RESTOCK_PRODUCT = data;
  renderVariantsEditPanel(data);
  loadProducts();
}

document.getElementById('addNewVariantBtn').addEventListener('click', async () => {
  if (!RESTOCK_PRODUCT) return;
  const label = document.getElementById('newVariantLabel').value.trim();
  const qty = document.getElementById('newVariantQty').value || 0;
  const cost = document.getElementById('newVariantCost').value || 0;
  if (!label) { showToast('اكتب اسم المقاس/الحجم أولًا', true); return; }
  const res = await fetch(`/api/products/${RESTOCK_PRODUCT.id}/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, qty, cost_price: cost }),
  });
  const data = await res.json();
  if (!res.ok) { showToast(data.error || 'تعذر الإضافة', true); return; }
  showToast('تمت إضافة المقاس ✅');
  document.getElementById('newVariantLabel').value = '';
  document.getElementById('newVariantQty').value = '';
  document.getElementById('newVariantCost').value = '';
  RESTOCK_PRODUCT = data;
  renderVariantsEditPanel(data);
  loadProducts();
});

function openRestockModal(product, variant = null) {
  RESTOCK_PRODUCT = product;
  RESTOCK_VARIANT = variant;
  document.getElementById('restockForm').reset();
  document.getElementById('restockFormError').classList.add('hidden');
  document.getElementById('restockProductName').textContent = variant
    ? `${product.name} — مقاس ${variant.label} — المخزون الحالي: ${variant.stock} قطعة`
    : `${product.name} — المخزون الحالي: ${product.stock} قطعة`;
  document.getElementById('restockModal').classList.remove('hidden');
}
document.getElementById('openRestockBtn').addEventListener('click', () => {
  if (!RESTOCK_PRODUCT) return;
  openRestockModal(RESTOCK_PRODUCT, null);
});
document.getElementById('closeRestockModal').addEventListener('click', () => document.getElementById('restockModal').classList.add('hidden'));

document.getElementById('restockForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!RESTOCK_PRODUCT) return;
  const form = e.target;
  const errorEl = document.getElementById('restockFormError');
  errorEl.classList.add('hidden');
  const url = RESTOCK_VARIANT
    ? `/api/products/${RESTOCK_PRODUCT.id}/variants/${RESTOCK_VARIANT.id}/restock`
    : `/api/products/${RESTOCK_PRODUCT.id}/restock`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty: form.qty.value, cost_price: form.cost_price.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('restockModal').classList.add('hidden');
    if (RESTOCK_VARIANT) {
      RESTOCK_PRODUCT = data;
      renderVariantsEditPanel(data);
      showToast('تم تزويد المقاس ✅');
    } else {
      document.getElementById('productModal').classList.add('hidden');
      showToast(`تم تزويد المخزون ✅ الكمية الآن: ${data.stock}`);
    }
    loadProducts();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('productFormError');
  errorEl.classList.add('hidden');

  const id = form.id.value;
  const fd = new FormData(form);
  fd.set('is_active', form.is_active.checked ? 'true' : 'false');

  // عند إنشاء منتج جديد بمقاسات/أحجام، نجمع الصفوف ونرسلها كـ JSON بدل الحقول المفردة
  if (!id && document.getElementById('hasVariantsCheckbox').checked) {
    const rows = Array.from(document.querySelectorAll('#variantRows > div'));
    const variants = rows.map(row => ({
      label: row.querySelector('.v-label').value.trim(),
      stock: row.querySelector('.v-qty').value || 0,
      cost_price: row.querySelector('.v-cost').value || 0,
    })).filter(v => v.label);
    if (!variants.length) {
      errorEl.textContent = 'أضف مقاسًا واحدًا على الأقل أو ألغِ تفعيل خيار المقاسات';
      errorEl.classList.remove('hidden');
      return;
    }
    fd.set('variants', JSON.stringify(variants));
    fd.delete('stock');
    fd.delete('cost_price');
  }

  try {
    const res = await fetch(id ? `/api/products/${id}` : '/api/products', {
      method: id ? 'PUT' : 'POST',
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('productModal').classList.add('hidden');
    showToast('تم الحفظ بنجاح ✅');
    loadProducts();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

async function deleteProduct(id, name) {
  if (!confirm(`حذف المنتج "${name}"؟`)) return;
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (res.ok) { showToast('تم الحذف'); loadProducts(); }
  else showToast('تعذر الحذف', true);
}

// ---------- الأرباح 30 يوم ----------
async function loadProfit30d() {
  const res = await fetch('/api/orders/profit-30d');
  if (!res.ok) return;
  const d = await res.json();

  document.getElementById('profitRevenue').textContent = money(d.revenue);
  document.getElementById('profitCogs').textContent = `- ${money(d.cost_of_goods)}`;
  document.getElementById('profitShipping').textContent = `- ${money(d.shipping_cost)}`;
  const netEl = document.getElementById('profitNet');
  netEl.textContent = money(d.net_profit);
  netEl.style.color = d.net_profit >= 0 ? '#1E6F54' : '#2F6690';
  document.getElementById('profitMeta').textContent =
    `${d.delivered_orders} طلب مُسلَّم، ${d.units_sold} قطعة مباعة خلال آخر ${d.period_days} يومًا`;

  const container = document.getElementById('profitTopProducts');
  if (!d.top_products.length) {
    container.innerHTML = '<p class="p-6 text-ink/40 text-sm font-bold">لا توجد مبيعات مُسلَّمة خلال آخر 30 يومًا بعد.</p>';
    return;
  }
  container.innerHTML = `
    <table class="w-full text-sm">
      <thead class="bg-sand text-ink/60">
        <tr>
          <th class="p-3 text-right">المنتج</th>
          <th class="p-3 text-right">الكمية المباعة</th>
          <th class="p-3 text-right">المبيعات</th>
          <th class="p-3 text-right">الربح</th>
        </tr>
      </thead>
      <tbody>
        ${d.top_products.map(p => `
          <tr class="border-t border-ink/10">
            <td class="p-3 font-bold">${escapeHtml(p.name)}</td>
            <td class="p-3">${p.qty}</td>
            <td class="p-3">${money(p.revenue)}</td>
            <td class="p-3 font-extrabold" style="color:${p.profit >= 0 ? '#1E6F54' : '#2F6690'}">${money(p.profit)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ---------- الطلبات ----------
let ALL_ORDERS = [];
let ORDER_FILTER = 'active';

async function loadOrders() {
  const res = await fetch('/api/orders');
  if (!res.ok) return;
  ALL_ORDERS = await res.json();
  renderOrdersTable();
  loadOrderStats();
    loadProfit30d();
}

async function loadOrderStats() {
  const res = await fetch('/api/orders/stats');
  if (!res.ok) return;
  const s = await res.json();
  document.getElementById('statSales').textContent = money(s.total_sales);
  document.getElementById('statShipping').textContent = `- ${money(s.total_shipping_cost)}`;
  const netEl = document.getElementById('statNet');
  netEl.textContent = money(s.net_profit);
  netEl.style.color = s.net_profit >= 0 ? '#1E6F54' : '#2F6690';

  const cancelledAfterShipping = s.counts.cancelled_after_shipping || 0;
  const noteEl = document.getElementById('statCancelledAfterShipping');
  noteEl.textContent = cancelledAfterShipping > 0
    ? `منها ${cancelledAfterShipping} طلب شُحن ثم أُلغي (خسارة الشحن محتسبة رغم الإلغاء)`
    : '';
}

document.querySelectorAll('.order-filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.order-filter-btn').forEach((b) => b.classList.remove('active-cat'));
    btn.classList.add('active-cat');
    ORDER_FILTER = btn.dataset.orderfilter;
    renderOrdersTable();
  });
});

function filteredOrders() {
  if (ORDER_FILTER === 'delivered') return ALL_ORDERS.filter((o) => o.status === 'تم التسليم');
  if (ORDER_FILTER === 'cancelled') return ALL_ORDERS.filter((o) => o.status === 'ملغي');
  if (ORDER_FILTER === 'all') return ALL_ORDERS;
  // active: كل ما عدا المسلَّم (مؤرشف) والملغي
  return ALL_ORDERS.filter((o) => o.status !== 'تم التسليم' && o.status !== 'ملغي');
}

function renderOrdersTable() {
  const orders = filteredOrders();
  const table = document.getElementById('ordersTable');

  if (!orders.length) {
    table.innerHTML = '<p class="p-6 text-ink/40 text-sm font-bold">لا توجد طلبات في هذا القسم.</p>';
    return;
  }

  table.innerHTML = `
    <table class="w-full text-sm">
      <thead class="bg-sand text-ink/60">
        <tr>
          <th class="p-3 text-right">#</th>
          <th class="p-3 text-right">العميل</th>
          <th class="p-3 text-right">العنوان</th>
          <th class="p-3 text-right">التوصيل</th>
          <th class="p-3 text-right">المنتجات</th>
          <th class="p-3 text-right">الإجمالي</th>
          <th class="p-3 text-right">الحالة</th>
          <th class="p-3 text-right">التاريخ</th>
          <th class="p-3 text-right"></th>
        </tr>
      </thead>
      <tbody id="ordersTbody"></tbody>
    </table>
  `;
  const tbody = document.getElementById('ordersTbody');
  const statuses = ['قيد المعالجة', 'قيد التوصيل', 'تم التسليم', 'ملغي'];
  for (const o of orders) {
    const tr = document.createElement('tr');
    tr.className = 'border-t border-ink/10 align-top';
    const itemsSummary = o.items.map(i => `${escapeHtml(i.name)} × ${i.qty}`).join('<br>');
    const deliveryLabel = o.delivery_type === 'desk' ? 'مكتب البريد 🏤' : 'المنزل 🏠';
    tr.innerHTML = `
      <td class="p-3">${o.id}</td>
      <td class="p-3">${escapeHtml(o.customer_name)}<br><span class="text-xs text-ink/40">${escapeHtml(o.phone)}</span></td>
      <td class="p-3 text-xs">
        <b>${escapeHtml(o.wilaya_name || '')}</b> - ${escapeHtml(o.commune || '')}<br>
        <span class="text-ink/40">${escapeHtml(o.address)}</span>
      </td>
      <td class="p-3 text-xs">
        ${deliveryLabel}<br>
        <span class="text-ink/40">+${money(o.delivery_price)}</span>
      </td>
      <td class="p-3 text-xs">${itemsSummary}</td>
      <td class="p-3 font-extrabold">${money(o.total)}<br><span class="text-xs text-ink/40 font-normal">منتجات: ${money(o.subtotal)}</span></td>
      <td class="p-3">
        <select class="status-select field px-2 py-1 text-xs">
          ${statuses.map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td class="p-3 text-xs text-ink/40">${new Date(o.created_at).toLocaleString('ar-DZ')}</td>
      <td class="p-3"><button class="del-order-btn text-terracotta font-extrabold text-xs">حذف</button></td>
    `;
    tr.querySelector('.status-select').addEventListener('change', async (e) => {
      const previousValue = o.status;
      const res = await fetch(`/api/orders/${o.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: e.target.value }),
      });
      const data = await res.json();
      if (!res.ok) {
        e.target.value = previousValue;
        showToast(data.error || 'تعذر تحديث حالة الطلب', true);
        return;
      }
      o.status = e.target.value;
      showToast('تم تحديث حالة الطلب');
      loadProducts();
      loadOrderStats();
    loadProfit30d();
      renderOrdersTable();
    });
    tr.querySelector('.del-order-btn').addEventListener('click', () => deleteOrder(o.id, o.status));
    tbody.appendChild(tr);
  }
}

async function deleteOrder(id, status) {
  let body = {};

  if (status === 'قيد التوصيل') {
    // هذا الطلب لم يصل للزبون بعد مهما كانت النتيجة، لذا سيعود المخزون حتمًا.
    // لكن تكلفة الشحن تعتمد على إجابتك: هل ذهب المندوب فعليًا ودُفعت التكلفة أم لا؟
    if (!confirm(`حذف الطلب رقم ${id}؟ (سيعود المخزون تلقائيًا لأنه لم يصل للزبون بعد)`)) return;
    const lost = confirm('هل خسرت ثمن التوصيل فعليًا (أي ذهب المندوب ودفعت التكلفة)؟\n\nاضغط "موافق" إذا نعم، أو "إلغاء" إذا لا.');
    body = { lost_shipping_cost: lost };
  } else {
    const warning = status === 'تم التسليم'
      ? `حذف الطلب رقم ${id} نهائيًا؟ (تم تسليمه فعليًا، فلن يُعاد أي مخزون، وستبقى مبيعاته وتكلفة شحنه محتسبة في الأرباح كسجل مؤرشف)`
      : `حذف الطلب رقم ${id} نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`;
    if (!confirm(warning)) return;
  }

  const res = await fetch(`/api/orders/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    showToast('تم حذف الطلب');
    ALL_ORDERS = ALL_ORDERS.filter((o) => o.id !== id);
    renderOrdersTable();
    loadOrderStats();
    loadProfit30d();
    loadProducts();
  } else {
    const data = await res.json().catch(() => ({}));
    showToast(data.error || 'تعذر حذف الطلب', true);
  }
}

// ---------- أسعار التوصيل ----------
let DELIVERY_RATES = [];

async function loadDeliveryRates() {
  const res = await fetch('/api/locations/wilayas');
  DELIVERY_RATES = await res.json();
  renderDeliveryTable(DELIVERY_RATES);
}

function renderDeliveryTable(rates) {
  const container = document.getElementById('deliveryTable');
  container.innerHTML = `
    <table class="w-full text-sm">
      <thead class="bg-sand text-ink/60">
        <tr>
          <th class="p-3 text-right">#</th>
          <th class="p-3 text-right">الولاية</th>
          <th class="p-3 text-right">التوصيل للمنزل (دج)</th>
          <th class="p-3 text-right">التوصيل لمكتب البريد (دج)</th>
        </tr>
      </thead>
      <tbody id="deliveryTbody"></tbody>
    </table>
  `;
  const tbody = document.getElementById('deliveryTbody');
  for (const r of rates) {
    const tr = document.createElement('tr');
    tr.className = 'border-t border-ink/10';
    tr.innerHTML = `
      <td class="p-2 text-xs text-ink/40">${String(r.wilaya_code).padStart(2, '0')}</td>
      <td class="p-2 font-bold">${escapeHtml(r.wilaya_name)}</td>
      <td class="p-2"><input type="number" min="0" step="10" data-code="${r.wilaya_code}" data-field="home_price" value="${r.home_price}" class="field px-2 py-1 text-sm w-28" /></td>
      <td class="p-2"><input type="number" min="0" step="10" data-code="${r.wilaya_code}" data-field="desk_price" value="${r.desk_price}" class="field px-2 py-1 text-sm w-28" /></td>
    `;
    tbody.appendChild(tr);
  }
}

document.getElementById('deliverySearch').addEventListener('input', (e) => {
  const q = e.target.value.trim();
  const filtered = q ? DELIVERY_RATES.filter(r => r.wilaya_name.includes(q)) : DELIVERY_RATES;
  renderDeliveryTable(filtered);
});

document.getElementById('saveDeliveryBtn').addEventListener('click', async () => {
  const inputs = document.querySelectorAll('#deliveryTbody input');
  const map = {};
  inputs.forEach((input) => {
    const code = input.dataset.code;
    map[code] = map[code] || { wilaya_code: Number(code), home_price: 0, desk_price: 0 };
    map[code][input.dataset.field] = Number(input.value) || 0;
  });

  // دمج القيم المعدّلة مع بقية الولايات غير المعروضة حاليًا (بسبب البحث)
  const rateMap = new Map(DELIVERY_RATES.map(r => [r.wilaya_code, r]));
  for (const code in map) {
    rateMap.set(Number(code), { ...rateMap.get(Number(code)), ...map[code] });
  }
  const rates = Array.from(rateMap.values()).map(r => ({
    wilaya_code: r.wilaya_code, home_price: r.home_price, desk_price: r.desk_price,
  }));

  const res = await fetch('/api/locations/wilayas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rates }),
  });
  if (res.ok) {
    showToast('تم حفظ كل أسعار التوصيل ✅');
    loadDeliveryRates();
  } else {
    showToast('تعذر الحفظ', true);
  }
});

checkSession();
