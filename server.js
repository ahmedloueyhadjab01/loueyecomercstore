require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const feedRoutes = require('./routes/feed');
const locationRoutes = require('./routes/locations');
const settingsRoutes = require('./routes/settings');

const app = express();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change_this')) {
  console.warn('\n⚠️  تحذير أمني: يرجى تعيين JWT_SECRET قوي وعشوائي في ملف .env قبل النشر الفعلي!\n');
}

app.set('trust proxy', 1);

// ----- أمان عام -----
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  })
);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// حد عام لعدد الطلبات لكل IP (حماية من هجمات الحرمان من الخدمة الأساسية)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// ----- الملفات الثابتة (الواجهة الأمامية) -----
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ----- مسارات الـ API -----
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// معالج أخطاء موحّد (لا يكشف تفاصيل داخلية حساسة)
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message && err.message.includes('نوع الملف')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'حدث خطأ في الخادم' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ المتجر يعمل الآن على http://localhost:${PORT}`);
  console.log(`🔐 لوحة التحكم: http://localhost:${PORT}/admin.html`);
});
