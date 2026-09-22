const fs = require('fs');

function replaceInFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  // 'متجري' in arabic
  const arabicStr = 'متجري';
  const regex = new RegExp(arabicStr, 'g');
  content = content.replace(regex, 'Kalkoul Store');
  fs.writeFileSync(file, content);
}

replaceInFile('public/index.html');
replaceInFile('public/product.html');
replaceInFile('public/admin.html');

console.log('Replaced متجري with Kalkoul Store');
