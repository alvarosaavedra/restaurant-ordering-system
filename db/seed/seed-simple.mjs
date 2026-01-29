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

// Prevent seeding in production
if (process.env.NODE_ENV === 'production') {
  console.log('Skipping database seed in production environment');
  process.exit(0);
}

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

    // Insert clients
    for (const c of clientData) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO client (id, name, phone, address, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
        args: [c.id, c.name, c.phone, c.address, c.created_at, c.updated_at]
      });
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
