const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = fs.readFileSync('public/index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;
console.log(document.querySelector('.delivery-option[data-type="home"]'));
