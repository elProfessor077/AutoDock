import { generateSecret, generateURI, generateSync, verifySync } from 'otplib';
import QRCode from 'qrcode';

/**
 * Generate a new TOTP secret, otpauth URI, and QR Code Data URL
 * @param {string} userEmail - User's email address or identifier
 * @param {string} appName - Issuer name shown in authenticator app (default: "AutoDock")
 */
export async function generateTotpSecret(userEmail = 'user@AutoDock.local', appName = 'AutoDock') {
  const secret = generateSecret();
  const otpauth = generateURI({
    issuer: appName,
    label: userEmail,
    secret: secret,
  });

  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(otpauth, {
      margin: 1,
      width: 200,
      color: {
        dark: '#3b82f6',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
  }

  return {
    secret,
    otpauth,
    qrCodeDataUrl,
  };
}

/**
 * Verify a 6-digit TOTP token against a secret
 * @param {string} secret - User's TOTP secret key
 * @param {string} token - Entered 6-digit token
 * @returns {boolean} True if valid
 */
export function verifyTotpToken(secret, token) {
  if (!secret || !token) return false;
  try {
    const result = verifySync({
      secret,
      token,
      epochTolerance: 30, // Allows 1 period window offset
    });
    return result?.valid === true;
  } catch (err) {
    console.error('TOTP verification error:', err);
    return false;
  }
}

/**
 * Generate the current expected TOTP token for a given secret
 * Useful for demo / quick test helper
 * @param {string} secret 
 * @returns {string} 6-digit token
 */
export function getCurrentTotpToken(secret) {
  if (!secret) return '';
  try {
    return generateSync({ secret });
  } catch (err) {
    console.error('TOTP generation error:', err);
    return '';
  }
}

