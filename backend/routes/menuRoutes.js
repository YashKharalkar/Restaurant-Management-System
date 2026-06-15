const express = require('express');
const router = express.Router();
const { getAllItems, getItemById } = require('../controllers/menuController');

router.get('/', getAllItems);       // GET /api/menu?search=pizza
router.get('/:id', getItemById);   // GET /api/menu/1

module.exports = router;
