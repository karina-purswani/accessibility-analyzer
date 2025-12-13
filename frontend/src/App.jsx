import { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // REAL BACKEND INTEGRATION
  const handleScan = async () => {
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("http://localhost:5000/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      setResults(data);

    } catch (err) {
      setResults({
        error:
          "Scan failed. Please check the URL or make sure the backend server is running.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
      
      {/* HEADER */}
      <h1 className="text-4xl font-bold text-blue-700 mb-6">
        Accessibility Analyzer
      </h1>

      {/* CARD */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl">
        <label className="block text-gray-700 font-medium mb-2">
          Enter a website URL:
        </label>

        <input
          type="text"
          placeholder="https://example.com"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={handleScan}
          disabled={loading || !url}
          className={`w-full mt-4 py-3 rounded-lg text-white font-semibold transition 
            ${loading || !url ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {loading ? "Scanning..." : "Run Accessibility Scan"}
        </button>
      </div>

      {/* RESULTS SECTION */}
      {results && (
        <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-2xl mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Scan Results
          </h2>

          <pre className="bg-gray-200 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
