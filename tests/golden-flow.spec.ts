import { test, expect } from "@playwright/test";

test("golden demo flow — login → verify → mock gate → drives", async ({ page }) => {
  // Act 0 — sign in as the demo student
  await page.goto("/login");
  await page.getByRole("button", { name: /Rahul Jadhav/ }).click();
  await expect(page.getByRole("heading", { name: /Skill ledger/i })).toBeVisible();

  // Act 1 — evidence-over-claims: flip Python via labeled fixtures replay
  await page.goto("/student/verify");
  await page.getByRole("button", { name: /Verify Python/i }).click();
  await expect(page.getByText("Python is now Verified")).toBeVisible({ timeout: 15_000 });

  // Act 2 — mock drive live SQL gate confirms the gap (and the knowledge)
  await page.goto("/student/mock-drive");
  await expect(page.getByText("Live gate · SQL")).toBeVisible();
  await page.getByRole("radio", { name: /GROUP BY dept_id HAVING/i }).first().check();
  await expect(page.getByText("LIVE GATE: PASS")).toBeVisible();

  // Act 3 — eligibility is explainable; student is eligible by rule v3
  await page.goto("/student/drives");
  await expect(page.getByText("Eligible · rule v3")).toBeVisible();
});
