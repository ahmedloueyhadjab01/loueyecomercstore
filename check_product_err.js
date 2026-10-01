const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = fs.readFileSync("public/product.html", "utf8");

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", url: "http://localhost/" });

dom.window.console.error = (msg) => console.log("ERROR:", msg);

setTimeout(() => {
  console.log("Cart object exists:", typeof dom.window.Cart !== "undefined");
  console.log("openCart exists:", typeof dom.window.openCart !== "undefined");
}, 2000);
