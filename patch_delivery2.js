const fs = require('fs');

function fix(file) {
  let html = fs.readFileSync(file, 'utf8');
  
  // Fix the duplicate class issue
  html = html.replace(
    /class="[^"]*" id="labelShipHome" class="([^"]*)" data-type="home"/,
    'id="labelShipHome" class="$1" data-type="home"'
  );
  html = html.replace(
    /class="[^"]*" id="labelShipDesk" class="([^"]*)" data-type="desk"/,
    'id="labelShipDesk" class="$1" data-type="desk"'
  );

  fs.writeFileSync(file, html);
}

fix('public/index.html');
fix('public/product.html');
console.log('Fixed duplicate classes');
