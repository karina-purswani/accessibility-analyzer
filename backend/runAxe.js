import puppeteer from "puppeteer";
import axeCore from "axe-core";

export async function runAxeScan(url) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new", // Updated for modern Puppeteer
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 30000
    });

    const page = await browser.newPage();
    
    // Set a consistent viewport size so coordinates match the screenshot
    await page.setViewport({ width: 1280, height: 800 });

    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    await page.goto(url, { waitUntil: "networkidle2" });

    // 1. Capture Screenshot as Base64 (to avoid saving files for now)
    const screenshot = await page.screenshot({ encoding: "base64", fullPage: false });

    // 2. Inject axe-core
    await page.evaluate(axeCore.source);

    // 3. Run axe and extract coordinates
    const results = await page.evaluate(async () => {
      const axeResults = await window.axe.run();
      
      // Attach bounding box data to each node
      for (const violation of axeResults.violations) {
        for (const node of violation.nodes) {
          const element = document.querySelector(node.target[0]);
          if (element) {
            const rect = element.getBoundingClientRect();
            node.rect = {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              windowWidth: window.innerWidth // Helps frontend handle scaling
            };
          }
        }
      }
      return axeResults;
    });

    // Return both the axe results and the visual context
    return {
      ...results,
      screenshot: `data:image/png;base64,${screenshot}`,
    };

  } catch (error) {
    if (error.message.includes("Navigation timeout")) {
      throw new Error("Page took too long to load");
    }
    if (error.message.includes("net::")) {
      throw new Error("Failed to load the website (check the URL)");
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}