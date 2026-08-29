const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sendOTP } = require('../utils/mailer');

const router = express.Router();

// ---------- حماية من المحاولات المتكررة ----------

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'محاولات دخول كثيرة جدًا. الرجاء المحاولة لاحقًا.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: 'طلبات كثيرة جدًا. الرجاء الانتظار بضع دقائق.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'محاولات تسجيل كثيرة جدًا. الرجاء المحاولة لاحقًا.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------- دوال مساعدة ----------

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function createAndSendOTP(email, type) {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 دقائق

  // إلغاء أي رموز سابقة لنفس الإيميل والنوع
  db.prepare('UPDATE otp_codes SET used = 1 WHERE email = ? AND type = ? AND used = 0').run(email, type);

  // حفظ الرمز الجديد
  db.prepare('INSERT INTO otp_codes (email, code, type, expires_at) VALUES (?, ?, ?, ?)').run(email, code, type, expiresAt);

  // إرسال الرمز
  await sendOTP(email, code, type);
  return code;
}

function verifyOTPCode(email, code, type) {
  const record = db.prepare(
    'SELECT * FROM otp_codes WHERE email = ? AND code = ? AND type = ? AND used = 0 ORDER BY created_at DESC LIMIT 1'
  ).get(email, code, type);

  if (!record) return { valid: false, error: 'رمز التحقق غير صحيح' };
  if (new Date(record.expires_at) < new Date()) return { valid: false, error: 'انتهت صلاحية رمز التحقق. أعد الإرسال.' };

  db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').run(record.id);
  return { valid: true };
}

function issueToken(admin, res) {
  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '8h' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
  });
  return token;
}

// ---------- تسجيل تاجر جديد ----------

router.post(
  '/register',
  registerLimiter,
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('اسم المستخدم يجب أن يكون بين 3 و 30 حرفًا'),
    body('email').isEmail().normalizeEmail().withMessage('البريد الإلكتروني غير صالح'),
    body('password').isLength({ min: 6 }).withMessage('كلمة السر يجب أن تكون 6 أحرف على الأقل'),
    body('store_name').trim().notEmpty().withMessage('اسم المتجر مطلوب'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { username, email, password, store_name } = req.body;

    const existingUser = db.prepare('SELECT id, is_verified FROM admins WHERE username = ?').get(username);
    if (existingUser && existingUser.is_verified) {
      return res.status(409).json({ error: 'اسم المستخدم مستخدم بالفعل' });
    }

    const existingEmail = db.prepare('SELECT id, is_verified FROM admins WHERE email = ?').get(email);
    if (existingEmail && existingEmail.is_verified) {
      return res.status(409).json({ error: 'البريد الإلكتروني مسجّل بالفعل' });
    }

    const hash = bcrypt.hashSync(password, 12);

    try {
      if (existingEmail && !existingEmail.is_verified) {
        db.prepare('DELETE FROM admins WHERE id = ?').run(existingEmail.id);
      }
      if (existingUser && !existingUser.is_verified) {
        db.prepare('DELETE FROM admins WHERE id = ?').run(existingUser.id);
      }

      db.prepare(
        'INSERT INTO admins (username, email, password_hash, store_name, is_verified) VALUES (?, ?, ?, ?, 0)'
      ).run(username, email, hash, store_name);

      await createAndSendOTP(email, 'register');

      res.json({ success: true, email, message: 'تم إنشاء المتجر وإرسال رمز التحقق إلى بريدك الإلكتروني' });
    } catch (err) {
      console.error('خطأ في التسجيل:', err);
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.' });
    }
  }
);

// ---------- التحقق من رمز OTP (تفعيل الحساب) ----------

router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('البريد الإلكتروني غير صالح'),
    body('code').trim().isLength({ min: 6, max: 6 }).withMessage('رمز التحقق يجب أن يكون 6 أرقام'),
    body('type').isIn(['register', 'reset_password']).withMessage('نوع غير صالح'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, code, type } = req.body;
    const result = verifyOTPCode(email, code, type);

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    if (type === 'register') {
      db.prepare('UPDATE admins SET is_verified = 1 WHERE email = ?').run(email);
      const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);

      if (!admin) {
        return res.status(404).json({ error: 'الحساب غير موجود' });
      }

      issueToken(admin, res);
      return res.json({ success: true, username: admin.username, message: 'تم تفعيل متجرك بنجاح! مرحبًا بك' });
    }

    res.json({ success: true, message: 'تم التحقق من الرمز. يمكنك الآن إعادة تعيين كلمة السر.' });
  }
);

