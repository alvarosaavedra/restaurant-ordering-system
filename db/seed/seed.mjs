import { drizzle } from "drizzle-orm";
import { nanoid } from "nanoid";
import { category, menuItem, user, client, order, orderItem } from "$lib/server/db/schema";

const db = drizzle(new sqlite.Database("file:local.db"));

const categories = [
	{ id: nanoid(), name: "Bakery Items", displayOrder: 1, createdAt: new Date() },
	{ id: nanoid(), name: "Beverages", displayOrder: 2, createdAt: new Date() },
	{ id: nanoid(), name: "Sandwiches", displayOrder: 3, createdAt: new Date() },
	{ id: nanoid(), name: "Pastries", displayOrder: 4, createdAt: new Date() }
];

const menuItems = [
	{ id: nanoid(), categoryId: categories[0].id, name: "Fresh Bread", description: "Artisan sourdough bread baked daily", price: 4.99, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[0].id, name: "Croissant", description: "Buttery French croissant", price: 3.49, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[0].id, name: "Baguette", description: "Classic French baguette", price: 3.99, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[1].id, name: "Coffee", description: "Freshly brewed coffee", price: 2.99, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[1].id, name: "Tea", description: "Selection of hot teas", price: 2.49, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[1].id, name: "Orange Juice", description: "Fresh squeezed orange juice", price: 3.99, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[2].id, name: "Turkey Club", description: "Turkey, bacon, lettuce, tomato on sourdough", price: 8.99, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[2].id, name: "BLT", description: "Bacon, lettuce, tomato on toast", price: 7.99, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[2].id, name: "Grilled Cheese", description: "Classic grilled cheese sandwich", price: 6.99, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[3].id, name: "Chocolate Cake", description: "Rich chocolate cake with frosting", price: 5.99, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[3].id, name: "Apple Pie", description: "Traditional apple pie with cinnamon", price: 4.99, isAvailable: true, createdAt: new Date() },
	{ id: nanoid(), categoryId: categories[3].id, name: "Cookies", description: "Assorted fresh baked cookies", price: 2.99, isAvailable: true, createdAt: new Date() }
];

const users = [
	{ id: nanoid(), name: "John Doe", email: "john@bakery.com", passwordHash: "password123", role: "order_taker", createdAt: new Date(), updatedAt: new Date() },
	{ id: nanoid(), name: "Jane Smith", email: "jane@bakery.com", passwordHash: "password123", role: "kitchen", createdAt: new Date(), updatedAt: new Date() },
	{ id: nanoid(), name: "Mike Johnson", email: "mike@bakery.com", passwordHash: "password123", role: "delivery", createdAt: new Date(), updatedAt: new Date() },
	{ id: nanoid(), name: "Admin User", email: "admin@bakery.com", passwordHash: "password123", role: "admin", createdAt: new Date(), updatedAt: new Date() }
];

const clientData = [
	{ id: nanoid(), name: "Alice Johnson", phone: "555-1234", address: "123 Main St", createdAt: new Date(), updatedAt: new Date() },
	{ id: nanoid(), name: "Bob Smith", phone: "555-5678", address: "456 Oak Ave", createdAt: new Date(), updatedAt: new Date() },
	{ id: nanoid(), name: "Carol Williams", phone: "555-9012", address: "789 Pine Rd", createdAt: new Date(), updatedAt: new Date() },
	{ id: nanoid(), name: "David Brown", phone: "555-3456", address: "321 Elm St", createdAt: new Date(), updatedAt: new Date() },
	{ id: nanoid(), name: "Emma Davis", phone: "555-6789", address: "654 Maple Ave", createdAt: new Date(), updatedAt: new Date() },
	{ id: nanoid(), name: "Frank Miller", phone: "555-4321", address: "987 Cedar Ln", createdAt: new Date(), updatedAt: new Date() }
];

export async function seedDatabase() {
	console.log("Seeding database...");
	
	try {
		const menuItemsWithIds = menuItems.map(item => ({
			id: nanoid(),
			...item,
			createdAt: item.createdAt
		}));

		await db.insert(category).values(categories);
		await db.insert(menuItem).values(menuItemsWithIds);
		await db.insert(user).values(users);
		await db.insert(client).values(clientData);

		const now = new Date();
		const order1Id = nanoid();
		const order2Id = nanoid();
		const order3Id = nanoid();
		const order4Id = nanoid();

		await db.insert(order).values([
			{
				id: order1Id,
				customerName: "Alice Johnson",
				customerPhone: "555-1234",
				totalAmount: 12.47,
				status: "ready",
				employeeId: users[0].id,
				deliveryDateTime: new Date(now.getTime() + 60 * 60 * 1000),
				address: "123 Main St",
				comment: "Leave at door",
				createdAt: new Date(now.getTime() - 2 * 60 * 1000),
				updatedAt: new Date(now.getTime() - 2 * 60 * 1000)
			},
			{
				id: order2Id,
				customerName: "Bob Smith",
				customerPhone: "555-5678",
				totalAmount: 8.99,
				status: "ready",
				employeeId: users[0].id,
				deliveryDateTime: new Date(now.getTime() + 90 * 60 * 1000),
				address: "456 Oak Ave",
				createdAt: new Date(now.getTime() - 5 * 60 * 1000),
				updatedAt: new Date(now.getTime() - 5 * 60 * 1000)
			},
			{
				id: order3Id,
				customerName: "Carol Williams",
				customerPhone: "555-9012",
				totalAmount: 15.98,
				status: "pending",
				employeeId: users[0].id,
				deliveryDateTime: new Date(now.getTime() + 120 * 60 * 1000),
				comment: "Allergic to nuts",
				createdAt: new Date(now.getTime() - 10 * 60 * 1000),
				updatedAt: new Date(now.getTime() - 10 * 60 * 1000)
			},
			{
				id: order4Id,
				customerName: "David Brown",
				customerPhone: "555-3456",
				totalAmount: 3.99,
				status: "preparing",
				employeeId: users[0].id,
				deliveryDateTime: new Date(now.getTime() + 30 * 60 * 1000),
				createdAt: new Date(now.getTime() - 15 * 60 * 1000),
				updatedAt: new Date(now.getTime() - 15 * 60 * 1000)
			}
		]);

		await db.insert(orderItem).values([
			{ id: nanoid(), orderId: order1Id, menuItemId: menuItemsWithIds[1].id, quantity: 1, unitPrice: 3.49, createdAt: now },
			{ id: nanoid(), orderId: order1Id, menuItemId: menuItemsWithIds[2].id, quantity: 1, unitPrice: 3.99, createdAt: now },
			{ id: nanoid(), orderId: order3Id, menuItemId: menuItemsWithIds[0].id, quantity: 2, unitPrice: 4.99, createdAt: now },
			{ id: nanoid(), orderId: order3Id, menuItemId: menuItemsWithIds[4].id, quantity: 2, unitPrice: 2.99, createdAt: now },
			{ id: nanoid(), orderId: order4Id, menuItemId: menuItemsWithIds[5].id, quantity: 1, unitPrice: 3.99, createdAt: now }
		]);

		console.log("Database seeded successfully!");
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
}

seedDatabase();
