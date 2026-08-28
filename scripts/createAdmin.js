require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  console.error('يرجى ضبط ADMIN_USERNAME و ADMIN_PASSWORD في ملف .env');
  process.exit(1);
}

const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
if (existing) {
  console.log('يوجد حساب أدمن بهذا الاسم مسبقًا. لا حاجة لإنشاء آخر.');
  process.exit(0);
}

const hash = bcrypt.hashSync(password, 12);
db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
console.log(`تم إنشاء حساب الأدمن بنجاح: ${username}`);
console.log('يمكنك الآن تسجيل الدخول من صفحة /admin.html');
