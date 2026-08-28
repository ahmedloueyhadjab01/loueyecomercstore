const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, safeName);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('نوع الملف غير مسموح. يُسمح فقط بصور JPEG, PNG, WEBP, GIF'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5MB لكل صورة، حتى 6 صور
});

module.exports = upload;
