import axios from 'axios';
import { isNonEmptyString, isPositiveNumber } from '../middleware/validate.js';

// NOTE: legacy Daraja (direct Safaricom) stack. Production traffic uses Paystack
// (paymentController.js); this file is kept for manual Till fallback only.
// Set MPESA_PROVIDER=paystack (default) to disable these routes at the router level.

// Safaricom sandbox vs production: never hit the live money API from dev/test.
const MPESA_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

// Helper to get M-Pesa Access Token
const getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(
            `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('M-Pesa auth error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get M-Pesa access token');
    }
};

// Helper to get Timestamp in YYYYMMDDHHmmss
const getTimestamp = () => {
    const date = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    return (
        date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
};

// @desc    Initiate STK Push
// @route   POST /api/mpesa/stkpush
export const stkPush = async (req, res) => {
    try {
        const { phoneNumber, amount } = req.body;

        // SECURITY: phoneNumber could be undefined/object → .startsWith crash (500 leak).
        // Validate types first, then normalize strictly to 254XXXXXXXXX.
        if (!isNonEmptyString(phoneNumber, 32) || !isPositiveNumber(amount)) {
            return res.status(400).json({ success: false, message: 'Valid phone number and amount are required' });
        }

        // Format phone: 07XX... to 2547XX...
        let phone = phoneNumber.trim();
        if (phone.startsWith('0')) {
            phone = '254' + phone.slice(1);
        } else if (phone.startsWith('+')) {
            phone = phone.slice(1);
        }
        phone = phone.replace(/\D/g, '');
        if (!/^254(7|1)\d{8}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Invalid Kenyan phone number' });
        }

        const accessToken = await getAccessToken();
        const timestamp = getTimestamp();
        const shortCode = process.env.MPESA_SHORTCODE;
        const passKey = process.env.MPESA_PASSKEY;
        const password = Buffer.from(shortCode + passKey + timestamp).toString('base64');

        const response = await axios.post(
            `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
            {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerBuyGoodsOnline',
                Amount: amount,
                PartyA: phone,
                PartyB: shortCode,
                PhoneNumber: phone,
                CallBackURL: process.env.MPESA_CALLBACK_URL,
                AccountReference: 'PerfectPick',
                TransactionDesc: 'Payment for order',
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        res.json({ success: true, data: response.data });
    } catch (error) {
        // SECURITY: Safaricom error bodies can contain credentials-adjacent metadata —
        // log full detail server-side, return a generic message to clients.
        console.error('M-Pesa STK error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate M-Pesa payment. Please try again.'
        });
    }
};

// @desc    M-Pesa Callback
// @route   POST /api/mpesa/callback
export const mpesaCallback = async (req, res) => {
    console.log('--- M-Pesa Callback Received ---');
    console.log(JSON.stringify(req.body, null, 2));

    // Log logic would go here (e.g., updating order status in DB based on CheckoutRequestID)

    res.json({
        ResultCode: 0,
        ResultDesc: 'Success',
    });
};

// @desc    Query STK Push Status
// @route   POST /api/mpesa/query
export const queryStkStatus = async (req, res) => {
    try {
        const { checkoutRequestId } = req.body;
        // SECURITY: checkoutRequestId is echoed into the Safaricom request — require string.
        if (!isNonEmptyString(checkoutRequestId, 128)) {
            return res.status(400).json({ success: false, message: 'checkoutRequestId is required' });
        }
        const accessToken = await getAccessToken();
        const timestamp = getTimestamp();
        const shortCode = process.env.MPESA_SHORTCODE;
        const passKey = process.env.MPESA_PASSKEY;
        const password = Buffer.from(shortCode + passKey + timestamp).toString('base64');

        const response = await axios.post(
            `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
            {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        res.json({
            success: true,
            resultCode: response.data.ResultCode,
            resultDesc: response.data.ResultDesc,
            data: response.data
        });
    } catch (error) {
        // SECURITY: generic client message; full detail stays in server logs.
        console.error('M-Pesa query error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to query payment status. Please try again.'
        });
    }
};
