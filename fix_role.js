
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.lvainiusgzxbysnhqidr:07102023aA07102023@aws-0-eu-central-1.pooler.supabase.com:6543/postgres' });
pool.query('UPDATE users SET role = $1 WHERE id = 1', ['vendor']).then(res => console.log('Updated id 1:', res.rowCount)).catch(console.error);
pool.query('UPDATE users SET role = $1 WHERE id = 2', ['admin']).then(res => console.log('Updated id 2:', res.rowCount)).catch(console.error).finally(() => pool.end());

