const fs = require('fs');

function addLocationsScript(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('locations.js')) {
    html = html.replace('<script src="/js/store.js', '<script src="/js/locations.js"></script>\n  <script src="/js/store.js');
    fs.writeFileSync(file, html);
    console.log("Added to", file);
  }
}

addLocationsScript('public/index.html');
addLocationsScript('public/product.html');
