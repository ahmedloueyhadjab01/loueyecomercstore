const https = require('https');
https.get('https://loueyecomercstore-1.onrender.com/api/products?store_id=2', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
