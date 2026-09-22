const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/index.html', 'utf8');
const js = fs.readFileSync('public/js/store.js', 'utf8');
const locationsJs = fs.readFileSync('public/js/locations.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
const document = window.document;

// Mock fetch
window.fetch = async () => ({ ok: true, json: async () => ({}) });

try {
  window.eval(locationsJs);
  window.eval(js);
  console.log("No syntax/reference errors on load!");
} catch (e) {
  console.error(e);
}
