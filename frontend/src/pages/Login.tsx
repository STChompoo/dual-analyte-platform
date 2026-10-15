
import { useState } from "react";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  auth,
  googleProvider,
} from "../firebase";

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email & Password Login
  const login = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const loginGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;

      if (code === "auth/popup-blocked") {
        setError(
          "Popup blocked. Please allow pop-ups and try again."
        );
      } else if (code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Google sign-in failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Continue as Guest
  const loginGuest = async () => {
    setError("");
    setLoading(true);

    try {
      await signInAnonymously(auth);

      navigate("/", { replace: true });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;

      if (code === "auth/operation-not-allowed") {
        setError(
          "Guest access is not enabled yet. Please enable Anonymous sign-in in Firebase Console."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to continue as guest."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="logo">🧬</h1>

        <h2>Dual-Analyte ePAD</h2>

        <p className="subtitle">
          Vitamin B12 &amp; Folate Analysis Platform
        </p>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />

        <button
          type="button"
          onClick={login}
          disabled={loading || !email.trim() || !password}
        >
          {loading ? "Please wait..." : "Sign In"}
        </button>

        <button
          type="button"
          className="google-btn"
          onClick={loginGoogle}
          disabled={loading}
        >
          Continue with Google
        </button>

        <div className="guest-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="guest-btn"
          onClick={loginGuest}
          disabled={loading}
        >
          {loading ? "Please wait..." : "Continue as Guest"}
        </button>

        <p className="register-text">
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
