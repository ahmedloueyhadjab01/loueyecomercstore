const https = require('https');
https.get('https://loueyecomercstore-1.onrender.com/api/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('NO PARAMS:', data));
});
https.get('https://loueyecomercstore-1.onrender.com/api/products?store_id=2', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STORE 2:', data));
});
https.get('https://loueyecomercstore-1.onrender.com/api/products?store_id=default', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STORE DEFAULT:', data));
});
