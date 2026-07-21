import { test, expect } from '@playwright/test';

const BASE = 'https://cvber.vercel.app';
const API = 'https://cvber-free-las-app.onrender.com';

test.describe('Gate form full flow', () => {
  test('step 1: who are you', async ({ page }) => {
    await page.goto(`${BASE}/gate`);
    
    // Wait for the question to appear
    await expect(page.locator('h2:has-text("Who are you")')).toBeVisible({ timeout: 15000 });
    
    // Type answer
    const textarea = page.locator('textarea').first();
    await textarea.fill('Digital illustrator and concept artist');
    
    // Click Continue
    const continueBtn = page.locator('button:has-text("Continue")');
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();
    
    // Should advance to step 2
    await expect(page.locator('h2:has-text("Why do you want")')).toBeVisible({ timeout: 10000 });
    console.log('STEP 1 PASSED: Who are you → Continue works');
  });

  test('step 2: why want', async ({ page }) => {
    await page.goto(`${BASE}/gate`);
    await expect(page.locator('h2:has-text("Who are you")')).toBeVisible({ timeout: 15000 });
    
    // Step 1
    await page.locator('textarea').first().fill('Photographer');
    await page.locator('button:has-text("Continue")').click();
    
    // Step 2
    await expect(page.locator('h2:has-text("Why do you want")')).toBeVisible({ timeout: 10000 });
    await page.locator('textarea').first().fill('My photos are being scraped by AI training datasets');
    await page.locator('button:has-text("Continue")').click();
    
    // Step 3
    await expect(page.locator('h2:has-text("Why should we")')).toBeVisible({ timeout: 10000 });
    console.log('STEP 2 PASSED: Why want → Continue works');
  });

  test('step 3: why give + email + submit', async ({ page }) => {
    await page.goto(`${BASE}/gate`);
    await expect(page.locator('h2:has-text("Who are you")')).toBeVisible({ timeout: 15000 });
    
    // Step 1
    await page.locator('textarea').first().fill('Game artist');
    await page.locator('button:has-text("Continue")').click();
    
    // Step 2
    await expect(page.locator('h2:has-text("Why do you want")')).toBeVisible({ timeout: 10000 });
    await page.locator('textarea').first().fill('AI companies are training on my game assets');
    await page.locator('button:has-text("Continue")').click();
    
    // Step 3
    await expect(page.locator('h2:has-text("Why should we")')).toBeVisible({ timeout: 10000 });
    await page.locator('textarea').first().fill('I have proof of theft with no way to claim ownership');
    await page.locator('button:has-text("Continue")').click();
    
    // Step 4: Email
    await expect(page.locator('h2:has-text("email")')).toBeVisible({ timeout: 10000 });
    await page.locator('input[type="email"]').fill('test@example.com');
    
    // Submit
    const submitBtn = page.locator('button:has-text("Apply for Access")');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    
    // Should show countdown/pending state
    await expect(page.locator('text=Application submitted')).toBeVisible({ timeout: 15000 });
    console.log('STEP 3 PASSED: Email + Apply → Application submitted');
  });

  test('back button works', async ({ page }) => {
    await page.goto(`${BASE}/gate`);
    await expect(page.locator('h2:has-text("Who are you")')).toBeVisible({ timeout: 15000 });
    
    // Step 1
    await page.locator('textarea').first().fill('Tester');
    await page.locator('button:has-text("Continue")').click();
    await expect(page.locator('h2:has-text("Why do you want")')).toBeVisible({ timeout: 10000 });
    
    // Click Back
    await page.locator('button:has-text("Back")').click();
    
    // Should go back to step 1
    await expect(page.locator('h2:has-text("Who are you")')).toBeVisible({ timeout: 10000 });
    console.log('BACK BUTTON PASSED');
  });

  test('empty answer disables continue', async ({ page }) => {
    await page.goto(`${BASE}/gate`);
    await expect(page.locator('h2:has-text("Who are you")')).toBeVisible({ timeout: 15000 });
    
    const continueBtn = page.locator('button:has-text("Continue")');
    await expect(continueBtn).toBeDisabled();
    
    // Type something → enabled
    await page.locator('textarea').first().fill('test');
    await expect(continueBtn).toBeEnabled();
    
    // Clear → disabled again
    await page.locator('textarea').first().fill('');
    await expect(continueBtn).toBeDisabled();
    console.log('VALIDATION PASSED: Empty answer disables continue');
  });
});

