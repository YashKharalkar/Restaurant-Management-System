CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'created',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@restaurant.com',
  '$2b$10$6KJJ3pM4T1e.PdNEPMZFO.TpidMi8tFOH7LDtnJTxBu0zU4k7tH2',
  'admin'
);

INSERT INTO menu_items (name, category, description, price, image_url) VALUES
('Grilled Salmon', 'Mains', 'Fresh Atlantic salmon fillet grilled to perfection with lemon butter sauce.', 450.00, NULL),
('Margherita Pizza', 'Mains', 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil.', 320.00, NULL),
('Caesar Salad', 'Starters', 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan.', 180.00, NULL),
('Chicken Tikka', 'Starters', 'Tender chicken marinated in yogurt and spices, grilled in a tandoor.', 260.00, NULL),
('Chocolate Lava Cake', 'Desserts', 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream.', 150.00, NULL),
('Mango Lassi', 'Drinks', 'Refreshing blended drink made with fresh mango, yogurt, and a hint of cardamom.', 90.00, NULL);
