const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const {
  upload,
  getAllMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/adminController');

// All admin routes require admin role
router.get('/menu', verifyAdmin, getAllMenuItems);

// upload.single('image') handles one image file per request
router.post('/menu', verifyAdmin, upload.single('image'), addMenuItem);
router.put('/menu/:id', verifyAdmin, upload.single('image'), updateMenuItem);
router.delete('/menu/:id', verifyAdmin, deleteMenuItem);

module.exports = router;
