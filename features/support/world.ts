/**
 * Cucumber World Configuration
 * 
 * Provides the test context and shared state for BDD scenarios.
 * Each scenario gets its own instance of the World with Playwright browser.
 */

import { setWorldConstructor, World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { MockDatabase } from './mock-database';

export interface WorldParameters {
	headless: boolean;
	baseUrl: string;
}

export class CustomWorld extends CucumberWorld {
	public mockDb: MockDatabase;
	public baseUrl: string;
	public headless: boolean;
	
	// Playwright browser instances
	public browser?: Browser;
	public context?: BrowserContext;
	public page?: Page;
	
	// Scenario context - shared state between steps (renamed to avoid conflict with BrowserContext)
	public testContext: {
		// Authentication
		currentUser?: {
			id: string;
			email: string;
			role: string;
		};
		sessionToken?: string;
		
		// Current entities being worked with
		currentOrder?: {
			id: string;
			total: number;
			status: string;
		};
		currentMenuItem?: {
			id: string;
			name: string;
			price: number;
		};
		currentClient?: {
			id: string;
			name: string;
			phone: string;
			address?: string;
		};
		
		// Test tracking
		lastError?: string;
		loggedInUser?: string;
		testUser?: { firstName: string; email: string; role: string };
		formData?: Record<string, string | boolean>;
		
		// Cart/items tracking
		cartItems: Array<{
			menuItemId: string;
			quantity: number;
			variations: string[];
			modifiers: string[];
		}>;
		
		// Clean up tracking
		entitiesToCleanUp: string[];
	};

	constructor(options: IWorldOptions<WorldParameters>) {
		super(options);
		
		// Initialize mock database with worker ID for parallel isolation
		const workerId = process.env.CUCUMBER_WORKER_ID || '0';
		this.mockDb = new MockDatabase(workerId);
		
		// Set configuration from world parameters
		this.baseUrl = options.parameters.baseUrl || 'http://localhost:4173';
		this.headless = options.parameters.headless !== false;
		
		// Initialize context
		this.testContext = {
			cartItems: [],
			entitiesToCleanUp: []
		};
	}

	/**
	 * Initialize browser and page for UI testing
	 */
	async initBrowser(): Promise<void> {
		if (!this.browser) {
			this.browser = await chromium.launch({
				headless: this.headless
			});
		}
		
		if (!this.context) {
			this.context = await this.browser.newContext({
				viewport: { width: 1280, height: 720 }
			});
		}
		
		if (!this.page) {
			this.page = await this.context.newPage();
		}
	}

	/**
	 * Close browser after scenario
	 */
	async closeBrowser(): Promise<void> {
		if (this.context) {
			await this.context.close();
			this.context = undefined;
		}
		if (this.browser) {
			await this.browser.close();
			this.browser = undefined;
		}
		this.page = undefined;
	}

	/**
	 * Navigate to a path
	 */
	async navigateTo(path: string): Promise<void> {
		if (!this.page) {
			await this.initBrowser();
		}
		const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
		await this.page!.goto(url);
	}

	/**
	 * Reset the world state - called before each scenario
	 */
	reset(): void {
		this.mockDb.reset();
		this.testContext = {
			cartItems: [],
			entitiesToCleanUp: []
		};
	}

	/**
	 * Helper to set current user
	 */
	setCurrentUser(user: { id: string; email: string; role: string }): void {
		this.testContext.currentUser = user;
	}

	/**
	 * Helper to set current order
	 */
	setCurrentOrder(order: { id: string; total: number; status: string }): void {
		this.testContext.currentOrder = order;
	}

	/**
	 * Helper to track entity for cleanup
	 */
	trackEntity(id: string): void {
		this.testContext.entitiesToCleanUp.push(id);
	}

	/**
	 * Helper to add item to cart
	 */
	addToCart(item: {
		menuItemId: string;
		quantity: number;
		variations?: string[];
		modifiers?: string[];
	}): void {
		this.testContext.cartItems.push({
			menuItemId: item.menuItemId,
			quantity: item.quantity,
			variations: item.variations || [],
			modifiers: item.modifiers || []
		});
	}

	/**
	 * Helper to clear cart
	 */
	clearCart(): void {
		this.testContext.cartItems = [];
	}

	/**
	 * Helper to calculate cart total
	 */
	calculateCartTotal(): number {
		let total = 0;
		
		for (const cartItem of this.testContext.cartItems) {
			const menuItem = this.mockDb.getMenuItem(cartItem.menuItemId);
			if (!menuItem) continue;
			
			let itemTotal = menuItem.price * cartItem.quantity;
			
			// Add variation price adjustments
			for (const variationId of cartItem.variations) {
				const variation = this.mockDb.getVariation(variationId);
				if (variation) {
					itemTotal += variation.priceAdjustment * cartItem.quantity;
				}
			}
			
			// Add modifier prices
			for (const modifierId of cartItem.modifiers) {
				const modifier = this.mockDb.getModifier(modifierId);
				if (modifier) {
					itemTotal += modifier.price * cartItem.quantity;
				}
			}
			
			total += itemTotal;
		}
		
		return total;
	}

	/**
	 * Submit order from cart - creates order and order items
	 */
	submitOrderFromCart(): void {
		const user = this.testContext.currentUser;
		if (!user) {
			throw new Error('No user logged in');
		}

		const formData = this.testContext.formData || {};
		const customerName = formData['Customer Name']?.toString() || 'Unknown Customer';
		const phone = formData['Phone']?.toString();
		const address = formData['Address']?.toString();

		const total = this.calculateCartTotal();

		const order = this.mockDb.createOrder({
			customerName,
			customerPhone: phone,
			totalAmount: total,
			status: 'pending',
			employeeId: user.id,
			deliveryDateTime: new Date(),
			address: address || null,
			comment: null,
			deletedAt: null,
			discountAmount: null,
			discountType: null,
			discountValue: null,
			discountReason: null
		});

		// Create order items from cart
		for (const cartItem of this.testContext.cartItems) {
			const menuItem = this.mockDb.getMenuItem(cartItem.menuItemId);
			if (!menuItem) continue;

			let unitPrice = menuItem.price;
			
			// Add variation adjustments
			for (const variationId of cartItem.variations) {
				const variation = this.mockDb.getVariation(variationId);
				if (variation) {
					unitPrice += variation.priceAdjustment;
				}
			}

			const orderItem = this.mockDb.createOrderItem({
				orderId: order.id,
				menuItemId: menuItem.id,
				quantity: cartItem.quantity,
				unitPrice,
				discountAmount: null,
				discountType: null,
				discountValue: null,
				discountReason: null,
				finalPrice: null
			});

			// Add variations
			for (const variationId of cartItem.variations) {
				const variation = this.mockDb.getVariation(variationId);
				if (variation) {
					this.mockDb.createOrderItemVariation({
						orderItemId: orderItem.id,
						variationGroupId: variation.groupId,
						variationId: variation.id
					});
				}
			}

			// Add modifiers
			for (const modifierId of cartItem.modifiers) {
				const modifier = this.mockDb.getModifier(modifierId);
				if (modifier) {
					this.mockDb.createOrderItemModifier({
						orderItemId: orderItem.id,
						modifierId: modifier.id,
						quantity: 1,
						priceAtOrder: modifier.price
					});
				}
			}
		}

		this.trackEntity(order.id);
		this.testContext.currentOrder = {
			id: order.id,
			total,
			status: 'pending'
		};
		this.testContext.formData = {
			...(this.testContext.formData || {}),
			success: true,
			orderId: order.id
		};
		this.clearCart();
	}
}

// Register the custom world constructor
setWorldConstructor(CustomWorld);

export default CustomWorld;
