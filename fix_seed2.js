const fs = require('fs');
let code = fs.readFileSync('seed_full_store.js', 'utf8');

code = code.replace(
  /campaign_name, spend_amount, platform, date, created_at/g,
  `campaign_name, spend_amount, source, spend_date, created_at`
);

fs.writeFileSync('seed_full_store.js', code);
console.log('Fixed seeder ad columns');
