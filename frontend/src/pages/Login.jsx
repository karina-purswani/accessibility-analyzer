import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../firebase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false); // 🔁 TOGGLE
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Google Login (same for login/signup)
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/analyze");
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Email Login OR Signup (explicit)
  const handleEmailAuth = async () => {
    setError(null);

    // 🛑 1. BASIC VALIDATION (The Fix for the LinkedIn Feedback)
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return; // Stop here, don't talk to Firebase
    }

    setLoading(true);

    try {
      if (isSignup) {
        // 🆕 SIGN UP
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // 🔐 LOGIN
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/analyze");
    } catch (err) {
      console.error(err);

      // 🔴 FRIENDLY ERROR MESSAGES
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("Account not found. Please sign up or check your details.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Account already exists. Please log in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to toggle mode and clear errors
  const toggleMode = (mode) => {
    setIsSignup(mode);
    setError(null); // Clear errors when switching forms
    setEmail("");   // Optional: Clear inputs if you want a fresh start
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 pt-24 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          {isSignup ? "Create your account" : "Sign in to Accessibility Analyzer"}
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          {isSignup
            ? "Create an account to start scanning websites"
            : "Welcome back! Please sign in to continue"}
        </p>

        {/* GOOGLE AUTH */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition font-semibold"
        >
          Continue with Google
        </button>

        <div className="my-6 text-center text-gray-400 text-sm">
          OR
        </div>

        {/* EMAIL INPUT */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if(error) setError(null); // Clear error as user types
          }}
          className="w-full mb-4 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* PASSWORD INPUT */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if(error) setError(null); // Clear error as user types
          }}
          className="w-full mb-4 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* SUBMIT */}
        <button
          onClick={handleEmailAuth}
          disabled={loading} // Only disable if loading, NOT if fields are empty (so we can show error)
          className={`w-full py-3 rounded-xl font-semibold transition ${
            loading 
              ? "bg-blue-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          {loading
            ? "Please wait..."
            : isSignup
            ? "Create Account"
            : "Continue with Email"}
        </button>

        {/* ERROR */}
        {error && (
          <p className="mt-4 text-sm text-red-600 text-center bg-red-50 py-2 rounded-lg border border-red-100">
            ⚠️ {error}
          </p>
        )}

        {/* TOGGLE */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => toggleMode(false)}
                className="text-blue-600 font-semibold hover:underline"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => toggleMode(true)}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}