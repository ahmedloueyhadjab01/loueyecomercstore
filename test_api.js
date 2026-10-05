require('dotenv').config();
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 2, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
const http = require('http');
const data = JSON.stringify({ password: 'bypass' });
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/settings/reset-store',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  }
};
const req = http.request(options, res => {
  res.setEncoding('utf8');
  res.on('data', d => console.log(d));
});
req.write(data);
req.end();
