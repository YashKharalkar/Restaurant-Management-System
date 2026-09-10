const express = require('express');
const router = express.Router();
const { getAllItems, getItemById } = require('../controllers/menuController');

router.get('/', getAllItems);
router.get('/:id', getItemById);

module.exports = router;
