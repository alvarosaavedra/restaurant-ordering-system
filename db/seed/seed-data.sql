-- Insert sample categories
INSERT INTO category (id, name, display_order, created_at) VALUES
('cat1', 'Bakery Items', 1, 1737202800000),
('cat2', 'Beverages', 2, 1737202800000),
('cat3', 'Sandwiches', 3, 1737202800000),
('cat4', 'Pastries', 4, 1737202800000);

-- Insert sample menu items
INSERT INTO menu_item (id, category_id, name, description, price, is_available, created_at) VALUES
-- Bakery Items
('item1', 'cat1', 'Fresh Bread', 'Artisan sourdough bread baked daily', 4.99, 1, 1737202800000),
('item2', 'cat1', 'Croissant', 'Buttery French croissant', 3.49, 1, 1737202800000),
('item3', 'cat1', 'Baguette', 'Classic French baguette', 3.99, 1, 1737202800000),

-- Beverages
('item4', 'cat2', 'Coffee', 'Freshly brewed coffee', 2.99, 1, 1737202800000),
('item5', 'cat2', 'Tea', 'Selection of hot teas', 2.49, 1, 1737202800000),
('item6', 'cat2', 'Orange Juice', 'Fresh squeezed orange juice', 3.99, 1, 1737202800000),

-- Sandwiches
('item7', 'cat3', 'Turkey Club', 'Turkey, bacon, lettuce, tomato on sourdough', 8.99, 1, 1737202800000),
('item8', 'cat3', 'BLT', 'Bacon, lettuce, tomato on toast', 7.99, 1, 1737202800000),
('item9', 'cat3', 'Grilled Cheese', 'Classic grilled cheese sandwich', 6.99, 1, 1737202800000),

-- Pastries
('item10', 'cat4', 'Chocolate Cake', 'Rich chocolate cake with frosting', 5.99, 1, 1737202800000),
('item11', 'cat4', 'Apple Pie', 'Traditional apple pie with cinnamon', 4.99, 1, 1737202800000),
('item12', 'cat4', 'Cookies', 'Assorted fresh baked cookies', 2.99, 1, 1737202800000);

-- Insert sample users
INSERT INTO user (id, name, email, password_hash, role, created_at, updated_at) VALUES
('user1', 'John Doe', 'john@bakery.com', 'password123', 'order_taker', 1737202800000, 1737202800000),
('user2', 'Jane Smith', 'jane@bakery.com', 'password123', 'kitchen', 1737202800000, 1737202800000),
('user3', 'Mike Johnson', 'mike@bakery.com', 'password123', 'delivery', 1737202800000, 1737202800000);