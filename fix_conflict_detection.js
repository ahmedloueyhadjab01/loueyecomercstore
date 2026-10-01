const fs = require("fs");

// =============== Fix product.html ===============
let prod = fs.readFileSync("public/product.html", "utf8");

// 1. Add the conflict modal HTML just before </main>
const conflictModal = `
  <!-- Conflict Modal: saved vs new customer data -->
  <div id="conflictModal" class="hidden fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-right" dir="rtl">
      <h3 class="text-lg font-black text-slate-900 mb-2">اكتشفنا اختلافاً في بياناتك!</h3>
      <p class="text-sm text-slate-500 font-bold mb-5">يبدو أن المعلومات التي أدخلتها مختلفة عن طلب سابق. أي بيانات تريد استخدامها؟</p>
      <div class="space-y-3 mb-5">
        <div id="conflictOldBox" class="p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-700"></div>
        <div id="conflictNewBox" class="p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-700"></div>
      </div>
      <div class="flex gap-3">
        <button id="conflictUseOld" class="flex-1 py-3 rounded-xl bg-slate-100 text-slate-800 font-black text-sm hover:bg-slate-200 transition-colors">استخدم القديمة</button>
        <button id="conflictUseNew" class="flex-1 py-3 rounded-xl bg-[#E52F20] text-white font-black text-sm hover:bg-[#b01d12] transition-colors">استخدم الجديدة</button>
      </div>
    </div>
  </div>
`;

prod = prod.replace("</main>", conflictModal + "\n</main>");

// 2. Replace submitExpressOrder to add conflict detection
const oldSubmit = `    async function submitExpressOrder(e) {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'جاري الإرسال...';
      btn.disabled = true;`;

const newSubmit = `    async function submitExpressOrder(e) {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      
      // Conflict detection: check if current data differs from saved
      const saved = (() => { try { const s = localStorage.getItem('savedCustomer'); return s ? JSON.parse(s) : null; } catch(e){ return null; }})();
      const currentPhone = document.getElementById('expressPhone').value.trim();
      if (saved && saved.phone && currentPhone && saved.phone !== currentPhone) {
        // Show conflict modal
        const modal = document.getElementById('conflictModal');
        document.getElementById('conflictOldBox').innerHTML = '<span class="text-xs text-slate-400 block mb-1">📦 بيانات طلب سابق</span>' + saved.customer_name + ' — ' + saved.phone;
        document.getElementById('conflictNewBox').innerHTML = '<span class="text-xs text-slate-400 block mb-1">✏️ البيانات الجديدة التي أدخلتها</span>' + (document.getElementById('expressName').value || '—') + ' — ' + currentPhone;
        modal.classList.remove('hidden');
        // Wait for user choice
        await new Promise(resolve => {
          document.getElementById('conflictUseOld').onclick = () => {
            // Restore old data into form
            document.getElementById('expressName').value = saved.customer_name || '';
            document.getElementById('expressPhone').value = saved.phone || '';
            document.getElementById('expressAddress').value = saved.address || '';
            modal.classList.add('hidden');
            resolve();
          };
          document.getElementById('conflictUseNew').onclick = () => {
            // Keep current form data, clear saved so next time uses new
            modal.classList.add('hidden');
            resolve();
          };
        });
      }
      
      const originalText = btn.textContent;
      btn.textContent = 'جاري الإرسال...';
      btn.disabled = true;`;

prod = prod.replace(oldSubmit, newSubmit);

fs.writeFileSync("public/product.html", prod, "utf8");
console.log("product.html conflict detection added!");

// =============== Fix store2.js ===============
let store = fs.readFileSync("public/js/store2.js", "utf8");

const oldCheckout = `document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('checkoutError' /* */);
    errorEl.classList.add('hidden');`;

const newCheckout = `document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('checkoutError' /* */);
    errorEl.classList.add('hidden');
    
    // Conflict detection
    const savedC = (() => { try { const s = localStorage.getItem('savedCustomer'); return s ? JSON.parse(s) : null; } catch(e){ return null; }})();
    const currentPhone = (form.phone?.value || '').trim();
    if (savedC && savedC.phone && currentPhone && savedC.phone !== currentPhone) {
      await new Promise(resolve => {
        const oldBox = document.getElementById('conflictOldBox');
        const newBox = document.getElementById('conflictNewBox');
        const modal = document.getElementById('conflictModal');
        if (!modal) { resolve(); return; }
        if (oldBox) oldBox.innerHTML = '<span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">📦 بيانات طلب سابق</span>' + (savedC.customer_name || '') + ' — ' + savedC.phone;
        if (newBox) newBox.innerHTML = '<span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">✏️ البيانات الجديدة</span>' + ((form.customer_name?.value) || '—') + ' — ' + currentPhone;
        modal.classList.remove('hidden');
        document.getElementById('conflictUseOld').onclick = () => {
          if (form.customer_name) form.customer_name.value = savedC.customer_name || '';
          if (form.phone) form.phone.value = savedC.phone || '';
          if (form.address) form.address.value = savedC.address || '';
          modal.classList.add('hidden');
          resolve();
        };
        document.getElementById('conflictUseNew').onclick = () => {
          modal.classList.add('hidden');
          resolve();
        };
      });
    }`;

store = store.replace(oldCheckout, newCheckout);

fs.writeFileSync("public/js/store2.js", store, "utf8");
console.log("store2.js conflict detection added!");
