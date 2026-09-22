const fs = require('fs');
const crypto = require('crypto');

let env = fs.readFileSync('.env', 'utf8');

// Update JWT_SECRET
const newJwt = crypto.randomBytes(64).toString('hex');
env = env.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${newJwt}`);

// Ensure MAIN_STORE_USER_ID exists
if (!env.includes('MAIN_STORE_USER_ID')) {
  env += '\n# You can change this to 3 or 4 based on your MAIN store admin ID in the users table\nMAIN_STORE_USER_ID=3\n';
}

fs.writeFileSync('.env', env);
console.log('Updated .env locally');
