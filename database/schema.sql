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

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  delivery_address TEXT NOT NULL,
  order_notes TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('online', 'cod') DEFAULT 'online',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  order_status ENUM('confirmed', 'completed', 'cancelled') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT,
  item_name VARCHAR(150) NOT NULL,
  item_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  special_instructions TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  reservation_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  guests_count INT NOT NULL,
  seating_zone VARCHAR(100) NOT NULL,
  special_requests TEXT,
  status ENUM('confirmed', 'completed', 'cancelled') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@restaurant.com',
  '$2b$10$6KJJ3pM4T1e.PdNEPMZFO.TpidMi8tFOH7LDtnJTxBu0zU4k7tH2',
  'admin'
) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO menu_items (name, category, description, price, image_url) VALUES
('Grilled Salmon', 'Mains', 'Fresh Atlantic salmon fillet grilled to perfection with lemon butter sauce.', 450.00, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80'),
('Margherita Pizza', 'Mains', 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil.', 320.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80'),
('Caesar Salad', 'Starters', 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan.', 180.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'),
('Chicken Tikka', 'Starters', 'Tender chicken marinated in yogurt and spices, grilled in a tandoor.', 260.00, 'https://images.unsplash.com/photo-1610614819513-58e34989848b?w=600&q=80'),
('Paneer Butter Masala', 'Mains', 'Fresh cottage cheese cubes simmered in a rich tomato, butter, and cashew gravy.', 280.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80'),
('Butter Naan', 'Mains', 'Traditional tandoori flatbread brushed with fresh creamy butter.', 60.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80'),
('Chocolate Lava Cake', 'Desserts', 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream.', 150.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80'),
('Gulab Jamun', 'Desserts', 'Warm, soft milk-solid dumplings soaked in aromatic saffron and cardamom syrup.', 120.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80'),
('Mango Lassi', 'Drinks', 'Refreshing blended drink made with fresh mango, yogurt, and a hint of cardamom.', 90.00, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&q=80');



