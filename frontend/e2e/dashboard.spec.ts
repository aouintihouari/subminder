import { test, expect } from "@playwright/test";

test.describe("Dashboard Flow", () => {
  const MOCK_USER = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "USER",
    isVerified: true,
    preferredCurrency: "USD",
  };

  test.beforeEach(async ({ page }) => {
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

    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ status: "fail", message: "Unauthorized" }),
      });
    });

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

    // 4. Mocker les stats
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

    await page.goto("/auth?tab=login");

    await page.locator('input[name="email"]').fill("test@example.com");
    await page.locator('input[name="password"]').fill("password123");

    await page.unroute("**/api/v1/auth/me"); // On retire le mock 401
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "success", data: { user: MOCK_USER } }),
      });
    });

    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText("Dashboard")).toBeVisible();
  });

  test("should create, view and delete a subscription", async ({ page }) => {
    const uniqueName = `Netflix ${Date.now()}`;

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

    // --- Mock Suppression (DELETE) ---
    await page.route("**/api/v1/subscriptions/*", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({ status: 204 });
      } else {
        await route.fallback();
      }
    });

    await page
      .getByRole("button", { name: /Add Subscription/i })
      .first()
      .click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    await modal.locator('input[name="name"]').fill(uniqueName);
    await modal.locator('input[name="price"]').fill("15.99");

    await modal.getByRole("combobox").nth(2).click();
    await page.getByRole("option", { name: /Entertainment/i }).click();

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

    const card = page.locator(".group").filter({ hasText: uniqueName }).first();
    await card.getByRole("button", { name: /open menu/i }).click();
    await page.getByRole("menuitem", { name: /delete/i }).click();

    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();

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
