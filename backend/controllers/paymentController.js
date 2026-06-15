const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
const createOrder = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0)
    return res.status(400).json({ message: 'Valid amount is required' });

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    await db.query(
      'INSERT INTO payments (user_id, razorpay_order_id, amount, status) VALUES (?, ?, ?, ?)',
      [req.user.id, order.id, amount, 'created']
    );

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    await db.query('UPDATE payments SET status = ? WHERE razorpay_order_id = ?', ['failed', razorpay_order_id]);
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  await db.query(
    'UPDATE payments SET razorpay_payment_id = ?, status = ? WHERE razorpay_order_id = ?',
    [razorpay_payment_id, 'paid', razorpay_order_id]
  );

  res.json({ message: 'Payment verified successfully!' });
};

module.exports = { createOrder, verifyPayment };
