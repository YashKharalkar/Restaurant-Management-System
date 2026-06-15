const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/menu',    require('./routes/menuRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/admin',   require('./routes/adminRoutes'));

app.get('/', (req, res) => res.json({ message: 'Restaurant API is running!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
