const { JSDOM } = require("jsdom");
JSDOM.fromURL("http://localhost:3003", {
  runScripts: "dangerously",
  resources: "usable"
}).then(dom => {
  const window = dom.window;
  window.console.error = (msg, ...args) => console.log("FRONTEND ERROR:", msg, ...args);
  window.console.log = (msg, ...args) => console.log("FRONTEND LOG:", msg, ...args);
  
  setTimeout(() => {
    let grid = window.document.getElementById('productsGrid');
    console.log("Grid HTML:", grid ? grid.innerHTML.substring(0, 500) : "NULL");
    let cats = window.document.getElementById('categoryDropdownMenu');
    console.log("Cats HTML:", cats ? cats.innerHTML.substring(0, 200) : "NULL");
  }, 3000);
}).catch(e => console.log("JSDOM Error:", e));
