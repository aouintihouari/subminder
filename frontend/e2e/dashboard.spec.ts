import { test, expect } from "@playwright/test";

test.describe("Subscription Flow", () => {
  const MOCK_USER = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "USER",
    isVerified: true,
    preferredCurrency: "USD",
  };

  test.beforeEach(async ({ page }) => {
    // 1. Mock Login Response
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          data: { user: MOCK_USER },
        }),
        headers: { "Set-Cookie": "jwt=mock-token; Path=/; HttpOnly" },
      });
    });

    // 2. Mock /me (Unauthorized initially)
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ status: "fail", message: "Unauthorized" }),
      });
    });

    // 3. Mock Subscriptions (Empty List initially)
    await page.route("**/api/v1/subscriptions", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "success",
            results: 0,
            data: { subscriptions: [] },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // 4. Mock Stats
    await page.route("**/api/v1/subscriptions/stats", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          data: {
            totalMonthly: 0,
            totalYearly: 0,
            activeCount: 0,
            categoryCount: 0,
            mostExpensive: null,
            currency: "USD",
          },
        }),
      });
    });

    // --- Perform Login ---
    await page.goto("/auth?tab=login");
    await page.locator('input[name="email"]').fill("test@example.com");
    await page.locator('input[name="password"]').fill("password123");

    // Mock /me success before clicking submit
    await page.unroute("**/api/v1/auth/me");
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "success", data: { user: MOCK_USER } }),
      });
    });

    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL("/dashboard");

    await page
      .getByRole("link", { name: "Subscriptions", exact: true })
      .click();
    await expect(page).toHaveURL("/subscriptions");
  });

  test("should create, view and delete a subscription", async ({ page }) => {
    const uniqueName = `Netflix ${Date.now()}`;

    // --- Mock Creation (POST) ---
    await page.route("**/api/v1/subscriptions", async (route) => {
      if (route.request().method() === "POST") {
        const postData = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            status: "success",
            data: {
              subscription: {
                id: 999,
                ...postData,
                currency: "USD",
                isActive: true,
                startDate: new Date().toISOString(),
              },
            },
          }),
        });
      } else {
        await route.fallback();
      }
    });

    // --- Mock Deletion (DELETE) ---
    await page.route("**/api/v1/subscriptions/*", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({ status: 204 });
      } else {
        await route.fallback();
      }
    });

    // Interact with UI
    await page
      .getByRole("button", { name: /Add Subscription/i })
      .first()
      .click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    await modal.locator('input[name="name"]').fill(uniqueName);
    await modal.locator('input[name="price"]').fill("15.99");

    // Select Category (Dropdown interaction)
    await modal.getByRole("combobox").nth(2).click();
    await page.getByRole("option", { name: /Entertainment/i }).click();

    // Update Mock for GET to return the new item
    await page.unroute("**/api/v1/subscriptions");
    await page.route("**/api/v1/subscriptions", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "success",
            results: 1,
            data: {
              subscriptions: [
                {
                  id: 999,
                  name: uniqueName,
                  price: 15.99,
                  currency: "USD",
                  category: "ENTERTAINMENT",
                  frequency: "MONTHLY",
                  isActive: true,
                  startDate: new Date().toISOString(),
                },
              ],
            },
          }),
        });
      } else if (route.request().method() === "POST") {
        await route.fulfill({ status: 201 });
      }
    });

    await modal.getByRole("button", { name: /Create Subscription/i }).click();

    await expect(modal).not.toBeVisible();
    await expect(page.getByText(uniqueName).first()).toBeVisible();

    // Delete Flow
    const card = page.locator(".group").filter({ hasText: uniqueName }).first();
    await card.getByRole("button", { name: /open menu/i }).click();
    await page.getByRole("menuitem", { name: /delete/i }).click();

    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();

    // Update Mock for GET to be empty again
    await page.unroute("**/api/v1/subscriptions");
    await page.route("**/api/v1/subscriptions", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            status: "success",
            results: 0,
            data: { subscriptions: [] },
          }),
        });
      }
    });

    await confirmDialog
      .getByRole("button", { name: /Delete Subscription/i })
      .click();

    await expect(page.getByText(uniqueName)).toHaveCount(0);
  });
});
