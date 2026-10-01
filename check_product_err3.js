const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = fs.readFileSync("public/product.html", "utf8");
const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/product.html?slug=test" });

const cartCode = fs.readFileSync("public/js/cart.js", "utf8");
const locationsCode = fs.readFileSync("public/js/locations.js", "utf8");
const storeCode = fs.readFileSync("public/js/store2.js", "utf8");

try {
  dom.window.eval(cartCode);
  dom.window.eval(locationsCode);
  dom.window.eval(storeCode);
  
  // Extract and run the inline script from product.html
  const scripts = dom.window.document.querySelectorAll("script:not([src])");
  scripts.forEach(s => {
    try { dom.window.eval(s.textContent); } catch(e) { console.error("Inline script error:", e.message); }
  });
  
  // Fake PRODUCT_DATA to simulate product loaded
  dom.window.PRODUCT_DATA = { id: 1, name: "Test", price: 100, stock: 10 };
  dom.window.QTY = 1;
  dom.window.SELECTED_VARIANT_ID = null;
  
  // Call addToCartExpress
  dom.window.addToCartExpress();
  console.log("Added to cart! Cart contents:", dom.window.Cart.get());
} catch(e) {
  console.error("Fatal Error:", e.message);
}
