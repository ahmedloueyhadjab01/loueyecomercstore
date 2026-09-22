const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

const find1 = `if (!(await decrementStock({ qty, variant_id: variant.id }, trx))) {`;
const find2 = `if (!(await decrementStock({ qty, id: product.id }, trx))) {`;

const idx1 = code.indexOf(find1);
const idx2 = code.indexOf(find2);

if (idx1 > -1 && idx2 > -1) {
  // block 1
  const end1 = code.indexOf('}', idx1) + 1;
  const oldBlock1 = code.substring(idx1, end1);
  const newBlock1 = `if (!(await decrementStock({ qty, variant_id: variant.id }, trx))) {
              const latest = (await currentStockOf({ variant_id: variant.id }, trx)) || 0;
              if (latest <= 0) {
                throw new Error(\`عذراً، لقد نفد المخزون من "\${product.name}" (\${variant.label})\`);
              } else {
                throw new Error(\`عذراً، الكمية المتوفرة من "\${product.name}" (\${variant.label}) هي \${latest} فقط\`);
              }
            }`;
  code = code.replace(oldBlock1, newBlock1);

  // recalculate index for 2
  const idx2_new = code.indexOf(find2);
  const end2 = code.indexOf('}', idx2_new) + 1;
  const oldBlock2 = code.substring(idx2_new, end2);
  const newBlock2 = `if (!(await decrementStock({ qty, id: product.id }, trx))) {
              const latest = (await currentStockOf({ id: product.id }, trx)) || 0;
              if (latest <= 0) {
                throw new Error(\`عذراً، لقد نفد المخزون من "\${product.name}"\`);
              } else {
                throw new Error(\`عذراً، الكمية المتوفرة من "\${product.name}" هي \${latest} فقط\`);
              }
            }`;
  code = code.replace(oldBlock2, newBlock2);

  fs.writeFileSync('routes/orders.js', code);
  console.log('Fixed successfully');
} else {
  console.log('Could not find blocks');
}
