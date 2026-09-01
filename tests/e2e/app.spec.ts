import { test, expect } from '@playwright/test';

test.describe('TokenLens End-to-End Application Flows', () => {
  test('navigates through pages and checks local processing indicator', async ({ page }) => {
    await page.goto('/');

    // Check title & brand
    await expect(page).toHaveTitle(/TokenLens/);
    await expect(page.getByText('100% Local Sandbox')).toBeVisible();

    // Navigate to Compare page
    await page.click('text=Compare');
    await expect(page.getByText('Token Comparison Engine')).toBeVisible();

    // Navigate to Generator page
    await page.click('text=Generator');
    await expect(page.getByText('Development Vector Generator Sandbox')).toBeVisible();

    // Navigate to Learn page
    await page.click('text=Learn');
    await expect(page.getByText('JOSE & JWT Security Primer')).toBeVisible();

    // Navigate to Privacy page
    await page.click('text=Privacy');
    await expect(page.getByText('Privacy Model & Zero-Trust Threat Analysis')).toBeVisible();
  });

  test('loads example token, inspects payload, verifies signature, and exports report', async ({ page }) => {
    await page.goto('/');

    // Click safe example token button "HS256 (HMAC)"
    await page.click('button:has-text("HS256 (HMAC)")');

    // Verify compact token textarea has content
    const textarea = page.locator('#token-paste-area');
    await expect(textarea).not.toHaveValue('');

    // Check Inspector displays algorithm HS256
    await expect(page.getByRole('button', { name: 'HS256', exact: true })).toBeVisible();

    // Check Standard Claims Table contains sub: usr_dev_12345
    await expect(page.getByRole('cell', { name: 'usr_dev_12345' })).toBeVisible();

    // Switch right panel tab to Verification tab
    await page.click('button:has-text("Verification")');
    await page.click('button:has-text("Verify Cryptographic Signature")');

    // Confirm signature verified status
    await expect(page.getByText('Signature VERIFIED')).toBeVisible();

    // Switch right panel tab to Security Audit
    await page.click('button:has-text("Security Audit")');
    await expect(page.getByText('Security & Compliance Audit')).toBeVisible();

    // Click Markdown export button
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Markdown")'),
    ]);
    expect(download.suggestedFilename()).toBe('tokenlens-security-report.md');
  });

  test('handles malformed token input gracefully without crashing', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('#token-paste-area');
    await textarea.fill('invalid.malformed.jwt.token.string.extra.junk');

    // Should display malformed / invalid badge
    await expect(page.getByText('Malformed / Invalid')).toBeVisible();
    await expect(page.getByText('Malformed token structure')).toBeVisible();
  });
});
