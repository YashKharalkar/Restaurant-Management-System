const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// Customer routes (authenticated)
router.post('/create', verifyToken, createOrder);
router.post('/verify', verifyToken, verifyPayment);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/:id', verifyToken, getOrderById);

// Admin routes
router.get('/admin/all', verifyAdmin, getAllOrders);
router.patch('/admin/:id/status', verifyAdmin, updateOrderStatus);

module.exports = router;
