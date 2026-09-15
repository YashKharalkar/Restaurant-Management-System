const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const {
  upload,
  getAllMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getContacts,
  deleteContact,
} = require('../controllers/adminController');

router.get('/menu', verifyAdmin, getAllMenuItems);
router.post('/menu', verifyAdmin, upload.single('image'), addMenuItem);
router.put('/menu/:id', verifyAdmin, upload.single('image'), updateMenuItem);
router.delete('/menu/:id', verifyAdmin, deleteMenuItem);

router.get('/contacts', verifyAdmin, getContacts);
router.delete('/contacts/:id', verifyAdmin, deleteContact);

module.exports = router;

