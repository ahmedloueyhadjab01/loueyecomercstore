const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/js/store.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Mock Locations
window.Locations = { loadWilayas: () => {}, getRate: () => null };

// Mock fetch
window.fetch = async (url) => {
  if (url.includes('/api/auth/store-info')) {
    return { ok: true, json: async () => ({ id: 2, store_name: 'Test Store' }) };
  }
  if (url.includes('/api/categories')) {
    return { ok: true, json: async () => ([ { id: 2, name: 'أطفال' } ]) };
  }
  if (url.includes('/api/products')) {
    return { ok: true, json: async () => ([
      {id:4,name:"REE",has_variants:true,variants:[{id:10,product_id:4,label:"M",stock:33,color:"",color_code:"",size:"",image:""}], slug:"ree", price:1000},
      {id:6,name:"KF",has_variants:false, slug:"kf", price:2000},
      {id:7,name:"HADJI",has_variants:true,variants:[{color:"red",color_code:"#f00"}], slug:"hadji", price:500}
    ]) };
  }
  return { ok: true, json: async () => ({}) };
};

try {
  window.eval(js);
  setTimeout(() => {
    console.log("GRID INNER HTML:", window.document.getElementById('productsGrid').innerHTML.substring(0, 500));
    console.log("SUCCESS!");
  }, 1000);
} catch (e) {
  console.error("CRASH:", e);
}
