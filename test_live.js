const jsdom = require("jsdom");
const { JSDOM } = jsdom;
JSDOM.fromURL("https://loueyecomercstore-1.onrender.com/", { runScripts: "dangerously", resources: "usable" }).then(dom => {
  setTimeout(() => {
    console.log("PRODUCTS HTML:", dom.window.document.getElementById('productsGrid').innerHTML.substring(0, 500));
    console.log("EMPTY STATE:", dom.window.document.getElementById('emptyState').innerHTML);
    console.log("CATEGORIES:", dom.window.document.getElementById('categoryNav').innerHTML);
  }, 3000);
});
