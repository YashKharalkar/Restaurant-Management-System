const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a new order (Online or COD)
const createOrder = async (req, res) => {
  const {
    items,
    delivery_address,
    contact_phone,
    customer_name,
    customer_email,
    order_notes,
    payment_method = 'online',
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart cannot be empty.' });
  }

  if (!delivery_address || !contact_phone) {
    return res.status(400).json({ message: 'Delivery address and contact phone are required.' });
  }

  const userId = req.user ? req.user.id : null;
  const name = customer_name || req.user?.name || 'Valued Guest';
  const email = customer_email || req.user?.email || 'customer@grandtable.com';

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty || 1), 0);

  if (totalAmount <= 0) {
    return res.status(400).json({ message: 'Invalid order total amount.' });
  }

  try {
    let razorpayOrderId = null;

    if (payment_method === 'online') {
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `ord_${Date.now()}`,
      });
      razorpayOrderId = rzpOrder.id;
    }

    // Insert order into orders table
    const [orderResult] = await db.query(
      `INSERT INTO orders 
        (user_id, customer_name, customer_email, contact_phone, delivery_address, order_notes, total_amount, payment_method, payment_status, razorpay_order_id, order_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        email,
        contact_phone,
        delivery_address,
        order_notes || '',
        totalAmount,
        payment_method,
        payment_method === 'cod' ? 'pending' : 'pending',
        razorpayOrderId,
        'confirmed',
      ]
    );

    const dbOrderId = orderResult.insertId;

    // Insert each order item
    for (const item of items) {
      const qty = item.qty || 1;
      const subtotal = Number(item.price) * qty;
      await db.query(
        `INSERT INTO order_items 
          (order_id, menu_item_id, item_name, item_price, quantity, special_instructions, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          dbOrderId,
          item.id || null,
          item.name,
          item.price,
          qty,
          item.special_instructions || item.notes || '',
          subtotal,
        ]
      );
    }

    if (payment_method === 'online') {
      // Also register into payments table
      await db.query(
        'INSERT INTO payments (user_id, razorpay_order_id, amount, status) VALUES (?, ?, ?, ?)',
        [userId, razorpayOrderId, totalAmount, 'created']
      );

      return res.json({
        dbOrderId,
        orderId: razorpayOrderId,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        payment_method: 'online',
      });
    }

    // COD order response
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Pay on delivery.',
      dbOrderId,
      payment_method: 'cod',
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Failed to process order', error: err.message });
  }
};

// Verify Razorpay Payment
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    await db.query('UPDATE orders SET payment_status = ? WHERE razorpay_order_id = ?', ['failed', razorpay_order_id]);
    await db.query('UPDATE payments SET status = ? WHERE razorpay_order_id = ?', ['failed', razorpay_order_id]);
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  // Update order status
  await db.query(
    'UPDATE orders SET payment_status = ?, razorpay_payment_id = ? WHERE razorpay_order_id = ? OR id = ?',
    ['paid', razorpay_payment_id, razorpay_order_id, db_order_id || 0]
  );

  await db.query(
    'UPDATE payments SET razorpay_payment_id = ?, status = ? WHERE razorpay_order_id = ?',
    [razorpay_payment_id, 'paid', razorpay_order_id]
  );

  res.json({ message: 'Payment verified and order confirmed successfully!' });
};

// Get current user's past orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );

    // Fetch items for each order
    for (const order of orders) {
      const [items] = await db.query(
        'SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC',
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// Get a single order detail (for invoice / order details)
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Authorization check: User can only see their own order unless admin
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this order' });
    }

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    order.items = items;

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY id DESC');

    for (const order of orders) {
      const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all orders', error: err.message });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { order_status, payment_status } = req.body;

  try {
    const updates = [];
    const values = [];

    if (order_status) {
      updates.push('order_status = ?');
      values.push(order_status);
    }
    if (payment_status) {
      updates.push('payment_status = ?');
      values.push(payment_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No status changes provided' });
    }

    values.push(id);
    await db.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
