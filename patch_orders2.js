const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

code = code.replace(
  /if \(!\(await decrementStock\(\{ qty, variant_id: variant\.id \}, trx\)\)\) \{[\s\S]*?throw new Error[^}]*\}/,
  `if (!(await decrementStock({ qty, variant_id: variant.id }, trx))) {
              const latest = (await currentStockOf({ variant_id: variant.id }, trx)) || 0;
              if (latest <= 0) {
                throw new Error(\`عذراً، لقد نفد المخزون من "\${product.name}" (\${variant.label})\`);
              } else {
                throw new Error(\`عذراً، الكمية المتوفرة من "\${product.name}" (\${variant.label}) هي \${latest} فقط\`);
              }
            }`
);

code = code.replace(
  /if \(!\(await decrementStock\(\{ qty, id: product\.id \}, trx\)\)\) \{[\s\S]*?throw new Error[^}]*\}/,
  `if (!(await decrementStock({ qty, id: product.id }, trx))) {
              const latest = (await currentStockOf({ id: product.id }, trx)) || 0;
              if (latest <= 0) {
                throw new Error(\`عذراً، لقد نفد المخزون من "\${product.name}"\`);
              } else {
                throw new Error(\`عذراً، الكمية المتوفرة من "\${product.name}" هي \${latest} فقط\`);
              }
            }`
);

fs.writeFileSync('routes/orders.js', code);
console.log('Fixed error messages properly');
