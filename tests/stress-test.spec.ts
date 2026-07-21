import { test, expect } from '@playwright/test';

const BASE = 'https://cvber.vercel.app';
const API = 'https://cvber-free-las-app.onrender.com';

// Run 10 iterations of every test to simulate repeated usage
for (let i = 1; i <= 10; i++) {
  test.describe(`Run ${i}/10 — Gate form`, () => {
    test('full flow: 3 questions → email → submit', async ({ page }) => {
      await page.goto(`${BASE}/gate`);
      await expect(page.locator('h2:has-text("Who are you")')).toBeVisible({ timeout: 15000 });
      await page.locator('textarea').first().fill(`Tester run ${i}`);
      await page.locator('button:has-text("Continue")').click();
      await expect(page.locator('h2:has-text("Why do you want")')).toBeVisible({ timeout: 10000 });
      await page.locator('textarea').first().fill(`Reason ${i}`);
      await page.locator('button:has-text("Continue")').click();
      await expect(page.locator('h2:has-text("Why should we")')).toBeVisible({ timeout: 10000 });
      await page.locator('textarea').first().fill(`Proof ${i}`);
      await page.locator('button:has-text("Continue")').click();
      await expect(page.locator('h2:has-text("email")')).toBeVisible({ timeout: 10000 });
      await page.locator('input[type="email"]').fill(`run${i}@test.com`);
      await page.locator('button:has-text("Apply for Access")').click();
      await expect(page.locator('text=Application submitted')).toBeVisible({ timeout: 15000 });
    });

    test('validation: empty = disabled', async ({ page }) => {
      await page.goto(`${BASE}/gate`);
      await expect(page.locator('h2:has-text("Who are you")')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('button:has-text("Continue")')).toBeDisabled();
      await page.locator('textarea').first().fill('x');
      await expect(page.locator('button:has-text("Continue")')).toBeEnabled();
    });

    test('back button works', async ({ page }) => {
      await page.goto(`${BASE}/gate`);
      await expect(page.locator('h2:has-text("Who are you")')).toBeVisible({ timeout: 15000 });
      await page.locator('textarea').first().fill('x');
      await page.locator('button:has-text("Continue")').click();
      await expect(page.locator('h2:has-text("Why do you want")')).toBeVisible({ timeout: 10000 });
      await page.locator('button:has-text("Back")').click();
      await expect(page.locator('h2:has-text("Who are you")')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe(`Run ${i}/10 — API`, () => {
    test('POST /api/gate', async ({ request }) => {
      const res = await request.post(`${API}/api/gate`, {
        data: { email: `stress${i}-${Date.now()}@test.com`, who_are_you: 'Test', why_want: 'Test', why_give: 'Test' },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('pending');
      expect(body.position).toBeGreaterThan(0);
    });

    test('GET /api/gate/status', async ({ request }) => {
      const email = `stress-status${i}-${Date.now()}@test.com`;
      await request.post(`${API}/api/gate`, { data: { email, who_are_you: 'T', why_want: 'T', why_give: 'T' } });
      const res = await request.get(`${API}/api/gate/status?email=${email}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('pending');
    });

    test('GET /api/gate/remaining', async ({ request }) => {
      const res = await request.get(`${API}/api/gate/remaining`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.remaining).toBeGreaterThan(0);
    });
  });

  test.describe(`Run ${i}/10 — Navigation`, () => {
    test('homepage loads', async ({ page }) => {
      const res = await page.goto(BASE);
      expect(res?.status()).toBe(200);
      await expect(page.locator('text=Protect it then own it')).toBeVisible({ timeout: 15000 });
    });

    test('gate page loads', async ({ page }) => {
      const res = await page.goto(`${BASE}/gate`);
      expect(res?.status()).toBe(200);
    });

    test('claim page loads', async ({ page }) => {
      const res = await page.goto(`${BASE}/claim`);
      expect(res?.status()).toBe(200);
    });

    test('login page loads', async ({ page }) => {
      const res = await page.goto(`${BASE}/login`);
      expect(res?.status()).toBe(200);
    });

    test('register page loads', async ({ page }) => {
      const res = await page.goto(`${BASE}/register`);
      expect(res?.status()).toBe(200);
    });

    test('dashboard guards without token', async ({ page }) => {
      await page.goto(`${BASE}/dashboard`);
      await page.waitForTimeout(3000);
      const url = page.url();
      expect(url.includes('login') || await page.locator('text=Log In').isVisible().catch(() => false)).toBeTruthy();
    });
  });

  test.describe(`Run ${i}/10 — SEO pages`, () => {
    const seoPages = [
      '/what-is-cvber', '/best-art-protection-tool', '/cvber-vs-glaze',
      '/cvber-vs-nightshade', '/is-cvber-legit', '/how-to-protect-your-art',
      '/c2pa-certificate', '/dmca-takedown', '/ai-art-theft',
    ];
    for (const path of seoPages) {
      test(`${path}`, async ({ page }) => {
        const res = await page.goto(`${BASE}${path}`);
        expect(res?.status()).toBe(200);
      });
    }
  });

  test.describe(`Run ${i}/10 — Blog pages`, () => {
    const blogs = [
      '/blog/how-to-protect-art-from-ai', '/blog/is-my-art-being-used-to-train-ai',
      '/blog/c2pa-explained', '/blog/nft-art-protection', '/blog/glaze-vs-nightshade',
      '/blog/dmca-guide-for-artists', '/blog/copyright-protection-for-photographers',
      '/blog/can-ai-steal-your-art', '/blog/best-free-art-protection-tools',
      '/blog/ai-training-opt-out',
    ];
    for (const path of blogs) {
      test(`${path}`, async ({ page }) => {
        const res = await page.goto(`${BASE}${path}`);
        expect(res?.status()).toBe(200);
      });
    }
  });

  test.describe(`Run ${i}/10 — Images`, () => {
    test('no broken images on homepage', async ({ page }) => {
      const failed: string[] = [];
      page.on('response', r => {
        if (r.url().includes('googleusercontent.com') && r.status() >= 400) failed.push(r.url());
      });
      await page.goto(BASE);
      await page.waitForTimeout(5000);
      expect(failed).toEqual([]);
    });
  });

  test.describe(`Run ${i}/10 — Console`, () => {
    test('no console errors on homepage', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      await page.goto(BASE);
      await page.waitForTimeout(3000);
      expect(errors).toEqual([]);
    });
  });
}
