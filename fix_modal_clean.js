const fs = require("fs");

const cleanModalHTML = `
<!-- Conflict Modal: saved vs new customer data -->
<div id="conflictModal" style="display:none; position:fixed; inset:0; align-items:center; justify-content:center; background-color:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:99999; padding:1rem;">
  <div style="background:white; border-radius:1rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); max-width:24rem; width:100%; padding:1.5rem; text-align:right;" dir="rtl">
    <h3 style="font-size:1.125rem; font-weight:900; color:#0f172a; margin-bottom:0.5rem; margin-top:0;">اكتشفنا اختلافاً في بياناتك!</h3>
    <p style="font-size:0.875rem; color:#64748b; font-weight:700; margin-bottom:1.25rem; margin-top:0;">يبدو أن المعلومات التي أدخلتها مختلفة عن طلب سابق. أي بيانات تريد استخدامها؟</p>
    
    <div style="margin-bottom:1.25rem;">
      <div id="conflictOldBox" style="padding:0.75rem; border-radius:0.75rem; border:2px solid #e2e8f0; background:#f8fafc; font-size:0.875rem; font-weight:700; color:#334155; margin-bottom:0.75rem;"></div>
      <div id="conflictNewBox" style="padding:0.75rem; border-radius:0.75rem; border:2px solid #e2e8f0; background:#f8fafc; font-size:0.875rem; font-weight:700; color:#334155;"></div>
    </div>
    
    <div style="display:flex; gap:0.75rem;">
      <button id="conflictUseOld" style="flex:1; padding:0.75rem; border-radius:0.75rem; background:#f1f5f9; color:#1e293b; font-weight:900; font-size:0.875rem; border:none; cursor:pointer;">استخدم القديمة</button>
      <button id="conflictUseNew" style="flex:1; padding:0.75rem; border-radius:0.75rem; background:#E52F20; color:white; font-weight:900; font-size:0.875rem; border:none; cursor:pointer;">استخدم الجديدة</button>
    </div>
  </div>
</div>
`;

["public/product.html", "public/index.html"].forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // Strip out old modals
  content = content.replace(/<!-- Conflict Modal: saved vs new customer data -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>|<!-- Conflict Modal: saved vs new customer data -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, "");
  
  // Also strip any remaining conflict modals
  content = content.replace(/<!-- Conflict Modal[\s\S]*?(?=<\/main>|<script>)/, "");
  content = content.replace(/<div id="conflictModal"[\s\S]*?(?=<\/main>|<script>)/, "");
  
  // Append new modal right before </body>
  content = content.replace("</body>", cleanModalHTML + "\n</body>");
  
  // Fix the JS logic for showing/hiding to be extremely robust
  content = content.replaceAll(`modal.style.cssText = 'display:flex!important;position:fixed;inset:0;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:9999;padding:1rem;backdrop-filter:blur(4px);';`, `modal.style.display = 'flex';`);
  content = content.replaceAll(`modal.style.display = 'none';`, `modal.style.display = 'none';`);
  content = content.replaceAll(`modal.classList.remove('hidden');`, `modal.style.display = 'flex';`);
  content = content.replaceAll(`modal.classList.add('hidden');`, `modal.style.display = 'none';`);
  
  fs.writeFileSync(file, content, "utf8");
});

console.log("Modals rebuilt with pure CSS to avoid any tailwind clipping issues.");
