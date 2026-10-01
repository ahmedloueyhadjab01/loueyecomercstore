const fs = require("fs");
let content = fs.readFileSync("public/js/store2.js", "utf8");

const startStr = "const currentPhone = (form.phone?.value || '').trim();";
const endStr = "const submitBtn = form.querySelector('button[type=\"submit\"]');";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newCode = `const currentPhone = (form.phone?.value || '').trim();
  const currentWilaya = parseInt(form.wilaya_code?.value, 10);
  const currentAddress = (form.address?.value || '').trim();
  
  const phoneChanged = savedC && savedC.phone && currentPhone && savedC.phone !== currentPhone;
  const wilayaChanged = savedC && savedC.wilaya_code && currentWilaya && parseInt(savedC.wilaya_code, 10) !== currentWilaya;
  const addressChanged = savedC && savedC.address && currentAddress && savedC.address !== currentAddress;

  if (phoneChanged || wilayaChanged || addressChanged) {
    await new Promise(resolve => {
      const modal = document.getElementById('conflictModal');
      if (!modal) { resolve(); return; }
      const oldBox = document.getElementById('conflictOldBox');
      const newBox = document.getElementById('conflictNewBox');
      
      const wilayaNameOld = typeof Locations !== 'undefined' ? (Locations.getWilayaName(savedC.wilaya_code) || savedC.wilaya_code) : savedC.wilaya_code;
      const wilayaNameNew = typeof Locations !== 'undefined' ? (Locations.getWilayaName(currentWilaya) || currentWilaya) : currentWilaya;

      if (oldBox) oldBox.innerHTML = '<span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">📦 بيانات طلب سابق</span>' + (savedC.customer_name || '—') + ' — ' + (savedC.phone || '—') + '<br>ولاية ' + wilayaNameOld + ' — ' + (savedC.address || '');
      if (newBox) newBox.innerHTML = '<span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">✏️ البيانات الجديدة التي أدخلتها</span>' + ((form.customer_name?.value) || '—') + ' — ' + (currentPhone || '—') + '<br>ولاية ' + wilayaNameNew + ' — ' + currentAddress;
      
      modal.style.display = 'flex';
      
      document.getElementById('conflictUseOld').onclick = async () => {
        if (form.customer_name) form.customer_name.value = savedC.customer_name || '';
        if (form.phone) form.phone.value = savedC.phone || '';
        if (form.address) form.address.value = savedC.address || '';
        if (form.wilaya_code) {
           form.wilaya_code.value = savedC.wilaya_code;
           form.wilaya_code.dispatchEvent(new Event('change'));
        }
        if (form.commune && savedC.commune) {
           setTimeout(() => { form.commune.value = savedC.commune; }, 300);
        }
        modal.style.display = 'none';
        resolve();
      };
      document.getElementById('conflictUseNew').onclick = () => {
        modal.style.display = 'none';
        resolve();
      };
    });
  }

  `;

  content = content.substring(0, startIdx) + newCode + content.substring(endIdx);
  fs.writeFileSync("public/js/store2.js", content, "utf8");
  console.log("store2.js updated successfully!");
} else {
  console.log("Could not find markers.", startIdx, endIdx);
}