test.describe('Gate API endpoint', () => {
  test('POST /api/gate returns position', async ({ request }) => {
    const res = await request.post(`${API}/api/gate`, {
      data: {
        email: `test-${Date.now()}@example.com`,
        who_are_you: 'Tester',
        why_want: 'Testing',
        why_give: 'Testing the form',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('pending');
    expect(body.position).toBeGreaterThan(0);
    console.log(`API PASSED: Got position #${body.position}`);
  });

  test('GET /api/gate/status returns status', async ({ request }) => {
    // First apply
    const email = `status-test-${Date.now()}@example.com`;
    await request.post(`${API}/api/gate`, {
      data: { email, who_are_you: 'Test', why_want: 'Test', why_give: 'Test' },
    });
    
    // Then check status
    const res = await request.get(`${API}/api/gate/status?email=${email}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('pending');
    expect(body.position).toBeGreaterThan(0);
    console.log(`STATUS API PASSED: status=${body.status}, position=${body.position}`);
  });

  test('GET /api/gate/remaining returns count', async ({ request }) => {
    const res = await request.get(`${API}/api/gate/remaining`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.remaining).toBeGreaterThan(0);
    expect(body.total).toBe(10000);
    console.log(`REMAINING API PASSED: ${body.remaining} spots left`);
  });
});

test.describe('Claim flow', () => {
  test('claim page loads', async ({ page }) => {
    await page.goto(`${BASE}/claim`);
    await expect(page.locator('h1:has-text("Claim")')).toBeVisible({ timeout: 15000 });
    console.log('CLAIM PAGE PASSED');
  });
});

test.describe('Homepage full check', () => {
  test('all sections render', async ({ page }) => {
    await page.goto(BASE);
    
    // Hero
    await expect(page.locator('text=Protect it then own it')).toBeVisible({ timeout: 15000 });
    
    // About
    await expect(page.locator('text=Pioneering protection')).toBeVisible();
    
    // Featured painting
    await expect(page.locator('text=The Concert').first()).toBeVisible();
    
    // Philosophy
    await expect(page.locator('text=Nativity')).toBeVisible();
    
    // Services
    await expect(page.locator('text=What we do')).toBeVisible();
    
    // Footer
    await expect(page.locator('footer')).toBeVisible();
    
    console.log('ALL SECTIONS PASSED');
  });

  test('no broken images', async ({ page }) => {
    const failedImages: string[] = [];
    page.on('response', response => {
      const url = response.url();
      if ((url.includes('googleusercontent.com') || url.includes('unsplash')) && response.status() >= 400) {
        failedImages.push(`${response.status()} ${url}`);
      }
    });
    await page.goto(BASE);
    await page.waitForTimeout(5000);
    expect(failedImages).toEqual([]);
    console.log('NO BROKEN IMAGES PASSED');
  });

  test('all nav links work', async ({ page }) => {
    await page.goto(BASE);
    
    const links = [
      { text: 'Features', path: '/features' },
      { text: 'How It Works', path: '/how-it-works' },
      { text: 'Art Hub', path: '/art-hub' },
      { text: 'Blog', path: '/blog' },
      { text: 'Verify', path: '/verify' },
      { text: 'Log In', path: '/login' },
    ];
    
    for (const link of links) {
      await page.goto(BASE);
      const el = page.locator(`nav a:has-text("${link.text}")`).first();
      await expect(el).toBeVisible({ timeout: 10000 });
      await el.click();
      await page.waitForURL(`**${link.path}`, { timeout: 10000 });
      expect(page.url()).toContain(link.path);
      console.log(`NAV "${link.text}" → ${link.path} PASSED`);
    }
  });
});

test.describe('Dashboard access', () => {
  test('dashboard redirects without token', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    // Should either redirect to login or show login prompt
    await page.waitForTimeout(3000);
    const url = page.url();
    const hasLogin = url.includes('login') || await page.locator('text=Log In').isVisible().catch(() => false);
    expect(hasLogin).toBeTruthy();
    console.log('DASHBOARD GUARD PASSED: Redirects to login');
  });
});

test.describe('Login page', () => {
  test('login form exists', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    console.log('LOGIN FORM PASSED');
  });
});

test.describe('Register page', () => {
  test('register form exists', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    console.log('REGISTER FORM PASSED');
  });
});

test.describe('All pages load without 500 errors', () => {
  const allPages = [
    '/', '/about', '/features', '/how-it-works', '/art-hub', '/blog',
    '/verify', '/login', '/register', '/gate', '/claim',
    '/what-is-cvber', '/best-art-protection-tool', '/cvber-vs-glaze',
    '/cvber-vs-nightshade', '/is-cvber-legit', '/how-to-protect-your-art',
    '/c2pa-certificate', '/dmca-takedown', '/ai-art-theft',
    '/blog/how-to-protect-art-from-ai', '/blog/c2pa-explained',
    '/blog/glaze-vs-nightshade', '/blog/dmca-guide-for-artists',
    '/blog/can-ai-steal-your-art', '/blog/best-free-art-protection-tools',
    '/blog/ai-training-opt-out', '/blog/nft-art-protection',
    '/blog/is-my-art-being-used-to-train-ai',
    '/blog/copyright-protection-for-photographers',
  ];

  for (const path of allPages) {
    test(`${path} loads`, async ({ page }) => {
      const response = await page.goto(`${BASE}${path}`);
      expect(response?.status()).toBeLessThan(500);
    });
  }
});
