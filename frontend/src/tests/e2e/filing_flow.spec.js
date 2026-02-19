import { test, expect } from '@playwright/test';

test.describe('Filing Ritual E2E Audit', () => {
    test.beforeEach(async ({ page }) => {
        // Mocking API responses for faster/deterministic E2E
        await page.route('**/api/v1/legal-ai/analyze', async route => {
            await route.fulfill({
                status: 200, body: JSON.stringify({
                    procedural_phase: 'Postulatório',
                    ai_summary: 'E2E Simulation Summary',
                    ai_risk_score: 0.2
                })
            });
        });

        await page.goto('http://localhost:5173');
    });

    test('should complete the full filing journey', async ({ page }) => {
        // 1. Open Strategic Hub
        await page.click('text=Ver Análise IA');
        await expect(page.locator('text=Hub Estratégico')).toBeVisible();

        // 2. Transition to Filing Hub
        await page.click('text=Iniciar Protocolo MNI 2.0');
        await expect(page.locator('text=Protocolo Eletrônico')).toBeVisible();

        // 3. Edit and Launch
        await page.fill('textarea', 'Conteúdo da petição gerado pelo E2E Audit.');
        await page.click('text=Lançar Protocolo');

        // 4. Verify Success Protocol
        await expect(page.locator('text=Protocolo Realizado')).toBeVisible({ timeout: 10000 });
        const protocol = await page.textContent('.protocol-number');
        expect(protocol).toMatch(/\d{4}\.\d{3}\.\d{4}/);
    });

    test('should handle tribunal offline fallback', async ({ page }) => {
        // Mock a 503 error from the submission API
        await page.route('**/api/v1/legal-ai/sign-and-submit', async route => {
            await route.fulfill({ status: 503, body: JSON.stringify({ detail: 'Tribunal Offline' }) });
        });

        await page.click('text=Ver Análise IA');
        await page.click('text=Iniciar Protocolo MNI 2.0');
        await page.click('text=Lançar Protocolo');

        // Verify fallback UI
        await expect(page.locator('text=Reagendar Protocolo')).toBeVisible();
    });
});
