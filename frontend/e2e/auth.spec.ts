import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should redirect to login page when accessing root", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/auth\?tab=login/);
    await expect(page.getByRole("heading", { name: /subminder/i })).toBeVisible(
      { timeout: 10000 },
    );
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("should allow user to switch to signup", async ({ page }) => {
    await page.goto("/auth?tab=login");
    await page.getByRole("tab", { name: /sign up/i }).click();

    await expect(page).toHaveURL(/\/auth\?tab=signup/);

    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test("should show error on invalid login", async ({ page }) => {
    await page.goto("/auth?tab=login");

    await page.locator('input[name="email"]').fill("fake@test.com");
    await page.locator('input[name="password"]').fill("WrongPassword123!");

    await page.locator('button[type="submit"]').click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible({
      timeout: 10000,
    });
  });
});
