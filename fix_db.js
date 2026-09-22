const { Client } = require('pg');
require('dotenv').config();

async function fixDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // 4. Delete the duplicate admin entry (id=2 'kalkoulstore')
    const resAdmins = await client.query('DELETE FROM admins WHERE id = 2 OR username = $1', ['kalkoulstore']);
    console.log(`Deleted ${resAdmins.rowCount} duplicate admins.`);

    // 5. Delete the duplicate user (id=4 'kalkoul.dz')
    const resUsers = await client.query('DELETE FROM users WHERE id = 4');
    console.log(`Deleted ${resUsers.rowCount} duplicate users.`);

    // Check remaining users
    const users = await client.query('SELECT id, username, role FROM users');
    console.log('Remaining users:', users.rows);

    const admins = await client.query('SELECT id, username FROM admins');
    console.log('Remaining admins:', admins.rows);

  } catch (err) {
    console.error('Error fixing DB:', err);
  } finally {
    await client.end();
  }
}

fixDb();
