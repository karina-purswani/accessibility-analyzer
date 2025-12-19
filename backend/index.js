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

// 1️⃣ FIREBASE ADMIN SETUP
import admin from "firebase-admin";
import { createRequire } from "module"; 

// Create 'require' to load the JSON file
const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json"); 

// 🕵️‍♂️ SPY LOGS: Confirm the key is loaded correctly
console.log("-----------------------------------------");
console.log("🔑 LOADED KEY FOR PROJECT:", serviceAccount.project_id);
console.log("📧 SERVICE EMAIL:", serviceAccount.client_email);
console.log("-----------------------------------------");

// Initialize Firebase (Only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// 🚨 CRITICAL FIX: Connect to your specific named database
// Since you created "accessibility-db" in the Google Cloud Console:
db.settings({ databaseId: "accessibility-db" }); 

const app = express();
app.use(cors());
app.use(express.json());

// ---------- URL VALIDATION HELPER ----------
function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:");
  } catch (err) {
    return false;
  }
}

function buildSummary(axeResults) {
  const summary = {
    totalViolations: 0,
    byImpact: { critical: 0, serious: 0, moderate: 0, minor: 0 }
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
  // Accept userId and userEmail along with url
  const { url, userId, userEmail } = req.body;

  if (!url) return res.status(400).json({ success: false, error: "URL is required" });
  if (!isValidUrl(url)) return res.status(400).json({ success: false, error: "Invalid URL format" });

  console.log(`🔍 Scanning URL: ${url}`);

  try {
    const results = await runAxeScan(url);
    const summary = buildSummary(results);

    // 2️⃣ SAVE TO FIRESTORE (Backend Logic)
    if (userId) {
      console.log(`📝 Saving scan for user: ${userEmail}`);
      
      try {
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        // A. Update User Document
        await db.collection("users").doc(userId).set({
          email: userEmail,
          lastScanAt: timestamp
        }, { merge: true });

        // B. Add New Scan Document
        const scanRef = await db.collection("users").doc(userId).collection("scans").add({
          url: url,
          summary: {
            ...summary,
            passes: results.passes ? results.passes.length : 0,
            incomplete: results.incomplete ? results.incomplete.length : 0
          },
          createdAt: timestamp
        });

        console.log(`✅ Scan saved to Firestore! ID: ${scanRef.id}`);
      } catch (dbErr) {
        console.error("❌ Database Save Failed:", dbErr.message);
      }
    } else {
      console.log("⚠️ No User ID provided. Skipping DB save.");
    }

    // Return results to frontend regardless of DB save status
    return res.json({
      success: true,
      summary,
      data: results
    });

  } catch (err) {
    console.error("❌ Scan Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Accessibility scan failed"
    });
  }
});

// ---------- AI FIX ROUTE ----------
app.use("/api/ai-fix", aiFixRoutes);

// ---------- SERVER ----------
app.listen(5000, () => {
  console.log("🚀 Server started on http://localhost:5000");
});
