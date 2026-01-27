import { nanoid } from "nanoid";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env file manually
const envPath = resolve(process.cwd(), ".env");
const envContent = readFileSync(envPath, "utf-8");
const envVars = Object.fromEntries(envContent.split("\n").filter(line => line.trim()).map(line => line.split("=")));
const DATABASE_URL = envVars.DATABASE_URL || "file:local.db";

// Using libsql client directly
import { createClient } from "@libsql/client";

const client = createClient({ url: DATABASE_URL });

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
    const now = new Date();

    // Insert categories
    for (const cat of categories) {
      await client.execute({
        sql: "INSERT INTO category (id, name, display_order, created_at) VALUES ($1, $2, $3, $4)",
        args: [cat.id, cat.name, cat.display_order, cat.created_at]
      });
    }

    // Insert menu items
    for (const item of menuItems) {
      await client.execute({
        sql: "INSERT INTO menu_item (id, category_id, name, description, price, is_available, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        args: [item.id, item.category_id, item.name, item.description, item.price, item.is_available, item.created_at]
      });
    }

    // Insert users
    for (const user of users) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO user (id, name, email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        args: [user.id, user.name, user.email, user.password_hash, user.role, user.created_at, user.updated_at]
      });
    }

    // Insert clients
    for (const c of clientData) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO client (id, name, phone, address, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
        args: [c.id, c.name, c.phone, c.address, c.created_at, c.updated_at]
      });
    }

    // Insert orders
    const order1Id = nanoid();
    const order2Id = nanoid();
    const order3Id = nanoid();
    const order4Id = nanoid();

    const orderData = [
      { id: order1Id, customer_name: "Alice Johnson", customer_phone: "555-1234", total_amount: 12.47, status: "ready", employee_id: users[0].id, delivery_date_time: now.getTime() + 60 * 60 * 1000, address: "123 Main St", comment: "Leave at door", created_at: now.getTime() - 2 * 60 * 1000, updated_at: now.getTime() - 2 * 60 * 1000 },
      { id: order2Id, customer_name: "Bob Smith", customer_phone: "555-5678", total_amount: 8.99, status: "ready", employee_id: users[0].id, delivery_date_time: now.getTime() + 90 * 60 * 1000, address: "456 Oak Ave", comment: null, created_at: now.getTime() - 5 * 60 * 1000, updated_at: now.getTime() - 5 * 60 * 1000 },
      { id: order3Id, customer_name: "Carol Williams", customer_phone: "555-9012", total_amount: 15.98, status: "pending", employee_id: users[0].id, delivery_date_time: now.getTime() + 120 * 60 * 1000, address: null, comment: "Allergic to nuts", created_at: now.getTime() - 10 * 60 * 1000, updated_at: now.getTime() - 10 * 60 * 1000 },
      { id: order4Id, customer_name: "David Brown", customer_phone: "555-3456", total_amount: 3.99, status: "preparing", employee_id: users[0].id, delivery_date_time: now.getTime() + 30 * 60 * 1000, address: null, comment: null, created_at: now.getTime() - 15 * 60 * 1000, updated_at: now.getTime() - 15 * 60 * 1000 }
    ];

    for (const order of orderData) {
      await client.execute({
        sql: 'INSERT INTO "order" (id, customer_name, customer_phone, total_amount, status, employee_id, delivery_date_time, address, comment, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        args: [order.id, order.customer_name, order.customer_phone, order.total_amount, order.status, order.employee_id, order.delivery_date_time, order.address, order.comment, order.created_at, order.updated_at]
      });
    }

    // Insert order items
    // Order 1 items
    await client.execute({
      sql: "INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      args: [nanoid(), order1Id, menuItems[1].id, 1, 3.49, now]
    });
    await client.execute({
      sql: "INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      args: [nanoid(), order1Id, menuItems[2].id, 1, 3.99, now]
    });

    // Order 2 items
    await client.execute({
      sql: "INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      args: [nanoid(), order2Id, menuItems[6].id, 1, 8.99, now]
    });

    // Order 3 items
    await client.execute({
      sql: "INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      args: [nanoid(), order3Id, menuItems[0].id, 2, 4.99, now]
    });
    await client.execute({
      sql: "INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      args: [nanoid(), order3Id, menuItems[4].id, 2, 2.99, now]
    });

    // Order 4 items
    await client.execute({
      sql: "INSERT INTO order_item (id, order_id, menu_item_id, quantity, unit_price, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      args: [nanoid(), order4Id, menuItems[5].id, 1, 3.99, now]
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
