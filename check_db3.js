const { Client } = require('pg');
const client = new Client('postgresql://postgres.lvainiusgzxbysnhqidr:07102023aA07102023@aws-0-eu-central-1.pooler.supabase.com:6543/postgres');
client.connect().then(async () => {
  const p = await client.query('SELECT * FROM products');
  console.log('PRODUCTS:', p.rows);
  client.end();
}).catch(console.error);
