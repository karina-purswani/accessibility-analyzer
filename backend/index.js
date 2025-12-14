import express from "express";
import cors from "cors";
import { runAxeScan } from "./runAxe.js";

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

  // 1️⃣ Missing URL
  if (!url) {
    return res.status(400).json({
      success: false,
      error: "URL is required"
    });
  }

  // 2️⃣ Invalid URL
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
    return res.status(500).json({
      success: false,
      error: err.message || "Accessibility scan failed"
    });
  }
});

// ---------- SERVER ----------
app.listen(5000, () => {
  console.log("Server started on http://localhost:5000");
});
