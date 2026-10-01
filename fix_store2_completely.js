const fs = require("fs");
let store = fs.readFileSync("public/js/store2.js", "utf8");

// 1. Fix loadSavedCustomer to trigger delivery prices properly
const oldLoadCustomer = `async function loadSavedCustomer() {
  try {
    const saved = localStorage.getItem('savedCustomer');
    if (!saved) return;
    const data = JSON.parse(saved);
    const form = document.getElementById('checkoutForm');
    if (form) {
      if (data.customer_name) form.customer_name.value = data.customer_name;
      if (data.phone) form.phone.value = data.phone;
      if (data.address) form.address.value = data.address;
      const wSelect = document.getElementById('custWilaya');
      const cSelect = document.getElementById('custCommune');
      if (wSelect && data.wilaya_code) {
        wSelect.value = data.wilaya_code;
        if (cSelect) {
          cSelect.disabled = false;
          await Locations.loadCommunes(data.wilaya_code, cSelect);
          if (data.commune) cSelect.value = data.commune;
        }
      }
    }
  } catch (e) {}
}`;

const newLoadCustomer = `async function loadSavedCustomer() {
  try {
    const saved = localStorage.getItem('savedCustomer');
    if (!saved) return;
    const data = JSON.parse(saved);
    const form = document.getElementById('checkoutForm');
    if (form) {
      if (data.customer_name) form.customer_name.value = data.customer_name;
      if (data.phone) form.phone.value = data.phone;
      if (data.address) form.address.value = data.address;
      const wSelect = document.getElementById('custWilaya');
      const cSelect = document.getElementById('custCommune');
      if (wSelect && data.wilaya_code) {
        // loadWilayas is synchronous so options are populated
        wSelect.value = String(data.wilaya_code);
        if (wSelect.value) {
          if (cSelect) {
            cSelect.disabled = false;
            await Locations.loadCommunes(data.wilaya_code, cSelect);
            if (data.commune) cSelect.value = data.commune;
          }
          await updateDeliveryPrices();
        }
      }
    }
  } catch (e) { console.error('loadSavedCustomer error:', e); }
}`;

store = store.replace(oldLoadCustomer.replace(/\s+/g, " "), newLoadCustomer); 
// Using simple string replace might fail due to whitespace, let's just do logic

store = store.replace(/async function loadSavedCustomer\(\) \{[\s\S]*?catch \(e\) \{\}\s*\}/, newLoadCustomer);

// Remove root call
store = store.replace("loadSavedCustomer();\n\n// ----------", "// ----------");
store = store.replace("loadSavedCustomer();\r\n\r\n// ----------", "// ----------");

// Add it to checkout open instead
store = store.replace(
  `document.getElementById('checkoutBtn')?.addEventListener('click', () => {`,
  `document.getElementById('checkoutBtn')?.addEventListener('click', async () => {`
);

store = store.replace(
  `document.getElementById('checkoutOverlay').classList.remove('hidden');\n});`,
  `document.getElementById('checkoutOverlay').classList.remove('hidden');\n  await loadSavedCustomer();\n});`
);
store = store.replace(
  `document.getElementById('checkoutOverlay').classList.remove('hidden');\r\n  });`,
  `document.getElementById('checkoutOverlay').classList.remove('hidden');\r\n  await loadSavedCustomer();\r\n  });`
);

// Conflict detection logic for store2.js
const oldSubmit = `document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('checkoutError' /* */);
  errorEl.classList.add('hidden');

  const submitBtn = form.querySelector('button[type="submit"]');`;

const newSubmit = `document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('checkoutError' /* */);
  errorEl.classList.add('hidden');

  // Conflict detection
  const savedC = (() => { try { const s = localStorage.getItem('savedCustomer'); return s ? JSON.parse(s) : null; } catch(err){ return null; }})();
  const currentPhone = (form.phone?.value || '').trim();
  if (savedC && savedC.phone && currentPhone && savedC.phone !== currentPhone) {
    await new Promise(resolve => {
      const modal = document.getElementById('conflictModal');
      if (!modal) { resolve(); return; }
      const oldBox = document.getElementById('conflictOldBox');
      const newBox = document.getElementById('conflictNewBox');
      
      if (oldBox) oldBox.innerHTML = '<span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">📦 بيانات طلب سابق</span>' + (savedC.customer_name || '') + ' — ' + savedC.phone;
      if (newBox) newBox.innerHTML = '<span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">✏️ البيانات الجديدة</span>' + ((form.customer_name?.value) || '—') + ' — ' + currentPhone;
      
      modal.style.display = 'flex';
      
      document.getElementById('conflictUseOld').onclick = () => {
        if (form.customer_name) form.customer_name.value = savedC.customer_name || '';
        if (form.phone) form.phone.value = savedC.phone || '';
        if (form.address) form.address.value = savedC.address || '';
        modal.style.display = 'none';
        resolve();
      };
      document.getElementById('conflictUseNew').onclick = () => {
        modal.style.display = 'none';
        resolve();
      };
    });
  }

  const submitBtn = form.querySelector('button[type="submit"]');`;

store = store.replace(/document\.getElementById\('checkoutForm'\)\?\.addEventListener\('submit', async \(e\) => \{[\s\S]*?const submitBtn = form\.querySelector\('button\[type="submit"\]'\);/, newSubmit);

fs.writeFileSync("public/js/store2.js", store, "utf8");
console.log("store2.js completely fixed with pure CSS modals and conflict detection!");
