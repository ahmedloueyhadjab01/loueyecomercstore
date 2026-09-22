const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = `<!DOCTYPE html><html lang="en"><body>
  <div id="productsGrid"></div>
  <div id="emptyState" class="hidden"></div>
  <div id="categoryNav"></div>
  <div id="subCategoryNav"></div>
</body></html>`;

const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
const document = window.document;

// Mock APIs
window.fetch = async (url) => {
  if (url.includes('/api/auth/store-info')) {
    return { ok: true, json: async () => ({ id: 2, store_name: "test" }) };
  }
  if (url.includes('/api/categories')) {
    return { ok: true, json: async () => [] };
  }
  if (url.includes('/api/products')) {
    return { ok: true, json: async () => [
      {"id":5,"name":"jinz","slug":"jinz-1790065562521","price":10000,"stock":50,"has_variants":true,"image":null,"images":[],"user_id":2,"is_active":true,"variants":[{"id":12,"color":"أصفر","color_code":"#facc15","size":"S"}]},
      {"id":4,"name":"REE","slug":"ree","price":1200,"stock":53,"has_variants":true,"image":"test.webp","images":["test.webp"],"user_id":2,"is_active":true,"variants":[{"id":10,"label":"M","stock":33,"color":"","color_code":"","size":"","image":""}]}
    ]};
  }
  throw new Error("unmocked " + url);
};

window.sessionStorage = {
  getItem: () => null,
  setItem: () => {}
};

let scriptContent = fs.readFileSync('public/js/store.js', 'utf8');
try {
  window.eval(scriptContent);
  window.eval('initStoreInfo().then(() => loadCategories()).then(() => loadProducts()).then(() => { console.log(document.getElementById("productsGrid").innerHTML.length > 0 ? "RENDERED OK" : "RENDER FAILED"); console.log("GRID:", document.getElementById("productsGrid").innerHTML); }).catch(e => console.error(e));');
} catch (e) {
  console.error("Syntax or Exec Error:", e);
}

