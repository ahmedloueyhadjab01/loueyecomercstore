const fs = require('fs');

function fixDeliveryOptions(file) {
  let html = fs.readFileSync(file, 'utf8');

  // Fix home option
  html = html.replace(
    'id="labelShipHome"',
    'id="labelShipHome" class="delivery-option flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" data-type="home"'
  );
  html = html.replace(
    'id="priceHome" class="text-sm font-bold text-blue-600"',
    'id="priceHome" class="delivery-price text-sm font-bold text-blue-600"'
  );

  // Fix desk option
  html = html.replace(
    'id="labelShipDesk"',
    'id="labelShipDesk" class="delivery-option flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" data-type="desk"'
  );
  html = html.replace(
    'id="priceDesk" class="text-sm font-bold text-blue-600"',
    'id="priceDesk" class="delivery-price text-sm font-bold text-blue-600"'
  );

  fs.writeFileSync(file, html);
  console.log("Patched", file);
}

fixDeliveryOptions('public/index.html');
fixDeliveryOptions('public/product.html');
