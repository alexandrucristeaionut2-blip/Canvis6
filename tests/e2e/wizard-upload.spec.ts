import { test, expect } from "@playwright/test";
import path from "node:path";
import { failOnConsoleErrors } from "./_console";

test("wizard can upload photos", async ({ page }) => {
  failOnConsoleErrors(page);
  await page.goto("/create");

  await page.getByRole("button", { name: /1930s Noir/i }).click();
  await page.getByRole("button", { name: /^Next$/ }).click();

  await expect(page.getByText("Upload photos")).toBeVisible();

  const file1 = path.join(process.cwd(), "public", "examples", "good-photo-1.png");
  const file2 = path.join(process.cwd(), "public", "examples", "good-photo-2.png");

  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: "Add photos" }).click(),
  ]);

  const uploadResponsePromise = page.waitForResponse(
    (resp) => resp.url().includes("/uploads/customer") && resp.request().method() === "POST"
  );

  await chooser.setFiles([file1, file2]);

  const uploadResp = await uploadResponsePromise;
  const status = uploadResp.status();
  const bodyText = await uploadResp.text().catch(() => "");
  test.info().annotations.push({ type: "uploadResponse", description: `status=${status} body=${bodyText}` });
  expect(uploadResp.ok(), `upload failed: status=${status} body=${bodyText}`).toBeTruthy();

  // Toast is via Sonner; role is not guaranteed, so check for the message.
  await expect(page.getByText("Photos uploaded (local)")).toBeVisible({ timeout: 15_000 });

  // The list should render the uploaded items.
  await expect(page.getByText("good-photo-1.png")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("good-photo-2.png")).toBeVisible({ timeout: 15_000 });
});
