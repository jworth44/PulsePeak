import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const projectRoot = process.cwd();
const screenshotPath = path.join(projectRoot, "artifacts", "dashboard-proof.png");

fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true
});

const page = await browser.newPage();
const apiProof = [];
const consoleMessages = [];
const pageErrors = [];

page.on("console", (message) => {
  consoleMessages.push(`${message.type()}: ${message.text()}`);
});

page.on("pageerror", (error) => {
  pageErrors.push(error.message);
});

page.on("response", async (response) => {
  const url = response.url();
  if (!url.includes("/api/")) {
    return;
  }

  if (!["/api/auth/register", "/api/dashboard", "/api/meals", "/api/workouts/preset", "/api/workout-library", "/api/weekly-plan"].some((fragment) => url.includes(fragment))) {
    return;
  }

  let body = "";
  try {
    body = await response.text();
  } catch {
    body = "";
  }

  apiProof.push({
    url,
    status: response.status(),
    body
  });
});

const uniqueEmail = `ui_user_${Date.now()}@pulsepeak.local`;

try {
  await page.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const createAccountButton = page.getByRole("button", { name: "Create account" });
  const hasCreateAccount = await createAccountButton.count();
  if (!hasCreateAccount) {
    throw new Error(
      JSON.stringify({
        stage: "auth-controls-missing",
        url: page.url(),
        bodyText: await page.locator("body").innerText(),
        consoleMessages,
        pageErrors
      })
    );
  }

  await createAccountButton.click();
  await page.getByLabel("Name").fill("UI Test User");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password").fill("Passw0rd!");
  await page.getByRole("button", { name: "Create PulsePeak account" }).click();

  await page.waitForURL("http://127.0.0.1:3001/", { timeout: 10000 });
  await page.getByRole("heading", { name: /Train smarter whether you lift in a full gym or from a compact home setup/i }).waitFor();
  const focusCard = page.locator(".focus-card");
  const momentumCard = page.locator(".momentum-card");
  const premiumCard = page.locator(".premium-card").first();
  const initialFocusTitle = await focusCard.locator("h3").innerText();
  const initialFocusText = await focusCard.innerText();
  const initialMomentumText = await momentumCard.innerText();

  await page.getByRole("button", { name: "Home" }).click();
  await page.getByRole("button", { name: "Strength" }).click();
  await page.getByRole("button", { name: "Home" }).click();
  await page.getByRole("heading", { name: "Dumbbell Only Workout" }).waitFor();

  const workoutCard = page.locator(".preset-card").filter({ hasText: "Dumbbell Only Workout" }).first();
  await workoutCard.getByRole("button", { name: "View details" }).click();
  await page.getByRole("dialog").waitFor();
  const modalText = await page.getByRole("dialog").innerText();
  await page.getByRole("button", { name: "Log this workout" }).click();

  await page.locator(".item-title", { hasText: "Dumbbell Only Workout" }).waitFor();

  const mealPanel = page.locator("section.panel").filter({ hasText: "Nutrition tracker" });
  await mealPanel.getByLabel("Meal or snack").fill("UI proof meal");
  await mealPanel.locator('input[name="calories"]').fill("820");
  await mealPanel.locator('input[name="protein"]').fill("90");
  await mealPanel.getByRole("button", { name: "Log meal" }).click();

  await page.getByText("UI proof meal").waitFor();
  await page.waitForTimeout(500);
  const weeklyPlanResponse = await page.evaluate(async () => {
    const token = window.localStorage.getItem("pulsepeak-auth-token");
    const response = await fetch("/api/weekly-plan", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return {
      status: response.status,
      body: await response.json()
    };
  });
  const finalFocusTitle = await focusCard.locator("h3").innerText();
  const finalFocusText = await focusCard.innerText();
  const finalMomentumText = await momentumCard.innerText();
  const weeklyPlanText = await premiumCard.innerText();
  await premiumCard.getByRole("button", { name: "Preview Full Plan" }).click();
  const weeklyPlanModal = page.locator(".weekly-plan-modal");
  await weeklyPlanModal.waitFor();
  const weeklyPlanModalText = await weeklyPlanModal.innerText();
  await weeklyPlanModal.getByRole("button", { name: "Close" }).click();
  await page.waitForTimeout(250);
  const previewClosed = !(await weeklyPlanModal.isVisible().catch(() => false));
  if (!initialFocusTitle.trim() || !finalFocusTitle.trim()) {
    throw new Error("Today's Focus rendered without a title.");
  }
  if (!initialFocusText.includes("WHY THIS MATTERS") || !finalFocusText.includes("WHY THIS MATTERS")) {
    throw new Error("Today's Focus rendered without why-this-matters guidance.");
  }
  if (initialFocusTitle === finalFocusTitle) {
    throw new Error(
      JSON.stringify({
        stage: "today-focus-static",
        initialFocusTitle,
        finalFocusTitle,
        initialFocusText,
        finalFocusText
      })
    );
  }
  if (!initialMomentumText.trim() || !finalMomentumText.trim()) {
    throw new Error("Momentum feedback rendered empty.");
  }
  if (weeklyPlanResponse.status !== 403) {
    throw new Error(`Expected weekly plan route to be locked for free users, got ${weeklyPlanResponse.status}.`);
  }
  if (!weeklyPlanResponse.body?.preview?.teaser) {
    throw new Error("Weekly plan route did not return a personalized preview.");
  }
  const weeklyPlanModalTextLower = weeklyPlanModalText.toLowerCase();
  if (!weeklyPlanModalTextLower.includes("limited preview") || !weeklyPlanModalTextLower.includes("unlock full plan")) {
    throw new Error("Weekly plan modal did not show limited preview framing and upgrade CTA.");
  }
  if (!previewClosed) {
    throw new Error("Weekly plan preview did not close cleanly.");
  }
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const caloriesLogged = await page.locator(".stat-pill").nth(0).innerText();
  const proteinTracked = await page.locator(".stat-pill").nth(1).innerText();
  const workoutStreak = await page.locator(".stat-pill").nth(3).innerText();
  const mealCardText = await page.getByText("UI proof meal").locator("..").innerText();
  const workoutCardText = await page.locator(".list-card").filter({ hasText: "Dumbbell Only Workout" }).first().innerText();
  const trainingMetric = await page.locator(".metric-card").nth(3).innerText();
  const premiumText = await page.locator(".premium-card").first().innerText();

  const proof = {
    email: uniqueEmail,
    caloriesLogged,
    proteinTracked,
    workoutStreak,
    trainingMetric,
    initialFocusTitle,
    finalFocusTitle,
    initialFocusText,
    finalFocusText,
    initialMomentumText,
    finalMomentumText,
    weeklyPlanResponse,
    weeklyPlanText,
    weeklyPlanModalText,
    previewClosed,
    mealCardText,
    workoutCardText,
    modalText,
    premiumText,
    screenshotPath,
    apiProof,
    consoleMessages,
    pageErrors
  };

  console.log(JSON.stringify(proof));
} finally {
  await browser.close();
}
