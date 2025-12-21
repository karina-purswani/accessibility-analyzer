# ♿ Accessibility Analyzer

> **Make the web inclusive for everyone.**
> A powerful, full-stack tool that scans websites for WCAG 2.1 accessibility violations, generates actionable AI-powered fixes, and provides professional audit reports.

<img src="./Screenshots/dashboard-preview.png" alt="Dashboard Preview" width="100%" />

---

## 🚀 Why Accessibility Analyzer?

Web accessibility isn't just a legal requirement—it's a moral imperative. But finding and fixing issues is hard.
**Accessibility Analyzer** bridges the gap between complex WCAG guidelines and developers by providing:

* **🔍 Instant Audits:** Detect critical, serious, and moderate issues in seconds.
* **📊 Visual Insights:** Understand your site's health with data visualization.
* **🧠 AI-Powered Fixes:** Don't just see the error—learn how to fix it.
* **📄 Professional Reporting:** Generate PDF audits for stakeholders instantly.

---

## ✨ Key Features

### 1. Interactive Analysis Dashboard

Get a bird's-eye view of your website's accessibility health. We calculate a custom **Health Score (0-100)** based on the severity of violations found.

<img src="./Screenshots/analysis-grid.png" alt="Analysis Grid" />

### 2. Detailed Violations , AI Fixes & Visual Inspector Preview

Dive deep into every issue. Our tool pinpoints the exact HTML element causing the problem and suggests code fixes.

<img src="./Screenshots/violations-table-vi-preview.png" alt="Violations and Fixes" />

### 3. Smart Scan History

Never lose track of your progress. Logged-in users can revisit past scans, compare improvements over time, and re-download old reports.

<img src="./Screenshots/scan-history.png" alt="Scan History" />

### 4. Professional Export Suite

Need to show your boss or client? Export a white-labeled, print-ready **PDF Report**, or grab the raw data in **JSON/CSV** formats.

<img src="./Screenshots/pdf-report.png" alt="Export Options" />

### 5. "Try Before You Sign Up" Demo Mode

New users can run a **One-Time Free Scan** without creating an account. We use local storage to provide a seamless trial experience before asking for sign-up.

---
## 🔮 Future Scope (Roadmap)

We are constantly working to improve Accessibility Analyzer. Planned features for v2.0 include:

* **🕸️ Deep Crawling:** A web spider to scan an entire domain (internal pages) instead of just a single URL.
* **🔐 Authenticated Scans:** Ability to scan pages behind login screens.
* **📅 Scheduled Audits:** Set up automated weekly scans to track compliance over time.
* **🧩 CI/CD Integration:** A GitHub Action to block deploys if accessibility score drops below a threshold.

---
## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Framer Motion (Animations), Recharts (Data Viz).
* **Backend:** Node.js, Express.js.
* **Scanning Engine:** Deque Systems' `axe-core` (Puppeteer).
* **Database & Auth:** Google Firebase (Firestore & Authentication).
* **Deployment:** Vercel (Frontend) / Render (Backend).

---

## ⚡ Getting Started

This project uses a split structure: `frontend` and `backend`.

### Prerequisites

* Node.js (v18+)
* A Firebase Project (Firestore enabled)

### Installation

1. **Clone the repo**
```bash
git clone https://github.com/karina-purswani/accessibility-analyzer.git
cd accessibility-analyzer

```


2. **Setup Backend**
```bash
cd backend
npm install
# ⚠️ Create a 'serviceAccountKey.json' file in the backend folder with your Firebase Admin credentials.
# ⚠️ Create a '.env' file with PORT=5000
npm run dev

```


3. **Setup Frontend** (Open a new terminal)
```bash
cd frontend
npm install
# ⚠️ Create a '.env' file with your VITE_FIREBASE_API_KEY and other config details.
npm run dev

```



---

## 🤝 Contributing

We welcome contributions!

* **Frontend UI, AI Logic and Visual Inspector Preview:** [Saburi Yeola]
* **Backend, Scan History, Report Exports and Demo Page:** [Karina Purswani]

If you'd like to improve the scoring algorithm or add new export formats, feel free to fork and submit a PR!

---

<p align="center">
Made with ❤️ and ☕ by Developers, for Developers.
</p>






