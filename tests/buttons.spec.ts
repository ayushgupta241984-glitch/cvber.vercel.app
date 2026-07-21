import { test, expect } from '@playwright/test';

const BASE = 'https://cvber.vercel.app';

test.describe('Homepage buttons', () => {
  test('hero CTA goes to /gate', async ({ page }) => {
    await page.goto(BASE);
    const btn = page.locator('a[href="/gate"]').first();
    await expect(btn).toBeVisible();
    await btn.click();
    await page.waitForURL('**/gate', { timeout: 10000 });
    expect(page.url()).toContain('/gate');
  });

  test('nav Log In goes to /login', async ({ page }) => {
    await page.goto(BASE);
    const link = page.locator('a[href="/login"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('nav Apply for Access goes to /gate', async ({ page }) => {
    await page.goto(BASE);
    const link = page.locator('a[href="/gate"]').first();
    await expect(link).toBeVisible();
  });

  test('nav Features goes to /features', async ({ page }) => {
    await page.goto(BASE);
    const link = page.locator('a[href="/features"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL('**/features', { timeout: 10000 });
    expect(page.url()).toContain('/features');
  });

  test('nav How It Works goes to /how-it-works', async ({ page }) => {
    await page.goto(BASE);
    const link = page.locator('a[href="/how-it-works"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL('**/how-it-works', { timeout: 10000 });
    expect(page.url()).toContain('/how-it-works');
  });

  test('nav Art Hub goes to /art-hub', async ({ page }) => {
    await page.goto(BASE);
    const link = page.locator('a[href="/art-hub"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL('**/art-hub', { timeout: 10000 });
    expect(page.url()).toContain('/art-hub');
  });

  test('nav Blog goes to /blog', async ({ page }) => {
    await page.goto(BASE);
    const link = page.locator('a[href="/blog"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL('**/blog', { timeout: 10000 });
    expect(page.url()).toContain('/blog');
  });

  test('nav Verify goes to /verify', async ({ page }) => {
    await page.goto(BASE);
    const link = page.locator('a[href="/verify"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL('**/verify', { timeout: 10000 });
    expect(page.url()).toContain('/verify');
  });

  test('footer links work', async ({ page }) => {
    await page.goto(BASE);
    const footerLinks = page.locator('footer a[href]');
    const count = await footerLinks.count();
    console.log(`Found ${count} footer links`);
    expect(count).toBeGreaterThan(5);
  });
});

test.describe('Gate page', () => {
  test('gate page loads', async ({ page }) => {
    await page.goto(`${BASE}/gate`);
    await expect(page.locator('text=Who are you')).toBeVisible({ timeout: 10000 });
  });

  test('gate form first question visible', async ({ page }) => {
    await page.goto(`${BASE}/gate`);
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Inner pages', () => {
  const pages = [
    { path: '/about', text: 'About' },
    { path: '/features', text: 'Features' },
    { path: '/how-it-works', text: 'How It Works' },
    { path: '/art-hub', text: 'Art Hub' },
    { path: '/verify', text: 'Verify' },
    { path: '/login', text: 'Log In' },
    { path: '/register', text: 'Register' },
    { path: '/blog', text: 'Blog' },
  ];

  for (const p of pages) {
    test(`${p.path} loads without errors`, async ({ page }) => {
      const response = await page.goto(`${BASE}${p.path}`);
      expect(response?.status()).toBe(200);
    });
  }
});

test.describe('Blog pages', () => {
  const blogs = [
    '/blog/how-to-protect-art-from-ai',
    '/blog/is-my-art-being-used-to-train-ai',
    '/blog/c2pa-explained',
    '/blog/nft-art-protection',
    '/blog/glaze-vs-nightshade',
    '/blog/dmca-guide-for-artists',
    '/blog/copyright-protection-for-photographers',
    '/blog/can-ai-steal-your-art',
    '/blog/best-free-art-protection-tools',
    '/blog/ai-training-opt-out',
  ];

  for (const path of blogs) {
    test(`${path} loads`, async ({ page }) => {
      const response = await page.goto(`${BASE}${path}`);
      expect(response?.status()).toBe(200);
    });
  }
});

test.describe('SEO pages', () => {
  const seoPages = [
    '/what-is-cvber',
    '/best-art-protection-tool',
    '/cvber-vs-glaze',
    '/cvber-vs-nightshade',
    '/is-cvber-legit',
    '/how-to-protect-your-art',
    '/c2pa-certificate',
    '/dmca-takedown',
    '/ai-art-theft',
  ];

  for (const path of seoPages) {
    test(`${path} loads`, async ({ page }) => {
      const response = await page.goto(`${BASE}${path}`);
      expect(response?.status()).toBe(200);
    });
  }
});

test.describe('No console errors on homepage', () => {
  test('no errors', async ({ page }) => {
    const errors: string[] = [];
    const failed404s: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('response', response => {
      if (response.status() >= 400) failed404s.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(BASE);
    await page.waitForTimeout(3000);
    console.log(`Console errors: ${errors.length}`);
    errors.forEach(e => console.log(`  ERROR: ${e}`));
    console.log(`Failed responses: ${failed404s.length}`);
    failed404s.forEach(e => console.log(`  FAILED: ${e}`));
    expect(errors.length).toBe(0);
  });
});

test.describe('All images load', () => {
  test('homepage images load', async ({ page }) => {
    const failedImages: string[] = [];
    page.on('response', response => {
      if (response.url().includes('googleusercontent.com') && response.status() >= 400) {
        failedImages.push(response.url());
      }
    });
    await page.goto(BASE);
    await page.waitForTimeout(5000);
    console.log(`Failed images: ${failedImages.length}`);
    failedImages.forEach(url => console.log(`  FAILED: ${url}`));
    expect(failedImages.length).toBe(0);
  });
});
