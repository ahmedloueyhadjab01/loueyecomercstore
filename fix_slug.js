
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.lvainiusgzxbysnhqidr:07102023aA07102023@aws-0-eu-central-1.pooler.supabase.com:6543/postgres' });
pool.query('UPDATE users SET store_slug = $1 WHERE email = $2', ['default', 'kalkoul.dz']).then(res => console.log('Updated:', res.rowCount)).catch(console.error).finally(() => pool.end());

