import { test as base } from '@playwright/test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../../src/lib/server/db/schema';
import { nanoid } from 'nanoid';
import type {
	InsertClient,
	InsertMenuItem,
	InsertCategory,
	InsertOrder,
	InsertOrderItem
} from '../../src/lib/server/db/schema';

let testDb: ReturnType<typeof drizzle>;

function getDatabasePath(): string {
	const workerIndex = process.env.TEST_WORKER_INDEX || '0';
	return `file:test-worker-${workerIndex}.db`;
}

export async function createOrder(orderData: Partial<InsertOrder> & { items?: Partial<InsertOrderItem>[] } = {}) {
	const order = {
		id: orderData.id || nanoid(),
		customerName: orderData.customerName || 'Test Customer',
		customerPhone: orderData.customerPhone || null,
		totalAmount: orderData.totalAmount || 0,
		status: orderData.status || 'pending',
		employeeId: orderData.employeeId || '',
		deliveryDateTime: orderData.deliveryDateTime || new Date(),
		address: orderData.address || null,
		comment: orderData.comment || null,
		createdAt: orderData.createdAt || new Date(),
		updatedAt: orderData.updatedAt || new Date()
	};

	await testDb.insert(schema.order).values(order);

	if (orderData.items) {
		for (const item of orderData.items) {
			await testDb.insert(schema.orderItem).values({
				id: item.id || nanoid(),
				orderId: order.id,
				menuItemId: item.menuItemId,
				quantity: item.quantity || 1,
				unitPrice: item.unitPrice || 0,
				createdAt: item.createdAt || new Date()
			});
		}
	}

	return order;
}

export const test = base.extend<{
	getDb: () => typeof testDb;
	clearDatabase: () => Promise<void>;
	seedClient: (client: InsertClient) => Promise<string>;
	seedMenuItem: (item: InsertMenuItem) => Promise<string>;
	seedCategory: (category: InsertCategory) => Promise<string>;
}>({
	getDb: async (_, use) => {
		use(() => testDb);
	},

	clearDatabase: async (_, use) => {
		await use(async () => {
			if (!testDb) return;

			const db = testDb;
			await db.delete(schema.orderItem);
			await db.delete(schema.order);
			await db.delete(schema.client);
			await db.delete(schema.menuItem);
			await db.delete(schema.category);
			await db.delete(schema.session);
			await db.delete(schema.user);
		});
	},

	seedClient: async (_, use) => {
		await use(async (clientData) => {
			const client = {
				...clientData,
				id: clientData.id || nanoid(),
				createdAt: clientData.createdAt || new Date(),
				updatedAt: clientData.updatedAt || new Date()
			};
			await testDb.insert(schema.client).values(client);
			return client.id;
		});
	},

	seedMenuItem: async (_, use) => {
		await use(async (itemData) => {
			const item = {
				...itemData,
				id: itemData.id || nanoid(),
				createdAt: itemData.createdAt || new Date()
			};
			await testDb.insert(schema.menuItem).values(item);
			return item.id;
		});
	},

	seedCategory: async (_, use) => {
		await use(async (categoryData) => {
			const category = {
				...categoryData,
				id: categoryData.id || nanoid(),
				displayOrder: categoryData.displayOrder ?? 0,
				createdAt: categoryData.createdAt || new Date()
			};
			await testDb.insert(schema.category).values(category);
			return category.id;
		});
	}
});

test.beforeAll(async () => {
	const dbUrl = getDatabasePath();
	const client = createClient({ url: dbUrl });
	testDb = drizzle(client, { schema });
});

test.afterAll(async () => {
	testDb = undefined as unknown;
});

