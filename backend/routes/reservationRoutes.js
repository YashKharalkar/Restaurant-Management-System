const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const {
  getAvailability,
  bookReservation,
  getMyReservations,
  cancelReservation,
  getAllReservations,
  updateReservationStatus,
} = require('../controllers/reservationController');

// Public or logged-in
router.get('/availability', getAvailability);

// Optional auth for booking (can book with user_id attached if logged in)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      // ignore invalid token in optional auth
    }
  }
  next();
};

router.post('/book', optionalAuth, bookReservation);
router.get('/my-reservations', verifyToken, getMyReservations);
router.patch('/cancel/:id', verifyToken, cancelReservation);

// Admin endpoints
router.get('/admin/all', verifyAdmin, getAllReservations);
router.patch('/admin/:id/status', verifyAdmin, updateReservationStatus);

module.exports = router;
