const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

// We need to see exactly what is failing in Render's logs, but we can't see Render's logs easily unless the user tells us.
// Let's modify the error message to return exactly what failed.
const targetStr = `          if (!product) throw new Error('أحد المنتجات غير متاح حالياً');`;
const replaceStr = `          if (!product) throw new Error('المنتج رقم ' + item.id + ' غير موجود أو غير نشط في قاعدة البيانات. يرجى إفراغ السلة والمحاولة مجددا.');`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('routes/orders.js', code);
console.log('Modified error message');