// ---------- إعادة إرسال رمز التحقق ----------

router.post(
  '/resend-otp',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('البريد الإلكتروني غير صالح'),
    body('type').isIn(['register', 'reset_password']).withMessage('نوع غير صالح'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, type } = req.body;
    const admin = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);

    if (!admin) {
      return res.status(404).json({ error: 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني' });
    }

    try {
      await createAndSendOTP(email, type);
      res.json({ success: true, message: 'تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني' });
    } catch (err) {
      console.error('خطأ في إعادة إرسال OTP:', err);
      res.status(500).json({ error: 'تعذّر إرسال الرمز. تحقق من البريد.' });
    }
  }
);

// ---------- نسيت كلمة السر ----------

router.post(
  '/forgot-password',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('البريد الإلكتروني غير صالح'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email } = req.body;
    const admin = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);

    if (!admin) {
      return res.json({ success: true, message: 'إذا كان هذا البريد مسجّلاً، سيصلك رمز التحقق قريبًا.' });
    }

    try {
      await createAndSendOTP(email, 'reset_password');
      res.json({ success: true, message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' });
    } catch (err) {
      console.error('خطأ في إرسال رمز الاستعادة:', err);
      res.status(500).json({ error: 'تعذّر إرسال الرمز.' });
    }
  }
);

// ---------- إعادة تعيين كلمة السر ----------

router.post(
  '/reset-password',
  otpLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('البريد الإلكتروني غير صالح'),
    body('code').trim().isLength({ min: 6, max: 6 }).withMessage('رمز التحقق يجب أن يكون 6 أرقام'),
    body('new_password').isLength({ min: 6 }).withMessage('كلمة السر الجديدة يجب أن تكون 6 أحرف على الأقل'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, code, new_password } = req.body;
    const result = verifyOTPCode(email, code, 'reset_password');

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    const hash = bcrypt.hashSync(new_password, 12);
    db.prepare('UPDATE admins SET password_hash = ?, is_verified = 1 WHERE email = ?').run(hash, email);

    res.json({ success: true, message: 'تم تغيير كلمة السر بنجاح. يمكنك تسجيل الدخول الآن.' });
  }
);

// ---------- تسجيل الدخول (يقبل اسم المستخدم أو البريد الإلكتروني) ----------

router.post(
  '/login',
  loginLimiter,
  [
    body('username').trim().notEmpty().withMessage('اسم المستخدم أو البريد الإلكتروني مطلوب'),
    body('password').notEmpty().withMessage('كلمة السر مطلوبة'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { username, password } = req.body;
    const admin = db.prepare('SELECT * FROM admins WHERE username = ? OR email = ?').get(username, username);

    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة. تحقق من البيانات وحاول مجدداً.' });
    }

    // تفعيل تلقائي لحساب المشرف الرئيسي أو الحسابات المعلمة
    if (admin.username === 'louey' || admin.email === 'ahmedloueyhadjab01@gmail.com' || admin.email === process.env.SMTP_USER) {
      db.prepare('UPDATE admins SET is_verified = 1 WHERE id = ?').run(admin.id);
      admin.is_verified = 1;
    }

    if (!admin.is_verified) {
      // إرسال رمز تفعيل جديد تلقائياً
      try {
        await createAndSendOTP(admin.email, 'register');
      } catch (e) {
        console.error('خطأ إرسال OTP للدخول:', e);
      }
      return res.status(403).json({
        error: 'حسابك يحتاج تفعيل. تم إرسال رمز جديد لإيميلك.',
        need_verification: true,
        email: admin.email,
      });
    }

    issueToken(admin, res);
    res.json({ success: true, username: admin.username });
  }
);

// ---------- تسجيل الخروج ----------

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// ---------- معلومات الجلسة ----------

router.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.admin.username });
});

// ---------- حذف الحساب نهائياً ----------

router.delete('/delete-account', requireAuth, (req, res) => {
  try {
    const adminId = req.admin.id;
    const admin = db.prepare('SELECT email FROM admins WHERE id = ?').get(adminId);

    if (admin && admin.email) {
      db.prepare('DELETE FROM otp_codes WHERE email = ?').run(admin.email);
    }

    db.prepare('DELETE FROM admins WHERE id = ?').run(adminId);
    res.clearCookie('token');
    res.json({ success: true, message: 'تم حذف حسابك نهائياً وتدمير جميع الجلسات.' });
  } catch (err) {
    console.error('خطأ في حذف الحساب:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الحساب' });
  }
});

module.exports = router;
