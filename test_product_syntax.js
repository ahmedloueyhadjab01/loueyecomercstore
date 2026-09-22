const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = fs.readFileSync('public/product.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
console.log("No syntax errors in product.html inline scripts");
