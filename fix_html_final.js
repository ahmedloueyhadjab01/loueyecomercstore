const fs = require('fs');

function patchHtml(file) {
  let html = fs.readFileSync(file, 'utf8');
  
  // 1. Add custCommune
  if (!html.includes('id="custCommune"')) {
    html = html.replace(
      '<input type="text" id="custAddress" required class="input-field" placeholder="الحي، الشارع..." />',
      `<select id="custCommune" required class="input-field bg-white mb-3">
            <option value="">-- اختر البلدية --</option>
          </select>
          <input type="text" id="custAddress" required class="input-field" placeholder="الحي، الشارع..." />`
    );
  }
  
  // 2. Add id="subCategoryNav"
  if (!html.includes('id="subCategoryNav"')) {
    html = html.replace(
      '<div id="productsGrid"',
      `<div id="subCategoryNav" class="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide hidden"></div>
      <div id="productsGrid"`
    );
  }

  // 3. Fix closeCartBtn ID back to closeCart (easier for store.js)
  html = html.replace('id="closeCartBtn"', 'id="closeCart"');
  
  fs.writeFileSync(file, html);
}

patchHtml('public/index.html');
patchHtml('public/product.html');

console.log("HTML patched!");
