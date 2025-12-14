import puppeteer from "puppeteer";
import axeCore from "axe-core";

export async function runAxeScan(url) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 30000
    });

    const page = await browser.newPage();

    // ⏱ Global timeouts (VERY IMPORTANT)
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    await page.goto(url, {
      waitUntil: "networkidle2"
    });

    // Inject axe-core
    await page.evaluate(axeCore.source);

    // Run axe
    const results = await page.evaluate(async () => {
      return await axe.run();
    });

    return results;

  } catch (error) {
    // Normalize common Puppeteer errors
    if (error.message.includes("Navigation timeout")) {
      throw new Error("Page took too long to load");
    }

    if (error.message.includes("net::")) {
      throw new Error("Failed to load the website");
    }

    throw error;

  } finally {
    // 🧹 Always clean up browser
    if (browser) {
      await browser.close();
    }
  }
}
