
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.lvainiusgzxbysnhqidr:07102023aA07102023@aws-0-eu-central-1.pooler.supabase.com:6543/postgres' });
pool.query('SELECT id, name, email, role FROM users').then(res => console.table(res.rows)).catch(console.error).finally(() => pool.end());

