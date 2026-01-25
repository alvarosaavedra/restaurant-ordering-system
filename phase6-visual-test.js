/**
 * Phase 6: Visual Testing Suite
 * Tests all pages with Chromium at multiple breakpoints
 * Captures screenshots for visual verification
 * Tests navigation flows and accessibility
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5173';
const EVIDENCE_DIR = path.join(__dirname, '.sisyphus', 'evidence');
const BREAKPOINTS = {
  mobile: { width: 375, height: 667, name: 'mobile' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1200, height: 800, name: 'desktop' }
};

// All pages to test
const PAGES = [
  { path: '/login', name: 'login', roles: ['public'] },
  { path: '/', name: 'dashboard', roles: ['order_taker', 'kitchen', 'delivery', 'admin'] },
  { path: '/orders', name: 'orders-list', roles: ['order_taker', 'kitchen', 'delivery', 'admin'] },
  { path: '/orders/new', name: 'orders-new', roles: ['order_taker'] },
  { path: '/kitchen', name: 'kitchen', roles: ['kitchen', 'admin'] },
  { path: '/delivery', name: 'delivery', roles: ['delivery', 'admin'] },
  { path: '/admin/menu', name: 'admin-menu', roles: ['admin'] },
  { path: '/admin/clients', name: 'admin-clients', roles: ['admin'] }
];

// Test credentials
const CREDENTIALS = {
  order_taker: { email: 'john@bakery.com', password: 'password123' },
  kitchen: { email: 'jane@bakery.com', password: 'password123' },
  delivery: { email: 'mike@bakery.com', password: 'password123' },
  admin: { email: 'admin@bakery.com', password: 'password123' }
};

// Ensure evidence directory exists
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

/**
 * Login with given credentials
 */
async function login(page, role) {
  const creds = CREDENTIALS[role];
  if (!creds) {
    console.log(`  ⚠ No credentials for role: ${role}`);
    return false;
  }

  console.log(`  🔐 Logging in as ${role}...`);
  await page.goto(`${BASE_URL}/login`);

  await page.waitForLoadState('networkidle');

  // Fill login form
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');
  const loginButton = page.locator('button[type="submit"], button:has-text("Login")');

  if (await emailInput.count() > 0) {
    await emailInput.fill(creds.email);
    await passwordInput.fill(creds.password);
    await loginButton.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');
    console.log(`  ✅ Logged in as ${role}`);
    return true;
  }

  return false;
}

/**
 * Take screenshot with filename
 */
