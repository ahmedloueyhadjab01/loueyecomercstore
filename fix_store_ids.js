const fs = require('fs');
let code = fs.readFileSync('public/js/store.js', 'utf8');

// 1. Fix cart buttons
code = code.replace(/document\.getElementById\('closeCart'\)/g, "document.getElementById('closeCartBtn')");
code = code.replace(/document\.getElementById\('cartOverlay'\)/g, "document.getElementById('cartDrawer')"); // Temporary, just to avoid null pointer if there is no overlay

// 2. Fix subCategoryNav missing
code = code.replace(/const subNav = document\.getElementById\('subCategoryNav'\);/g, "const subNav = document.getElementById('subCategoryNav');\n  if (!subNav) return;");

// 3. Fix checkout form IDs
code = code.replace(/document\.getElementById\('wilayaSelect'\)/g, "document.getElementById('custWilaya')");
code = code.replace(/document\.getElementById\('communeSelect'\)/g, "document.getElementById('custCommune')");
code = code.replace(/document\.getElementById\('selectWilayaHint'\)/g, "(document.getElementById('selectWilayaHint') || document.createElement('div'))");

// 4. Fix checkout error and total
code = code.replace(/document\.getElementById\('checkoutError'\)/g, "(document.getElementById('checkoutError') || document.createElement('div'))");
code = code.replace(/document\.getElementById\('checkoutGrandTotal'\)/g, "(document.getElementById('checkoutGrandTotal') || document.getElementById('cartTotal'))");

// 5. Fix Mobile search buttons
code = code.replace(/document\.getElementById\('searchInputMobile'\)/g, "(document.getElementById('searchInputMobile') || document.createElement('input'))");
code = code.replace(/document\.getElementById\('clearSearchBtnMobile'\)/g, "(document.getElementById('clearSearchBtnMobile') || document.createElement('button'))");
code = code.replace(/document\.getElementById\('searchBtnMobile'\)/g, "(document.getElementById('searchBtnMobile') || document.createElement('button'))");
code = code.replace(/document\.getElementById\('searchFormMobile'\)/g, "(document.getElementById('searchFormMobile') || document.createElement('form'))");

// 6. Fix cartItems
code = code.replace(/document\.getElementById\('cartItems'\)/g, "document.getElementById('cartItemsList')");

// Wrap everything in try/catch or conditional where needed
code = code.replace(/([a-zA-Z0-9_]+(?:\??)\.addEventListener)/g, "if ($1) $1");

fs.writeFileSync('public/js/store.js', code);
console.log("store.js fixed for missing IDs!");
