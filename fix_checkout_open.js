const fs = require("fs");
let code = fs.readFileSync("public/js/store2.js", "utf8");

// Move loadSavedCustomer to checkoutBtn click instead of at page load
code = code.replace(
  `document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (!Cart.get().length) return;
    closeCart();
    updateGrandTotal();
    document.getElementById('checkoutOverlay').classList.remove('hidden');
  });`,
  `document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
    if (!Cart.get().length) return;
    closeCart();
    updateGrandTotal();
    document.getElementById('checkoutOverlay').classList.remove('hidden');
    await loadSavedCustomer();
  });`
);

// Remove the top-level loadSavedCustomer() call (it runs too early, before form is visible)
code = code.replace(`  loadSavedCustomer();\n  \n  // ----------`, `  // ----------`);

fs.writeFileSync("public/js/store2.js", code, "utf8");
console.log("Checkout open fix applied!");
