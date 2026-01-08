import { test, expect } from "@playwright/test";

const TEST_USER = {
  email: "test@example.com",
  password: "password123",
};

test.describe("Dashboard Flow", () => {
  // On laisse du temps à Webkit
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // 1. Login
    await page.goto("/auth?tab=login");

    const emailInput = page.locator('input[name="email"]');
    await emailInput.waitFor({ state: "visible" });
    await emailInput.fill(TEST_USER.email);
    await page.locator('input[name="password"]').fill(TEST_USER.password);

    const loginResponse = page.waitForResponse(
      (r) => r.url().includes("/auth/login") && r.status() === 200,
    );
    await page.locator('button[type="submit"]').click();
    await loginResponse;

    // 2. Attente de la redirection initiale
    await expect(page).toHaveURL("/", { timeout: 15000 });

    // 🚨 LE CRASH TEST WEBKIT 🚨
    // On recharge la page.
    // - Si le cookie est mal configuré (Secure sur HTTP), il sera perdu ici et on sera redirigé vers /auth.
    // - Si le cookie est bon, on restera sur / et la session sera "ancrée" solidement.
    await page.reload();

    // On vérifie qu'on est TOUJOURS sur le dashboard après le reload
    await expect(page).toHaveURL("/", { timeout: 15000 });

    // 3. STABILISATION
    // On attend la fin des chargements
    await expect(page.locator(".animate-pulse")).toHaveCount(0, {
      timeout: 15000,
    });
    await expect(page.locator(".animate-spin")).toHaveCount(0, {
      timeout: 15000,
    });
  });

  test("should create, view and delete a subscription", async ({ page }) => {
    const uniqueName = `Netflix ${Date.now()}`;

    // --- 1. CRÉATION ---
    const addBtn = page.getByRole("button", { name: /^Add Subscription$/i });
    await addBtn.waitFor({ state: "visible" });

    // Utilisation de dispatchEvent pour contourner les instabilités de clic Webkit
    await addBtn.dispatchEvent("click");

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Remplissage
    await modal.locator('input[name="name"]').fill(uniqueName);
    await modal.locator('input[name="price"]').fill("15.99");

    // Catégorie (Clavier)
    await modal.getByRole("combobox").first().click();
    await page.keyboard.type("Entertainment");
    await page.keyboard.press("Enter");

    // Soumission
    const createResponse = page.waitForResponse(
      (r) => r.url().includes("/subscriptions") && r.status() === 201,
    );
    await modal.getByRole("button", { name: /(create|add)/i }).click();
    await createResponse;

    // --- 2. VÉRIFICATION ---
    await expect(modal).not.toBeVisible();
    await expect(page.getByText(uniqueName).first()).toBeVisible();

    // --- 3. SUPPRESSION ---
    const card = page
      .locator(".group, tr")
      .filter({ hasText: uniqueName })
      .first();
    await card.getByRole("button", { name: /open menu/i }).click();

    const deleteBtn = page.getByRole("menuitem", { name: /delete/i });
    await deleteBtn.waitFor({ state: "visible" });
    await deleteBtn.dispatchEvent("click");

    // Confirmation
    const confirmBtn = page.getByRole("button", {
      name: /delete subscription/i,
    });
    await confirmBtn.waitFor({ state: "visible" });
    await confirmBtn.click();

    // --- 4. FIN ---
    await expect(page.getByText(uniqueName)).toHaveCount(0, { timeout: 10000 });
  });
});
