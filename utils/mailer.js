const nodemailer = require('nodemailer');

// إنشاء ناقل SMTP (يُعاد استخدامه في كل الإرسالات)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true لـ 465, false لـ 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * إرسال رمز تحقق OTP لإيميل التاجر
 * @param {string} email - إيميل التاجر
 * @param {string} code - رمز التحقق (6 أرقام)
 * @param {'register'|'reset_password'} type - نوع الرمز
 */
async function sendOTP(email, code, type) {
  const isRegister = type === 'register';
  const subject = isRegister
    ? '🔐 رمز التحقق — تفعيل متجرك الإلكتروني'
    : '🔑 رمز التحقق — استعادة كلمة السر';

  const title = isRegister
    ? 'مرحبًا بك! أنت على بُعد خطوة من إطلاق متجرك'
    : 'طلب استعادة كلمة السر';

  const description = isRegister
    ? 'استخدم الرمز التالي لتفعيل حسابك وبدء إدارة متجرك الإلكتروني:'
    : 'استخدم الرمز التالي لإعادة تعيين كلمة السر الخاصة بمتجرك:';

  const html = `
  <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #FAF3E6; border-radius: 16px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #17241F; font-size: 22px; margin: 0 0 8px;">${title}</h1>
      <p style="color: #555; font-size: 14px; margin: 0;">${description}</p>
    </div>
    <div style="background: #ffffff; border: 2px solid #1E6F54; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <p style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1E6F54; margin: 0; direction: ltr;">${code}</p>
    </div>
    <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
      هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط. إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: `"متجرك الإلكتروني" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
}

module.exports = { sendOTP };
