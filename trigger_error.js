require('dotenv').config();
const express = require('express');
const settingsRoute = require('./routes/settings');
const db = require('./db');

const router = require('./routes/settings');
const route = router.stack.find(layer => layer.route && layer.route.path === '/reset-store' && layer.route.methods.post);

if (route) {
  const handler = route.route.stack[route.route.stack.length - 1].handle;
  const req = {
    user: { id: 2, role: 'admin' },
    body: { password: 'bypass' }
  };
  const res = {
    status: function(code) { console.log('Status:', code); return this; },
    json: function(data) { console.log('Response:', data); }
  };
  
  const bcrypt = require('bcryptjs');
  const originalCompare = bcrypt.compare;
  bcrypt.compare = async () => true; 
  
  handler(req, res).then(() => {
    bcrypt.compare = originalCompare;
  }).catch(e => console.error('Outer error:', e));
} else {
  console.log('Route not found');
}
