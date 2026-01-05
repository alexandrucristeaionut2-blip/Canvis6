import type { Page } from "@playwright/test";

export function failOnConsoleErrors(page: Page) {
  page.on("pageerror", (err) => {
    throw err;
  });

  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error") throw new Error(`Console error: ${msg.text()}`);
    if (type === "warning") throw new Error(`Console warning: ${msg.text()}`);
  });
}
