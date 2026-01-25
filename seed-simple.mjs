import { drizzle } from "drizzle-orm";
import { nanoid } from "nanoid";

const db = drizzle(new sqlite.Database("file:local.db"));

const categories = [
  { id: nanoid(), name: "Bakery Items", display_order: 1, created_at: new Date() },
  { id: nanoid(), name: "Beverages", display_order: 2, created_at: new Date() },
  { id: nanoid(), name: "Sandwiches", display_order: 3, created_at: new Date() },
  { id: nanoid(), name: "Pastries", display_order: 4, created_at: new Date() }
];

const menuItems = [
  { id: nanoid(), category_id: categories[0].id, name: "Fresh Bread", description: "Artisan sourdough bread baked daily", price: 4.99, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[0].id, name: "Croissant", description: "Buttery French croissant", price: 3.49, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[0].id, name: "Baguette", description: "Classic French baguette", price: 3.99, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[1].id, name: "Coffee", description: "Freshly brewed coffee", price: 2.99, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[1].id, name: "Tea", description: "Selection of hot teas", price: 2.49, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[1].id, name: "Orange Juice", description: "Fresh squeezed orange juice", price: 3.99, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[2].id, name: "Turkey Club", description: "Turkey, bacon, lettuce, tomato on sourdough", price: 8.99, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[2].id, name: "BLT", description: "Bacon, lettuce, tomato on toast", price: 7.99, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[2].id, name: "Grilled Cheese", description: "Classic grilled cheese sandwich", price: 6.99, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[3].id, name: "Chocolate Cake", description: "Rich chocolate cake with frosting", price: 5.99, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[3].id, name: "Apple Pie", description: "Traditional apple pie with cinnamon", price: 4.99, is_available: 1, created_at: new Date() },
  { id: nanoid(), category_id: categories[3].id, name: "Cookies", description: "Assorted fresh baked cookies", price: 2.99, is_available: 1, created_at: new Date() }
];

const users = [
  { id: nanoid(), name: "John Doe", email: "john@bakery.com", password_hash: "password123", role: "order_taker", created_at: new Date(), updated_at: new Date() },
  { id: nanoid(), name: "Jane Smith", email: "jane@bakery.com", password_hash: "password123", role: "kitchen", created_at: new Date(), updated_at: new Date() },
  { id: nanoid(), name: "Mike Johnson", email: "mike@bakery.com", password_hash: "password123", role: "delivery", created_at: new Date(), updated_at: new Date() },
  { id: nanoid(), name: "Admin User", email: "admin@bakery.com", password_hash: "password123", role: "admin", created_at: new Date(), updated_at: new Date() }
];

const clientData = [
  { id: nanoid(), name: "Alice Johnson", phone: "555-1234", address: "123 Main St", created_at: new Date(), updated_at: new Date() },
  { id: nanoid(), name: "Bob Smith", phone: "555-5678", address: "456 Oak Ave", created_at: new Date(), updated_at: new Date() },
  { id: nanoid(), name: "Carol Williams", phone: "555-9012", address: "789 Pine Rd", created_at: new Date(), updated_at: new Date() },
  { id: nanoid(), name: "David Brown", phone: "555-3456", address: "321 Elm St", created_at: new Date(), updated_at: new Date() },
  { id: nanoid(), name: "Emma Davis", phone: "555-6789", address: "654 Maple Ave", created_at: new Date(), updated_at: new Date() },
  { id: nanoid(), name: "Frank Miller", phone: "555-4321", address: "987 Cedar Ln", created_at: new Date(), updated_at: new Date() }
];

