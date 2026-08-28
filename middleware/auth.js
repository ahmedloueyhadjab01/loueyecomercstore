const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح لك. الرجاء تسجيل الدخول.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة غير صالحة أو منتهية. الرجاء تسجيل الدخول من جديد.' });
  }
}

module.exports = { requireAuth };
