const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

code = code.replace(
  /throw new Error\('المنتج رقم ' \+ item\.id \+ ' غير موجود أو غير نشط في قاعدة البيانات\. يرجى إفراغ السلة والمحاولة مجددا\.'\);/g,
  `throw new Error('المنتج "' + (item.name || 'المحدد') + '" لم يعد متوفراً. يرجى حذفه من السلة لإتمام الطلبية.');`
);

fs.writeFileSync('routes/orders.js', code);
console.log('Updated error message to use item.name');
