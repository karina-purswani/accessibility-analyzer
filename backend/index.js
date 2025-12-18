import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { runAxeScan } from "./runAxe.js";
import aiFixRoutes from "./routes/aiFix.js";

/**
 * 🔑 Load environment variables
 * Explicit path ensures backend/.env is used
 */
dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());
app.use(express.json());

// ---------- URL VALIDATION HELPER ----------
function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:"
    );
  } catch (err) {
    return false;
  }
}

// ---------- SUMMARY BUILDER ----------
function buildSummary(axeResults) {
  const summary = {
    totalViolations: 0,
    byImpact: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    }
  };

  if (!axeResults || !axeResults.violations) {
    return summary;
  }

  summary.totalViolations = axeResults.violations.length;

  axeResults.violations.forEach((violation) => {
    const impact = violation.impact;
    if (impact && summary.byImpact[impact] !== undefined) {
      summary.byImpact[impact]++;
    }
  });

  return summary;
}

// ---------- BASIC TEST ROUTE ----------
app.get("/", (req, res) => {
  res.send("Backend server is running");
});

// ---------- SCAN ROUTE ----------
app.post("/scan", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "URL is required"
    });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({
      success: false,
      error: "Invalid URL format. Please include http:// or https://"
    });
  }

  console.log("Scanning URL:", url);

  try {
    const results = await runAxeScan(url);
    const summary = buildSummary(results);

    return res.json({
      success: true,
      summary,
      data: results
    });
  } catch (err) {
    console.error("Scan error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Accessibility scan failed"
    });
  }
});

// ---------- AI FIX ROUTE ----------
app.use("/api/ai-fix", aiFixRoutes);

// ---------- SERVER ----------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