async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    const menuItemsWithIds = menuItems.map(item => ({
      id: nanoid(),
      ...item,
      created_at: item.created_at
    }));

    // Create tables with double quotes for SQLite keywords
    db.run("CREATE TABLE IF NOT EXISTS category (id TEXT PRIMARY KEY, name TEXT NOT NULL, display_order INTEGER NOT NULL, created_at INTEGER NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS menu_item (id TEXT PRIMARY KEY, category_id TEXT NOT NULL, name TEXT NOT NULL, description TEXT, price REAL NOT NULL, is_available INTEGER NOT NULL, created_at INTEGER NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS client (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE, address TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS [order] (id TEXT PRIMARY KEY, customer_name TEXT NOT NULL, customer_phone TEXT, total_amount REAL NOT NULL, status TEXT NOT NULL, employee_id TEXT NOT NULL, delivery_date_time INTEGER NOT NULL, address TEXT, comment TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, FOREIGN KEY (employee_id) REFERENCES user(id))");
    db.run("CREATE TABLE IF NOT EXISTS order_item (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, menu_item_id TEXT NOT NULL, quantity INTEGER NOT NULL, unit_price REAL NOT NULL, created_at INTEGER NOT NULL, FOREIGN KEY (order_id) REFERENCES [order](id) ON DELETE CASCADE, FOREIGN KEY (menu_item_id) REFERENCES menu_item(id))");

    // Insert data
    const insertCategory = db.prepare("INSERT INTO category (id, name, display_order, created_at) VALUES (?, ?, ?, ?)");
    categories.forEach(cat => insertCategory.run(cat.id, cat.name, cat.display_order, cat.created_at));

    const insertMenuItem = db.prepare("INSERT INTO menu_item (id, category_id, name, description, price, is_available, created_at) VALUES (?, ?, ?, ?, ?)");
    menuItems.forEach(item => insertMenuItem.run(item.id, item.categoryId, item.name, item.description, item.price, item.isAvailable ? 1 : 0, item.createdAt));

    const insertUser = db.prepare("INSERT OR IGNORE INTO user (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    users.forEach(u => insertUser.run(u.id, u.name, u.email, u.password_hash, u.role, u.createdAt, u.updatedAt));

    const insertClient = db.prepare("INSERT OR REPLACE INTO client (id, name, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
    clientData.forEach(c => insertClient.run(c.id, c.name, c.phone, c.address, c.createdAt, c.updatedAt));

    const now = new Date();
    const order1Id = nanoid();
    const order2Id = nanoid();
    const order3Id = nanoid();
    const order4Id = nanoid();

    const insertOrder = db.prepare("INSERT INTO [order] (id, customer_name, customer_phone, total_amount, status, employee_id, delivery_date_time, address, comment, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    const orderData = [
      { id: order1Id, customer_name: "Alice Johnson", customer_phone: "555-1234", total_amount: 12.47, status: "ready", employee_id: users[0].id, delivery_date_time: new Date(now.getTime() + 60 * 60 * 1000), address: "123 Main St", comment: "Leave at door", created_at: new Date(now.getTime() - 2 * 60 * 1000), updated_at: new Date(now.getTime() - 2 * 60 * 1000) },
      { id: order2Id, customer_name: "Bob Smith", customer_phone: "555-5678", total_amount: 8.99, status: "ready", employee_id: users[0].id, delivery_date_time: new Date(now.getTime() + 90 * 60 * 1000), address: "456 Oak Ave", created_at: new Date(now.getTime() - 5 * 60 * 1000), updated_at: new Date(now.getTime() - 5 * 60 * 1000) },
      { id: order3Id, customer_name: "Carol Williams", customer_phone: "555-9012", total_amount: 15.98, status: "pending", employee_id: users[0].id, delivery_date_time: new Date(now.getTime() + 120 * 60 * 1000), comment: "Allergic to nuts", created_at: new Date(now.getTime() - 10 * 60 * 1000), updated_at: new Date(now.getTime() - 10 * 60 * 1000) },
      { id: order4Id, customer_name: "David Brown", customer_phone: "555-3456", total_amount: 3.99, status: "preparing", employee_id: users[0].id, delivery_date_time: new Date(now.getTime() + 30 * 60 * 1000), created_at: new Date(now.getTime() - 15 * 60 * 1000), updated_at: new Date(now.getTime() - 15 * 60 * 1000) }
    ];

    orderData.forEach(o => insertOrder.run(...Object.values(o)));

    const insertOrderItem = db.prepare("INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?)");
    
    // Order 1 items
    insertOrderItem.run(nanoid(), order1Id, menuItemsWithIds[1].id, 1, 3.49, now);
    insertOrderItem.run(nanoid(), order1Id, menuItemsWithIds[2].id, 1, 3.99, now);
    
    // Order 2 items
    insertOrderItem.run(nanoid(), order2Id, menuItemsWithIds[6].id, 1, 8.99, now);
    
    // Order 3 items
    insertOrderItem.run(nanoid(), order3Id, menuItemsWithIds[0].id, 2, 4.99, now);
    insertOrderItem.run(nanoid(), order3Id, menuItemsWithIds[4].id, 2, 2.99, now);
    
    // Order 4 items
    insertOrderItem.run(nanoid(), order4Id, menuItemsWithIds[5].id, 1, 3.99, now);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
