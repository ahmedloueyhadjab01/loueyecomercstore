const fs = require('fs');
let js = fs.readFileSync('public/js/admin.js', 'utf8');

const oldFunc = `  function applyRetailState() {
    if (isRetail) {
      // وضع التجزئة: أخفِ الـ input، ضع القيمة 1
      wrap.classList.add('hidden');
      input.removeAttribute('required');
      input.value = 1;
      if (label) label.textContent = 'بيع بالحبة (ديطاي)';
      btn.textContent = '📦 البيع بالجملة';
      btn.className = 'text-[11px] font-black px-2 py-0.5 rounded transition-all cursor-pointer border-2 text-forest border-forest bg-forest/10 hover:bg-forest/20';
    } else {
      // وضع الجملة: أظهر الـ input
      wrap.classList.remove('hidden');
      input.setAttribute('required', '');
      if (label) label.textContent = 'عدد القطع بالعبوة';
      btn.textContent = '🏷️ البيع بالحبة';
      btn.className = 'text-[11px] font-black px-2 py-0.5 rounded transition-all cursor-pointer border-2 text-rose-700 border-rose-300 bg-rose-50 hover:bg-rose-100';
    }
  }`;

const newFunc = `  function applyRetailState() {
    if (isRetail) {
      // وضع التجزئة: أخفِ الـ input، ضع القيمة 1
      wrap.classList.add('hidden');
      input.removeAttribute('required');
      input.value = 1;
      if (label) label.textContent = 'بيع بالحبة (ديطاي)';
      btn.textContent = '🏷️ البيع بالحبة';
      btn.className = 'text-[11px] font-black px-2 py-0.5 rounded transition-all cursor-pointer border-2 text-rose-700 border-rose-300 bg-rose-50 hover:bg-rose-100';
    } else {
      // وضع الجملة: أظهر الـ input
      wrap.classList.remove('hidden');
      input.setAttribute('required', '');
      if (label) label.textContent = 'عدد القطع بالعبوة';
      btn.textContent = '📦 البيع بالجملة';
      btn.className = 'text-[11px] font-black px-2 py-0.5 rounded transition-all cursor-pointer border-2 text-forest border-forest bg-forest/10 hover:bg-forest/20';
    }
  }`;

js = js.replace(oldFunc, newFunc);
fs.writeFileSync('public/js/admin.js', js);
console.log("Admin.js UI button text swapped successfully.");
