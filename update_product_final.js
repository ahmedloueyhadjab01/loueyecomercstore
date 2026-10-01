const fs = require("fs");
let content = fs.readFileSync("public/product.html", "utf8");

const startStr = "const currentPhone = document.getElementById('expressPhone').value.trim();";
const endStr = "const originalText = btn.textContent;";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const newCode = `const currentPhone = document.getElementById('expressPhone').value.trim();
      const currentWilaya = parseInt(document.getElementById('expressWilaya').value, 10);
      const currentAddress = document.getElementById('expressAddress').value.trim();
      
      const phoneChanged = saved && saved.phone && currentPhone && saved.phone !== currentPhone;
      const wilayaChanged = saved && saved.wilaya_code && currentWilaya && parseInt(saved.wilaya_code, 10) !== currentWilaya;
      const addressChanged = saved && saved.address && currentAddress && saved.address !== currentAddress;

      if (phoneChanged || wilayaChanged || addressChanged) {
        // Show conflict modal
        const modal = document.getElementById('conflictModal');
        
        const wilayaNameOld = typeof Locations !== 'undefined' ? (Locations.getWilayaName(saved.wilaya_code) || saved.wilaya_code) : saved.wilaya_code;
        const wilayaNameNew = typeof Locations !== 'undefined' ? (Locations.getWilayaName(currentWilaya) || currentWilaya) : currentWilaya;

        document.getElementById('conflictOldBox').innerHTML = '<span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">📦 بيانات طلب سابق</span>' + (saved.customer_name || '—') + ' — ' + (saved.phone || '—') + '<br>ولاية ' + wilayaNameOld + ' — ' + (saved.address || '');
        document.getElementById('conflictNewBox').innerHTML = '<span style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">✏️ البيانات الجديدة التي أدخلتها</span>' + ((document.getElementById('expressName').value) || '—') + ' — ' + (currentPhone || '—') + '<br>ولاية ' + wilayaNameNew + ' — ' + currentAddress;
        
        modal.style.display = 'flex';
        // Wait for user choice
        await new Promise(resolve => {
          document.getElementById('conflictUseOld').onclick = () => {
            // Restore old data into form
            document.getElementById('expressName').value = saved.customer_name || '';
            document.getElementById('expressPhone').value = saved.phone || '';
            document.getElementById('expressAddress').value = saved.address || '';
            const wSelect = document.getElementById('expressWilaya');
            if (wSelect) {
               wSelect.value = saved.wilaya_code;
               wSelect.dispatchEvent(new Event('change'));
            }
            const cSelect = document.getElementById('expressCommune');
            if (cSelect && saved.commune) {
               setTimeout(() => { cSelect.value = saved.commune; }, 300);
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
  fs.writeFileSync("public/product.html", content, "utf8");
  console.log("product.html updated successfully!");
} else {
  console.log("Could not find markers.", startIdx, endIdx);
}
