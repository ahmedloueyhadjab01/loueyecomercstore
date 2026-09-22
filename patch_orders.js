const fs = require('fs');
let code = fs.readFileSync('routes/orders.js', 'utf8');

code = code.replace(
  /throw new Error\(\`([^`]*)\$\{latest\} \?'\`\);/g,
  `if (latest <= 0) {
                throw new Error(\`عذراً، لقد نفد المخزون من "\${product.name}"\${variant ? \` (\${variant.label})\` : ''}\`);
              } else {
                throw new Error(\`الكمية المتوفرة من "\${product.name}"\${variant ? \` (\${variant.label})\` : ''} هي \${latest} فقط\`);
              }`
);

fs.writeFileSync('routes/orders.js', code);
console.log('Fixed error messages');
