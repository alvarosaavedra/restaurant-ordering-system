/**
 * Cucumber World Configuration
 * 
 * Provides the test context and shared state for BDD scenarios.
 * Each scenario gets its own instance of the World.
 */

import { setWorldConstructor, World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber';
import { MockDatabase } from './mock-database';

export interface WorldParameters {
	headless: boolean;
	baseUrl: string;
}

export class CustomWorld extends CucumberWorld {
	public mockDb: MockDatabase;
	public baseUrl: string;
	public headless: boolean;
	
	// Scenario context - shared state between steps
	public context: {
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
		};
		
		// UI state
		lastResponse?: {
			status: number;
			body: unknown;
		};
		lastError?: string;
		
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
		this.context = {
			cartItems: [],
			entitiesToCleanUp: []
		};
	}

	/**
	 * Reset the world state - called before each scenario
	 */
	reset(): void {
		this.mockDb.reset();
		this.context = {
			cartItems: [],
			entitiesToCleanUp: []
		};
	}

	/**
	 * Helper to set current user
	 */
	setCurrentUser(user: { id: string; email: string; role: string }): void {
		this.context.currentUser = user;
	}

	/**
	 * Helper to set current order
	 */
	setCurrentOrder(order: { id: string; total: number; status: string }): void {
		this.context.currentOrder = order;
	}

	/**
	 * Helper to track entity for cleanup
	 */
	trackEntity(id: string): void {
		this.context.entitiesToCleanUp.push(id);
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
		this.context.cartItems.push({
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
		this.context.cartItems = [];
	}

	/**
	 * Helper to calculate cart total
	 */
	calculateCartTotal(): number {
		let total = 0;
		
		for (const cartItem of this.context.cartItems) {
			const menuItem = this.mockDb.getMenuItem(cartItem.menuItemId);
			if (!menuItem) continue;
			
			let itemTotal = menuItem.price * cartItem.quantity;
			
			// Add variation adjustments
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
}

// Register the custom world constructor
setWorldConstructor(CustomWorld);

export default CustomWorld;
