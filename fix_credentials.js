const { Client } = require('pg');
require('dotenv').config();

async function changePassword() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Generate new strong password
    const newPass = 'A' + Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + '1!';
    
    // Change password for postgres user
    await client.query(`ALTER USER postgres WITH PASSWORD '${newPass}';`);
    console.log('Successfully changed postgres password in Supabase via SQL!');
    
    // Also change it for the specific user in the URL if it's different
    // The URL is postgresql://postgres.lvainiusgzxbysnhqidr:oldpass@...
    const url = process.env.DATABASE_URL;
    const match = url.match(/postgresql:\/\/([^:]+):/);
    if (match && match[1] !== 'postgres') {
      await client.query(`ALTER USER "${match[1]}" WITH PASSWORD '${newPass}';`);
      console.log(`Changed password for user ${match[1]}`);
    }

    // Update .env file
    const fs = require('fs');
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Replace old password in URL
    const oldPass = '07102023aA07102023';
    envContent = envContent.replace(oldPass, newPass);
    
    // Replace JWT SECRET
    const crypto = require('crypto');
    const newJwt = crypto.randomBytes(64).toString('hex');
    envContent = envContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${newJwt}`);
    
    // Add MAIN_STORE_USER_ID if not exists
    if (!envContent.includes('MAIN_STORE_USER_ID')) {
      envContent += '\nMAIN_STORE_USER_ID=4\n';
    } else {
      envContent = envContent.replace(/MAIN_STORE_USER_ID=.*/g, 'MAIN_STORE_USER_ID=4');
    }
    
    fs.writeFileSync('.env', envContent);
    console.log('Updated .env with new credentials.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

changePassword();
