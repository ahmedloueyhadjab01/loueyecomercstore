const crypto = require('crypto');

function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'fallback_secret_must_be_32_bytes_len!';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt sensitive plain text using AES-256-GCM.
 * Prepends 'enc:' prefix with IV and Auth Tag.
 */
function encryptText(plainText) {
  if (!plainText || typeof plainText !== 'string') return plainText;
  const str = plainText.trim();
  if (!str || str.startsWith('enc:')) return str;

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(str, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('Encryption error:', err.message);
    return plainText;
  }
}

/**
 * Decrypt AES-256-GCM encrypted text.
 * If text is not encrypted (does not start with 'enc:'), returns as-is for backward compatibility.
 */
function decryptText(cipherText) {
  if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('enc:')) {
    return cipherText || '';
  }

  try {
    const parts = cipherText.slice(4).split(':');
    if (parts.length !== 3) return cipherText;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err.message);
    return cipherText;
  }
}

module.exports = { encryptText, decryptText };
