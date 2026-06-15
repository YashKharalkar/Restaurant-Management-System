const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer — save uploaded images to /uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only image files are allowed'), false);
  },
});

// GET /api/admin/menu
const getAllMenuItems = async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM menu_items ORDER BY id DESC');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/admin/menu
const addMenuItem = async (req, res) => {
  const { name, category, description, price } = req.body;

  if (!name || !category || !price)
    return res.status(400).json({ message: 'Name, category, and price are required' });

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await db.query(
      'INSERT INTO menu_items (name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, category, description || '', price, image_url]
    );
    res.status(201).json({ message: 'Menu item added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/admin/menu/:id
const updateMenuItem = async (req, res) => {
  const { name, category, description, price } = req.body;
  const { id } = req.params;

  try {
    const [existing] = await db.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (existing.length === 0)
      return res.status(404).json({ message: 'Menu item not found' });

    const item = existing[0];
    const image_url = req.file ? `/uploads/${req.file.filename}` : item.image_url;

    await db.query(
      'UPDATE menu_items SET name = ?, category = ?, description = ?, price = ?, image_url = ? WHERE id = ?',
      [name || item.name, category || item.category, description ?? item.description, price || item.price, image_url, id]
    );
    res.json({ message: 'Menu item updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/admin/menu/:id
const deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (existing.length === 0)
      return res.status(404).json({ message: 'Menu item not found' });

    if (existing[0].image_url) {
      const filePath = path.join(__dirname, '..', existing[0].image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM menu_items WHERE id = ?', [id]);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { upload, getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem };
