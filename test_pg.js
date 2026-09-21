
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.lvainiusgzxbysnhqidr:07102023aA07102023@aws-0-eu-central-1.pooler.supabase.com:6543/postgres' });
pool.query('SELECT * FROM users WHERE LOWER(email) = $1', ['kalkoul.dz']).then(res => console.log(res.rows)).catch(console.error).finally(() => pool.end());

