import axios from 'axios';

// Helper to get M-Pesa Access Token
const getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(
            'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
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

        // Format phone: 07XX... to 2547XX...
        let phone = phoneNumber;
        if (phone.startsWith('0')) {
            phone = '254' + phone.slice(1);
        } else if (phone.startsWith('+')) {
            phone = phone.slice(1);
        }

        const accessToken = await getAccessToken();
        const timestamp = getTimestamp();
        const shortCode = process.env.MPESA_SHORTCODE;
        const passKey = process.env.MPESA_PASSKEY;
        const password = Buffer.from(shortCode + passKey + timestamp).toString('base64');

        const response = await axios.post(
            'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
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
        res.status(500).json({
            success: false,
            message: error.response ? error.response.data : error.message
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
        const accessToken = await getAccessToken();
        const timestamp = getTimestamp();
        const shortCode = process.env.MPESA_SHORTCODE;
        const passKey = process.env.MPESA_PASSKEY;
        const password = Buffer.from(shortCode + passKey + timestamp).toString('base64');

        const response = await axios.post(
            'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
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
        res.status(500).json({
            success: false,
            message: error.response ? error.response.data : error.message
        });
    }
};
