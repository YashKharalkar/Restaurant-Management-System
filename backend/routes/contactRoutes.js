const express = require('express');
const router = express.Router();
const { saveContact } = require('../controllers/contactController');

router.post('/', saveContact);  // POST /api/contact

module.exports = router;
