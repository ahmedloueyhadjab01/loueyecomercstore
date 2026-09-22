const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/index.html', 'utf8');
let js = fs.readFileSync('public/js/store.js', 'utf8');

// replace Locations with a mock object
js = `const Locations = { loadWilayas: () => {}, getRate: () => null };\n` + js;

const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
const document = window.document;

try {
  window.eval(js);
  console.log("SUCCESS: store.js evaluated without crashing!");
} catch (e) {
  console.error("CRASH:", e);
}
