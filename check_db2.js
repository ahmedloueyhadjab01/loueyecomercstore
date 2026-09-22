const { Client } = require('pg');
const client = new Client('postgresql://postgres.lvainiusgzxbysnhqidr:07102023aA07102023@aws-0-eu-central-1.pooler.supabase.com:6543/postgres');
client.connect().then(async () => {
  const res = await client.query('SELECT id, name, role FROM users');
  console.log('USERS:', res.rows);
  const p = await client.query('SELECT id, user_id, name, is_active FROM products');
  console.log('PRODUCTS:', p.rows);
  client.end();
}).catch(console.error);
