const fs = require('fs');
let js = fs.readFileSync('public/js/admin.js', 'utf8');

// Replace openCategoryModal and its submit listener
const oldCategoryCode = js.match(/function openCategoryModal[\s\S]*?errorEl\.classList\.remove\('hidden'\);\n  \}\n\}\);/)[0];

const newCategoryCode = `let CATEGORY_MODAL_EDIT_ID = null;

function openCategoryModal(parentId = null, parentName = null, editId = null, currentName = null) {
  CATEGORY_MODAL_PARENT = parentId;
  CATEGORY_MODAL_EDIT_ID = editId;
  const form = document.getElementById('categoryForm');
  form.reset();
  
  if (editId) {
    document.getElementById('categoryModalTitle').textContent = \`تعديل التصنيف: "\${currentName}"\`;
    form.name.value = currentName;
  } else {
    document.getElementById('categoryModalTitle').textContent = parentId
      ? \`إضافة تصنيف فرعي داخل "\${parentName}"\`
      : 'إضافة تصنيف رئيسي';
  }
  
  document.getElementById('categoryFormError').classList.add('hidden');
  document.getElementById('categoryModal').classList.remove('hidden');
}

document.getElementById('addRootCategoryBtn')?.addEventListener('click', () => openCategoryModal(null));
document.getElementById('closeCategoryModal')?.addEventListener('click', () => document.getElementById('categoryModal').classList.add('hidden'));

document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('categoryFormError');
  errorEl.classList.add('hidden');
  try {
    const url = CATEGORY_MODAL_EDIT_ID ? \`/api/categories/\${CATEGORY_MODAL_EDIT_ID}\` : '/api/categories';
    const method = CATEGORY_MODAL_EDIT_ID ? 'PUT' : 'POST';
    const bodyData = CATEGORY_MODAL_EDIT_ID 
      ? { name: form.name.value } 
      : { name: form.name.value, parent_id: CATEGORY_MODAL_PARENT };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('categoryModal').classList.add('hidden');
    showToast(CATEGORY_MODAL_EDIT_ID ? 'تم تعديل التصنيف بنجاح ✅' : 'تمت إضافة التصنيف بنجاح ✅');
    loadCategoryTree();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});`;

js = js.replace(oldCategoryCode, newCategoryCode);

// Now replace renderCategoryNode
const oldRender = js.match(/function renderCategoryNode[\s\S]*?container\.appendChild\(wrap\);\n\}/)[0];
const newRender = `function renderCategoryNode(cat, container) {
  const wrap = document.createElement('div');
  wrap.className = 'border-r-2 border-ink/10 pr-3';
  wrap.innerHTML = \`
    <div class="flex items-center justify-between bg-sand rounded-lg px-3 py-2 mb-2 border border-ink/10">
      <span class="font-bold text-sm">\${escapeHtml(cat.name)}</span>
      <div class="flex gap-2">
        <button class="add-sub-btn text-xs bg-forest text-white w-6 h-6 rounded-full font-black" title="إضافة تصنيف فرعي">+</button>
        <button class="edit-cat-btn text-xs text-ink/70 hover:text-ink font-bold px-1" title="تعديل التصنيف">✏️</button>
        <button class="del-cat-btn text-xs text-terracotta font-extrabold px-1" title="حذف التصنيف">🗑️</button>
      </div>
    </div>
    <div class="children pr-4 space-y-2"></div>
  \`;
  wrap.querySelector('.add-sub-btn').addEventListener('click', () => openCategoryModal(cat.id, cat.name));
  wrap.querySelector('.edit-cat-btn').addEventListener('click', () => openCategoryModal(null, null, cat.id, cat.name));
  wrap.querySelector('.del-cat-btn').addEventListener('click', () => deleteCategory(cat.id, cat.name));

  const childrenContainer = wrap.querySelector('.children');
  for (const child of cat.children || []) {
    renderCategoryNode(child, childrenContainer);
  }
  container.appendChild(wrap);
}`;

js = js.replace(oldRender, newRender);

fs.writeFileSync('public/js/admin.js', js);
console.log('Categories edit UI updated.');