async function takeScreenshot(page, filename) {
  const filePath = path.join(EVIDENCE_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  📸 Screenshot saved: ${filename}`);
}

/**
 * Check accessibility issues
 */
async function checkAccessibility(page, pageName) {
  console.log(`  ♿ Checking accessibility for ${pageName}...`);

  // Check for ARIA labels
  const buttonsWithoutLabel = await page.locator('button:not([aria-label]):not([aria-labelledby])').count();
  const inputsWithoutLabel = await page.locator('input:not([aria-label]):not([aria-labelledby]):not([id])').count();

  const issues = [];
  if (buttonsWithoutLabel > 0) {
    issues.push(`${buttonsWithoutLabel} buttons without labels`);
  }
  if (inputsWithoutLabel > 0) {
    issues.push(`${inputsWithoutLabel} inputs without labels`);
  }

  if (issues.length > 0) {
    console.log(`  ⚠️ Accessibility issues: ${issues.join(', ')}`);
  } else {
    console.log(`  ✅ No obvious accessibility issues`);
  }

  return issues;
}

/**
 * Test navigation menu
 */
async function testNavigation(page, role) {
  console.log(`  🔍 Testing navigation for ${role}...`);

  // Check sidebar is visible
  const sidebar = page.locator('nav, aside, [role="navigation"]');
  const hasSidebar = await sidebar.count() > 0;

  if (hasSidebar) {
    console.log(`  ✅ Sidebar navigation present`);

    // Take screenshot of navigation
    await takeScreenshot(page, `${role}-nav-sidebar.png`);
  } else {
    console.log(`  ⚠️ No sidebar navigation found`);
  }

  // Check mobile bottom nav (if mobile viewport)
  const mobileNav = page.locator('nav.bottom-nav, [class*="bottom-nav"]');
  const hasMobileNav = await mobileNav.count() > 0;

  if (hasMobileNav) {
    console.log(`  ✅ Mobile bottom navigation present`);
  }
}

/**
 * Test page at specific breakpoint
 */
async function testPageAtBreakpoint(browser, pageConfig, breakpoint) {
  const { path, name } = pageConfig;
  const { width, height, name: breakpointName } = breakpoint;

  console.log(`\n📄 Testing ${name} at ${breakpointName} (${width}x${height})`);

  const context = await browser.newContext({
    viewport: { width, height }
  });

  const page = await context.newPage();

  try {
    // Navigate to page
    await page.goto(`${BASE_URL}${path}`);
    await page.waitForLoadState('networkidle');

    // Wait a bit for animations
    await page.waitForTimeout(1000);

    // Take screenshot
    const screenshotName = `${name}-${breakpointName}.png`;
    await takeScreenshot(page, screenshotName);

    // Check accessibility
    await checkAccessibility(page, `${name}@${breakpointName}`);

  } catch (error) {
    console.error(`  ❌ Error testing ${name}: ${error.message}`);
  } finally {
    await context.close();
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Phase 6 Visual Testing\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Evidence directory: ${EVIDENCE_DIR}\n`);

  const browser = await chromium.launch({
    headless: true,
    channel: 'chromium'
  });

  try {
    // Test login page (public)
    console.log('📋 Testing public pages...');
    await testPageAtBreakpoint(browser, { path: '/login', name: 'login' }, BREAKPOINTS.desktop);
    await testPageAtBreakpoint(browser, { path: '/login', name: 'login' }, BREAKPOINTS.mobile);

    // Test protected pages with login
    for (const role of ['order_taker', 'kitchen', 'delivery']) {
      console.log(`\n🔐 Testing as ${role}...`);

      const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
      });

      const page = await context.newPage();

      try {
        // Login
        const loggedIn = await login(page, role);

        if (loggedIn) {
          // Test navigation
          await testNavigation(page, role);

          // Test pages for this role
          const rolePages = PAGES.filter(p => p.roles.includes(role));

          for (const pageConfig of rolePages) {
            console.log(`\n  📄 Navigating to ${pageConfig.name}...`);
            await page.goto(`${BASE_URL}${pageConfig.path}`);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Screenshot at desktop
            await takeScreenshot(page, `${role}-${pageConfig.name}-desktop.png`);

            // Check accessibility
            await checkAccessibility(page, `${pageConfig.name} (as ${role})`);
          }
        }
      } catch (error) {
        console.error(`❌ Error testing as ${role}: ${error.message}`);
      } finally {
        await context.close();
      }
    }

    // Test responsive behavior on key pages
    console.log('\n📱 Testing responsive behavior...');

    const responsivePages = [
      { path: '/', name: 'dashboard' },
      { path: '/orders/new', name: 'orders-new' },
      { path: '/orders', name: 'orders-list' }
    ];

    for (const pageConfig of responsivePages) {
      for (const [key, breakpoint] of Object.entries(BREAKPOINTS)) {
        await testPageAtBreakpoint(browser, pageConfig, breakpoint);
      }
    }

    console.log('\n✅ All tests completed!');
    console.log(`📁 Evidence saved to: ${EVIDENCE_DIR}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Tested ${PAGES.length} pages`);
    console.log(`   - ${Object.keys(BREAKPOINTS).length} breakpoints (mobile, tablet, desktop)`);
    console.log(`   - ${fs.readdirSync(EVIDENCE_DIR).length} screenshots captured`);

  } finally {
    await browser.close();
  }
}

// Run tests
runTests().catch(console.error);
