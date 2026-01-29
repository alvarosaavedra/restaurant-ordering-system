import { test, expect } from './fixtures/auth';
import type { Page } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

function getSidebarLocator(page: Page) {
  return page.locator('aside[role="navigation"][aria-label="Main navigation"]');
}

test.describe('Sidebar Navigation - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.waitForLoadState('networkidle');
  });

  test('mobile header with hamburger menu is visible', async ({ page, authenticatedAs }) => {
    await authenticatedAs('orderTaker');

    const mobileHeader = page.getByRole('banner').first();
    await expect(mobileHeader).toBeVisible();

    const hamburgerButton = page.getByRole('button', { name: /open menu/i });
    await expect(hamburgerButton).toBeVisible();

    const sidebar = getSidebarLocator(page);
    await expect(sidebar).toBeAttached();
  });

  test('sidebar opens when hamburger menu is clicked', async ({ page, authenticatedAs }) => {
    await authenticatedAs('orderTaker');

    const hamburgerButton = page.getByRole('button', { name: /open menu/i });
    await hamburgerButton.click();

    await page.waitForTimeout(500);

    const sidebar = getSidebarLocator(page);
    console.log(await sidebar.innerHTML());
    await expect(sidebar).not.toHaveAttribute('inert', '');

    const overlay = page.locator('div.fixed.inset-0.bg-neutral-900\\/50.z-\\[70\\]');
    await expect(overlay).toBeVisible();
  });

  test('sidebar contains all expected navigation items', async ({ page, authenticatedAs }) => {
    await authenticatedAs('orderTaker');

    const hamburgerButton = page.getByRole('button', { name: /open menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(500);

    const sidebarMenuItems = getSidebarLocator(page).getByRole('menuitem');
    await expect(sidebarMenuItems.getByText('Dashboard')).toBeVisible();
    await expect(sidebarMenuItems.getByText('New Order')).toBeVisible();
    await expect(sidebarMenuItems.getByText('Order History')).toBeVisible();

    await expect(sidebarMenuItems.getByText('Kitchen')).not.toBeVisible();
    await expect(sidebarMenuItems.getByText('Delivery')).not.toBeVisible();
  });

  test('navigation items are clickable and work correctly', async ({ page, authenticatedAs }) => {
    await authenticatedAs('orderTaker');

    const hamburgerButton = page.getByRole('button', { name: /open menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(500);

    await sidebarMenuItems.getByText('Order History').click();

    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/orders');

    const sidebar = getSidebarLocator(page);
    await expect(sidebar).toHaveAttribute('inert', '');
  });

  test('sidebar closes when clicking close button', async ({ page, authenticatedAs }) => {
    await authenticatedAs('orderTaker');

    const hamburgerButton = page.getByRole('button', { name: /open menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(700);

    const sidebar = getSidebarLocator(page);
    await expect(sidebar).toHaveAttribute('inert', '');

    const closeButton = page.getByRole('button', { name: /close menu/i });
    await closeButton.click();
    await page.waitForTimeout(700);

    await expect(sidebar).toHaveAttribute('inert', '');

    const overlay = page.locator('div.fixed.inset-0.bg-neutral-900\\/50.z-\\[95\\]');
    await expect(overlay).not.toBeVisible();
  });

  test('sidebar closes when clicking overlay backdrop', async ({ page, authenticatedAs }) => {
    await authenticatedAs('orderTaker');

    const hamburgerButton = page.getByRole('button', { name: /open menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(700);

    const sidebar = getSidebarLocator(page);
    await expect(sidebar).toHaveAttribute('inert', '');

    const overlay = page.locator('div.fixed.inset-0.bg-neutral-900\\/50.z-\\[95\\]');
    await overlay.click();
    await page.waitForTimeout(500);

    await expect(sidebar).toHaveAttribute('inert', '');
  });

  test('sidebar closes when pressing Escape key', async ({ page, authenticatedAs }) => {
    await authenticatedAs('orderTaker');

    const hamburgerButton = page.getByRole('button', { name: /open menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(700);

    const sidebar = getSidebarLocator(page);
    await expect(sidebar).toHaveAttribute('inert', '');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);

    await expect(sidebar).toHaveAttribute('inert', '');
  });

  test('sidebar displays user information correctly', async ({ page, authenticatedAs }) => {
    await authenticatedAs('orderTaker');

    const hamburgerButton = page.getByRole('button', { name: /open menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(500);

    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Order taker')).toBeVisible();
  });

  test('sidebar logout button is visible and functional', async ({ page, authenticatedAs }) => {
    await authenticatedAs('orderTaker');

    const hamburgerButton = page.getByRole('button', { name: /open menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(500);

    const logoutButton = page.getByRole('button', { name: 'Logout' });
    await expect(logoutButton).toBeVisible();

    await logoutButton.click();

    await expect(page).toHaveURL('/login');
  });

  test('active navigation item is highlighted', async ({ page, authenticatedAs }) => {
    await authenticatedAs('orderTaker');

    await expect(page).toHaveURL('/orders/new');

    const hamburgerButton = page.getByRole('button', { name: /open menu/i });
    await hamburgerButton.click();
    await page.waitForTimeout(500);

    const sidebarMenuItems = getSidebarLocator(page).getByRole('menuitem');
    const newOrderLink = sidebarMenuItems.getByText('New Order');
    await expect(newOrderLink).toHaveClass(/bg-bakery-100/);
    await expect(newOrderLink).toHaveClass(/text-bakery-700/);

    const dashboardLink = sidebarMenuItems.getByText('Dashboard');
    await expect(dashboardLink).not.toHaveClass(/bg-bakery-100/);
    await expect(dashboardLink).not.toHaveClass(/text-bakery-700/);
  });
});
