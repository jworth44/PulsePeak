import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const projectRoot = process.cwd();
const artifactsDir = path.join(projectRoot, "artifacts");
const screenshotPath = path.join(artifactsDir, "stabilization-proof.png");
const proofPath = path.join(artifactsDir, "stabilization-proof.json");

fs.mkdirSync(artifactsDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true
});

const page = await browser.newPage();
const apiProof = [];
const consoleMessages = [];
const pageErrors = [];
const uniqueEmail = `ui_user_${Date.now()}@pulsepeak.local`;

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

  if (
    ![
      "/api/auth/register",
      "/api/auth/session",
      "/api/profile",
      "/api/dashboard",
      "/api/workout-library",
      "/api/workouts/saved"
    ].some((fragment) => url.includes(fragment))
  ) {
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

try {
  await page.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByLabel("Name").fill("UI Test User");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password").fill("Passw0rd!");
  await page.getByRole("button", { name: "Create PulsePeak account" }).click();

  await page.getByRole("heading", { name: /set up pulsepeak once/i }).waitFor({ timeout: 15000 });

  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /Training \+ Recovery/i }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "General Fitness" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Basic" }).click();
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByLabel("Birthdate").fill("1992-06-15");
  await page.getByLabel(/Height/).fill("70");
  await page.getByLabel(/Current weight/).fill("185");
  await page.getByLabel(/Target weight/).fill("180");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /Start my tailored dashboard/i }).click();

  await page.getByText(/today's training direction/i).waitFor({ timeout: 15000 });

  await page.goto("http://127.0.0.1:3001/workouts", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /choose your setup, pick your focus/i }).waitFor();

  await page.getByLabel("Where are you training?").selectOption("home");
  await page.getByRole("button", { name: "Dumbbells" }).click();
  await page.getByRole("button", { name: /^Upper Body/i }).first().click();

  await page.getByText("Your session is ready").waitFor({ timeout: 15000 });
  const loadedWorkoutCard = page.locator(".loaded-workout-exercises-card");
  const loadedWorkoutText = await loadedWorkoutCard.innerText();
  if (!loadedWorkoutText.toLowerCase().includes("sets")) {
    throw new Error("Loaded workout list did not render training prescription details.");
  }

  const saveButton = page.getByRole("button", { name: /Save workout|Saved workout/i }).first();
  await saveButton.click();
  await page.getByText(/Workout saved|Workout removed from saved workouts/i).waitFor({ timeout: 10000 });

  await page.getByRole("button", { name: "Start workout" }).first().click();
  await page.getByRole("dialog").waitFor({ timeout: 10000 });
  await page.getByText(/Current exercise/i).waitFor();
  await page.getByRole("button", { name: /Close workout session/i }).click();

  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("heading", { name: /keep the app simple, set your guidance level/i }).waitFor({ timeout: 10000 });
  await page.getByRole("main").getByRole("button", { name: "Account" }).click();
  await page.getByText(/Manage your profile, billing, and access in one place/i).waitFor();

  await page.screenshot({ path: screenshotPath, fullPage: true });

  const proof = {
    email: uniqueEmail,
    currentUrl: page.url(),
    loadedWorkoutText,
    settingsVisible: await page.getByText(/Manage your profile, billing, and access in one place/i).isVisible(),
    screenshotPath,
    apiProof,
    consoleMessages,
    pageErrors
  };

  fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
  console.log(JSON.stringify(proof));
} finally {
  await browser.close();
}
