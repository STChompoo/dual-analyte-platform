
import { useState } from "react";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
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
      const code =
        (err as { code?: string }).code;

      if (code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to sign in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Login using Popup
  const loginGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      if (result.user) {
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      const code =
        (err as { code?: string }).code;

      if (code === "auth/popup-blocked") {
        setError(
          "Google sign-in popup was blocked. Allow pop-ups for this website and try again."
        );
      } else if (code === "auth/popup-closed-by-user") {
        setError(
          "The Google sign-in window was closed before login completed."
        );
      } else if (code === "auth/unauthorized-domain") {
        setError(
          "This website is not authorized in Firebase Authentication. Please check Authorized domains."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Google sign-in failed. Please try again."
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
          required
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={loading}
        />

        <button
          type="button"
          onClick={login}
          disabled={loading || !email.trim() || !password}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <button
          type="button"
          className="google-btn"
          onClick={loginGoogle}
          disabled={loading}
        >
          {loading ? "Please wait..." : "Continue with Google"}
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
