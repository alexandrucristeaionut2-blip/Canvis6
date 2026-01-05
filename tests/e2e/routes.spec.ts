import { test, expect } from "@playwright/test";
import { failOnConsoleErrors } from "./_console";

const routes: Array<{ path: string; heading: RegExp | string }> = [
  { path: "/", heading: /Fotografiile tale, transformate/i },
  { path: "/themes", heading: "Themes" },
  { path: "/gallery", heading: "Gallery" },
  { path: "/quality", heading: /Quality/i },
  { path: "/shipping", heading: "Shipping" },
  { path: "/faq", heading: "FAQ" },
  { path: "/contact", heading: "Contact" },
  { path: "/create", heading: /Create/i },
  { path: "/cart", heading: "Cart" },
  { path: "/checkout", heading: "Checkout" },
  { path: "/signup", heading: /Create account/i },
  { path: "/signin", heading: /Sign in/i },
  { path: "/forgot-password", heading: /Forgot password/i },
  { path: "/admin/login", heading: /Admin login/i },
];

for (const r of routes) {
  test(`route loads: ${r.path}`, async ({ page }) => {
    failOnConsoleErrors(page);
    await page.goto(r.path);
    const headingLocator =
      typeof r.heading === "string"
        ? page.getByRole("heading", { name: r.heading, exact: true })
        : page.getByRole("heading", { name: r.heading });
    await expect(headingLocator).toBeVisible();
  });
}
