const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

// I will just read line by line and replace
const lines = code.split('\n');

let inBlock1 = false;
let inBlock2 = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (!(await decrementStock({ qty, variant_id: variant.id }, trx))) {')) {
    lines[i] = `            if (!(await decrementStock({ qty, variant_id: variant.id }, trx))) {
              const latest = (await currentStockOf({ variant_id: variant.id }, trx)) || 0;
              if (latest <= 0) {
                throw new Error(\`عذراً، لقد نفد المخزون من "\${product.name}" (\${variant.label})\`);
              } else {
                throw new Error(\`عذراً، الكمية المتوفرة من "\${product.name}" (\${variant.label}) هي \${latest} فقط\`);
              }
            }`;
    // skip the next 3 lines because we replaced the whole block inline
    lines[i+1] = '';
    lines[i+2] = '';
    lines[i+3] = '';
  }

  if (lines[i].includes('if (!(await decrementStock({ qty, id: product.id }, trx))) {')) {
    lines[i] = `            if (!(await decrementStock({ qty, id: product.id }, trx))) {
              const latest = (await currentStockOf({ id: product.id }, trx)) || 0;
              if (latest <= 0) {
                throw new Error(\`عذراً، لقد نفد المخزون من "\${product.name}"\`);
              } else {
                throw new Error(\`عذراً، الكمية المتوفرة من "\${product.name}" هي \${latest} فقط\`);
              }
            }`;
    // skip the next 3 lines
    lines[i+1] = '';
    lines[i+2] = '';
    lines[i+3] = '';
  }
}

fs.writeFileSync('routes/orders.js', lines.join('\n'));
console.log('Fixed robustly');
