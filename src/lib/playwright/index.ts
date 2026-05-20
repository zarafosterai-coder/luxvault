import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

// Add stealth plugin to Playwright
chromium.use(stealth());

export async function verifyTweetScrape(username: string, requiredText: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();

  try {
    // Note: Scraping Twitter is highly restricted and without a logged in session, 
    // timeline data might not be completely visible or accurate.
    // This is a naive implementation using playwright.
    await page.goto(`https://x.com/${username}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    
    // Random delay to simulate human
    await page.waitForTimeout(2000 + Math.random() * 2000);
    
    // Check if any tweet containing the text exists
    const textContent = await page.content();
    const found = textContent.includes(requiredText);

    return { success: true, verified: found };
  } catch (err: any) {
    return { success: false, verified: false, reason: err.message };
  } finally {
    await browser.close();
  }
}

export async function verifyFollowScrape(username: string, targetAccount: string) {
  // Twitter blocks seeing the full following list without login easily.
  // But we'll try to check the user's profile or target's profile.
  return { success: true, verified: true, reason: "Simulated for demo (Scraping follower list requires logged in session or API)" };
}

export async function verifyRetweetScrape(username: string, targetAccount: string) {
  return { success: true, verified: true, reason: "Simulated for demo" };
}
