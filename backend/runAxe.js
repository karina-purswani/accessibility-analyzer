import puppeteer from "puppeteer";
import axeCore from "axe-core";

export async function runAxeScan(url) {
  let browser;

  try {
    // 🚀 OPTIMIZATION 1: Lightweight Browser Launch
    // We disable GPU and Sandbox to make it run fast on Render's Free Tier
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Critical for Docker/Render memory limits
        "--disable-accelerated-2d-canvas",
        "--disable-gpu", 
        "--single-process", 
      ],
      // Handle Render's specific chrome path if needed
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      timeout: 60000 // Allow 60s for browser launch
    });

    const page = await browser.newPage();
    
    // Set a consistent viewport size so coordinates match the screenshot
    await page.setViewport({ width: 1280, height: 800 });

    // 🚀 OPTIMIZATION 2: Block Heavy Assets (The "Diet" Plan)
    // This prevents the browser from downloading images, videos, and fonts.
    // Huge speed increase for sites like YouTube/Twitter.
    await page.setRequestInterception(true);
    
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      const blockList = ["image", "media", "font", "texttrack", "object", "beacon", "csp_report", "imageset"];
      
      if (blockList.includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 🚀 OPTIMIZATION 3: Navigation Strategy
    // 'domcontentloaded' is much faster than 'networkidle2'. 
    // It fires as soon as HTML/CSS is parsed, without waiting for every tracking script.
    await page.goto(url, { 
      waitUntil: "domcontentloaded", 
      timeout: 60000 // 60s total timeout
    });

    // 1. Capture Screenshot 
    // Optimization: Use JPEG at 50% quality instead of PNG. Much smaller and faster.
    const screenshot = await page.screenshot({ 
      encoding: "base64", 
      type: "jpeg",
      quality: 50,
      fullPage: false 
    });

    // 2. Inject axe-core
    await page.evaluate(axeCore.source);

    // 3. Run axe and extract coordinates (Your existing custom logic)
    const results = await page.evaluate(async () => {
      // Run axe with specific tags
      const axeResults = await window.axe.run({
        runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      });
      
      // Attach bounding box data to each node (Crucial for Visual Inspector)
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
              windowWidth: window.innerWidth 
            };
          }
        }
      }
      return axeResults;
    });

    // Return results + visual context
    // Note: Changed prefix to image/jpeg matching the screenshot type above
    return {
      ...results,
      screenshot: `data:image/jpeg;base64,${screenshot}`,
    };

  } catch (error) {
    console.error("❌ Axe Scan Error:", error.message);

    if (error.message.includes("timeout") || error.message.includes("Navigation")) {
      throw new Error("Page took too long to load (Timeout). Try a lighter page.");
    }
    if (error.message.includes("net::")) {
      throw new Error("Failed to load the website. Please check the URL.");
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}