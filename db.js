const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'store.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------- الجداول ----------

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  store_name TEXT DEFAULT '',
  is_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price REAL NOT NULL,
  compare_price REAL,
  sku TEXT,
  stock INTEGER DEFAULT 0,
  cost_price REAL DEFAULT 0,
  has_variants INTEGER DEFAULT 0,
  category_id INTEGER,
  image TEXT,
  images TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- متغيرات المنتج (مقاسات/أحجام/أي تصنيف حر يضعه الأدمن) - كل متغيّر له مخزون وسعر تكلفة مستقلان تمامًا
CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  cost_price REAL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- سجل تزويد كل متغيّر على حدة بنفس منطق سعر الشراء والمتوسط المرجّح
CREATE TABLE IF NOT EXISTS variant_restocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER NOT NULL,
  qty_added INTEGER NOT NULL,
  cost_price REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

-- إعدادات عامة للمتجر (روابط تواصل اجتماعي وغيرها) بنظام مفتاح/قيمة بسيط
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);

-- سجل كل عملية تزويد بالمخزون (متى، كم قطعة، بأي سعر شراء) لحساب الأرباح ومتوسط التكلفة بدقة
CREATE TABLE IF NOT EXISTS stock_restocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  qty_added INTEGER NOT NULL,
  cost_price REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  wilaya_code INTEGER,
  wilaya_name TEXT,
  commune TEXT,
  delivery_type TEXT DEFAULT 'home',
  delivery_price REAL DEFAULT 0,
  subtotal REAL DEFAULT 0,
  items TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'قيد المعالجة',
  shipping_cost_incurred INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_rates (
  wilaya_code INTEGER PRIMARY KEY,
  wilaya_name TEXT NOT NULL,
  home_price REAL DEFAULT 0,
  desk_price REAL DEFAULT 0
);

-- سجل مالي دائم: يحفظ مبيعات وتكلفة شحن الطلبات المحذوفة حتى لا تضيع الأرقام الحقيقية من التقارير
CREATE TABLE IF NOT EXISTS financial_archive (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  archived_sales REAL DEFAULT 0,
  archived_shipping_cost REAL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
`);

// صف واحد ثابت لتجميع الأرقام المؤرشفة
db.prepare('INSERT OR IGNORE INTO financial_archive (id, archived_sales, archived_shipping_cost) VALUES (1, 0, 0)').run();

// ---------- ترحيل آمن لقواعد بيانات سابقة لم تحتوِ عمود shipping_cost_incurred بعد ----------
const orderColumns = db.prepare("PRAGMA table_info(orders)").all().map((c) => c.name);
if (!orderColumns.includes('shipping_cost_incurred')) {
  db.exec('ALTER TABLE orders ADD COLUMN shipping_cost_incurred INTEGER DEFAULT 0');
  // أي طلب موجود مسبقًا ووصل بالفعل لحالة "قيد التوصيل" أو "تم التسليم" يُعتبر شحنًا حدث فعلًا
  db.prepare(
    "UPDATE orders SET shipping_cost_incurred = 1 WHERE status IN ('قيد التوصيل', 'تم التسليم')"
  ).run();
}

// ---------- ترحيل آمن لقواعد بيانات سابقة لم تحتوِ عمود cost_price / has_variants بعد ----------
const productColumns = db.prepare("PRAGMA table_info(products)").all().map((c) => c.name);
if (!productColumns.includes('cost_price')) {
  db.exec('ALTER TABLE products ADD COLUMN cost_price REAL DEFAULT 0');
}
if (!productColumns.includes('has_variants')) {
  db.exec('ALTER TABLE products ADD COLUMN has_variants INTEGER DEFAULT 0');
}

// ---------- ترحيل آمن لجدول admins (إضافة أعمدة email, store_name, is_verified) ----------
const adminColumns = db.prepare("PRAGMA table_info(admins)").all().map((c) => c.name);
if (!adminColumns.includes('email')) {
  db.exec("ALTER TABLE admins ADD COLUMN email TEXT DEFAULT ''");
}
if (!adminColumns.includes('store_name')) {
  db.exec("ALTER TABLE admins ADD COLUMN store_name TEXT DEFAULT ''");
}
if (!adminColumns.includes('is_verified')) {
  db.exec('ALTER TABLE admins ADD COLUMN is_verified INTEGER DEFAULT 1');
}

// ---------- إعدادات افتراضية فارغة (روابط تواصل اجتماعي) قابلة للتعديل من لوحة التحكم ----------
const defaultSettings = ['social_whatsapp', 'social_instagram', 'social_facebook', 'social_tiktok', 'social_telegram'];
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const key of defaultSettings) insertSetting.run(key, '');

// ---------- تهيئة أسعار التوصيل لكل الولايات (69 ولاية) مرة واحدة عند أول تشغيل ----------
const wilayasSeed = require('./data/wilayas.json');
const seedCount = db.prepare('SELECT COUNT(*) AS c FROM delivery_rates').get().c;
if (seedCount === 0) {
  const insert = db.prepare(
    'INSERT INTO delivery_rates (wilaya_code, wilaya_name, home_price, desk_price) VALUES (?, ?, 0, 0)'
  );
  const insertMany = db.transaction((rows) => {
    for (const w of rows) insert.run(w.code, w.name);
  });
  insertMany(wilayasSeed);
}

module.exports = db;
