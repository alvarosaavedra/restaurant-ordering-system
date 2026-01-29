import { test as base } from '@playwright/test';
import * as testUtils from './test-utils';

type TestFixtures = {
	workerIndex: number;
	workerDb: ReturnType<typeof testUtils.getTestDb>;
	createTestUser: typeof testUtils.createTestUser;
	createTestUsers: typeof testUtils.createTestUsers;
	createTestCategory: typeof testUtils.createTestCategory;
	createTestCategories: typeof testUtils.createTestCategories;
	createTestMenuItem: typeof testUtils.createTestMenuItem;
	createTestMenuItems: typeof testUtils.createTestMenuItems;
	createTestOrder: typeof testUtils.createTestOrder;
	createTestOrderItems: typeof testUtils.createTestOrderItems;
	createTestOrderWithItems: typeof testUtils.createTestOrderWithItems;
	cleanupAllTestData: typeof testUtils.cleanupAllTestData;
	deleteTestUser: typeof testUtils.deleteTestUser;
	deleteTestCategory: typeof testUtils.deleteTestCategory;
	deleteTestMenuItem: typeof testUtils.deleteTestMenuItem;
	deleteTestOrder: typeof testUtils.deleteTestOrder;
};

export const test = base.extend<TestFixtures>({
	workerIndex: async (_, use) => {
		const workerIndex = process.env.TEST_WORKER_INDEX ? parseInt(process.env.TEST_WORKER_INDEX, 10) : 0;
		testUtils.setCurrentWorkerIndex(workerIndex);
		await use(workerIndex);
	},
	workerDb: async ({ workerIndex }, use) => {
		await use(testUtils.getTestDb(workerIndex));
	},
	createTestUser: async (_, use) => {
		await use(testUtils.createTestUser);
	},
	createTestUsers: async (_, use) => {
		await use(testUtils.createTestUsers);
	},
	createTestCategory: async (_, use) => {
		await use(testUtils.createTestCategory);
	},
	createTestCategories: async (_, use) => {
		await use(testUtils.createTestCategories);
	},
	createTestMenuItem: async (_, use) => {
		await use(testUtils.createTestMenuItem);
	},
	createTestMenuItems: async (_, use) => {
		await use(testUtils.createTestMenuItems);
	},
	createTestOrder: async (_, use) => {
		await use(testUtils.createTestOrder);
	},
	createTestOrderItems: async (_, use) => {
		await use(testUtils.createTestOrderItems);
	},
	createTestOrderWithItems: async (_, use) => {
		await use(testUtils.createTestOrderWithItems);
	},
	cleanupAllTestData: async ({ workerIndex }, use) => {
		await use(() => testUtils.cleanupAllTestData(workerIndex));
	},
	deleteTestUser: async ({ workerIndex }, use) => {
		await use((userId) => testUtils.deleteTestUser(userId, workerIndex));
	},
	deleteTestCategory: async ({ workerIndex }, use) => {
		await use((categoryId) => testUtils.deleteTestCategory(categoryId, workerIndex));
	},
	deleteTestMenuItem: async ({ workerIndex }, use) => {
		await use((menuItemId) => testUtils.deleteTestMenuItem(menuItemId, workerIndex));
	},
	deleteTestOrder: async ({ workerIndex }, use) => {
		await use((orderId) => testUtils.deleteTestOrder(orderId, workerIndex));
	}
});

export const expect = test.expect;
