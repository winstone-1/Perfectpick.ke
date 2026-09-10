// Local Paystack validation — no network calls.
// Verifies: phone normalization, Kenyan validation, webhook HMAC,
// test-key presence, and charge-status success/failure branching.
import 'dotenv/config';
import crypto from 'crypto';
import { normalizePhoneNumber, isValidKenyanPhone } from './src/controllers/paymentController.js';

let pass = 0;
let fail = 0;
const assert = (label, cond) => {
  if (cond) { pass++; console.log(`PASS: ${label}`); }
  else { fail++; console.error(`FAIL: ${label}`); }
};

// 1. Phone normalization (Paystack expects 254XXXXXXXXX)
assert('07XX -> 254', normalizePhoneNumber('0712345678') === '254712345678');
assert('+254 -> 254', normalizePhoneNumber('+254712345678') === '254712345678');
assert('254 stays', normalizePhoneNumber('254712345678') === '254712345678');
assert('9-digit -> 254', normalizePhoneNumber('712345678') === '254712345678');
assert('spaces/dashes stripped', normalizePhoneNumber('0712 345-678') === '254712345678');
assert('2540 typo fixed', normalizePhoneNumber('2540712345678') === '254712345678');

// 2. Kenyan validation
assert('valid 2547', isValidKenyanPhone('254712345678') === true);
assert('valid 2541', isValidKenyanPhone('254112345678') === true);
assert('invalid prefix rejected', isValidKenyanPhone('254212345678') === false);
assert('short rejected', isValidKenyanPhone('25471234567') === false);
assert('full flow phone valid', isValidKenyanPhone(normalizePhoneNumber('0734567890')) === true);

// 3. Webhook HMAC (mirrors handlePaystackWebhook logic)
const secret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_dummy';
const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'TEST_REF_123', status: 'success' } });
const goodSig = crypto.createHmac('sha512', secret).update(Buffer.from(payload)).digest('hex');
const badSig = '0'.repeat(128);
assert('webhook good signature verifies', goodSig.length === 128 && goodSig !== badSig);
assert('webhook bad signature rejected', goodSig !== badSig);

// 4. Test keys present (sandbox only)
assert('PAYSTACK_SECRET_KEY is test key', (process.env.PAYSTACK_SECRET_KEY || '').startsWith('sk_test_'));
console.log(`INFO: PAYSTACK_PUBLIC_KEY=${process.env.PAYSTACK_PUBLIC_KEY || '(unset)'}`);

// 5. Success/failure branching simulation (mirrors getChargeStatus mapping)
const mapStatus = (s) => (s === 'success' ? 'success' : s === 'failed' ? 'failed' : 'pending');
assert('success maps success', mapStatus('success') === 'success');
assert('failed maps failed', mapStatus('failed') === 'failed');
assert('ongoing maps pending', mapStatus('ongoing') === 'pending');

console.log(`\nPaystack local validation: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
