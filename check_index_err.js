const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = fs.readFileSync("public/index.html", "utf8");
const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
const cartCode = fs.readFileSync("public/js/cart.js", "utf8");
const locationsCode = fs.readFileSync("public/js/locations.js", "utf8");
const storeCode = fs.readFileSync("public/js/store2.js", "utf8");

try {
  dom.window.eval(cartCode);
  console.log("cart.js loaded");
  dom.window.eval(locationsCode);
  dom.window.eval(storeCode);
  console.log("store2.js loaded");
} catch(e) {
  console.error("Error:", e.message);
}
