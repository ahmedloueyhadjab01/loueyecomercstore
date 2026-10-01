const fs = require('fs');
const { JSDOM } = require('jsdom');
const vm = require('vm');

const js = fs.readFileSync('public/js/store2.js', 'utf8');

const dom = new JSDOM(`
  <div id='productsGrid'></div>
  <div id='emptyState' class='hidden'></div>
`);
const window = dom.window;

const context = vm.createContext({
  window,
  document: window.document,
  fetch: async (url) => {
    if (url.includes('/api/products')) {
      return { json: async () => [{ id: 1, name: 'Prod 1', price: 100, slug: 'prod-1', category_id: 1 }] };
    }
    if (url.includes('/api/categories')) {
      return { json: async () => [{ id: 1, name: 'Cat 1' }] };
    }
    return { json: async () => [] };
  },
  URLSearchParams: window.URLSearchParams,
  console,
  Date,
  String,
  Number,
  Math,
  Array,
  Set,
  encodeURIComponent,
  setTimeout,
  clearTimeout,
  location: window.location,
  Locations: { loadWilayas: () => {} },
  Cart: { get: () => [] },
  wilayaSelect: null,
  money: (n) => n
});

try {
  const script = new vm.Script(js);
  script.runInContext(context);
  
  // Call init or loadProducts manually
  context.loadProducts().then(() => {
    console.log("Grid HTML:");
    console.log(window.document.getElementById('productsGrid').innerHTML.substring(0, 500));
  }).catch(e => console.error("loadProducts Error:", e));
  
} catch(e) { console.error('Script Error:', e); }
