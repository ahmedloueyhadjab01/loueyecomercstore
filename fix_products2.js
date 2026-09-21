const fs = require('fs');
let js = fs.readFileSync('routes/products.js', 'utf8');

const putIdx = js.indexOf("router.put('/:id'");
const startIdx = js.indexOf("const {", putIdx);
const endIdx = js.indexOf("} = req.body;", startIdx) + 13;

const replacement = `const name = req.body.name !== undefined ? req.body.name : product.name;
  const description = req.body.description !== undefined ? req.body.description : product.description;
  const price = req.body.price !== undefined ? req.body.price : product.price;
  const compare_price = req.body.compare_price !== undefined ? req.body.compare_price : product.compare_price;
  const sku = req.body.sku !== undefined ? req.body.sku : product.sku;
  const category_id = req.body.category_id !== undefined ? req.body.category_id : product.category_id;
  const is_active = req.body.is_active !== undefined ? req.body.is_active : product.is_active;
  const pack_quantity = req.body.pack_quantity !== undefined ? req.body.pack_quantity : product.pack_quantity;
  const video_file = req.body.video_file !== undefined ? req.body.video_file : product.video_file;
  const reviews = req.body.reviews !== undefined ? req.body.reviews : product.reviews;
  const rating = req.body.rating !== undefined ? req.body.rating : product.rating;`;

js = js.substring(0, startIdx) + replacement + js.substring(endIdx);
fs.writeFileSync('routes/products.js', js);
console.log('products.js PUT route properly fixed!');
