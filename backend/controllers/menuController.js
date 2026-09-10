const db = require('../config/db');

const getAllItems = async (req, res) => {
  const { search } = req.query;
  try {
    const query = search
      ? 'SELECT * FROM menu_items WHERE name LIKE ? ORDER BY category, name'
      : 'SELECT * FROM menu_items ORDER BY category, name';
    const params = search ? [`%${search}%`] : [];
    const [items] = await db.query(query, params);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getItemById = async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    if (items.length === 0)
      return res.status(404).json({ message: 'Menu item not found' });
    res.json(items[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllItems, getItemById };
