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

router.get('/menu', verifyAdmin, getAllMenuItems);
router.post('/menu', verifyAdmin, upload.single('image'), addMenuItem);
router.put('/menu/:id', verifyAdmin, upload.single('image'), updateMenuItem);
router.delete('/menu/:id', verifyAdmin, deleteMenuItem);

module.exports = router;
