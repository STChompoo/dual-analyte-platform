import { useState, useEffect } from "react";

import {
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
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

  // Check Google Login result after redirect
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result) {
          navigate("/", { replace: true });
        }
      } catch (error: any) {
        alert(error.message);
      }
    };

    checkRedirect();
  }, [navigate]);

  // Email & Password Login
  const login = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/", { replace: true });
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Google Login using Redirect
  const loginGoogle = async () => {
    try {
      await signInWithRedirect(
        auth,
        googleProvider
      );
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="logo">
          🧬
        </h1>

        <h2>
          Dual-Analyte ePAD
        </h2>

        <p className="subtitle">
          Vitamin B12 &amp; Folate Analysis Platform
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>
          Sign In
        </button>

        <button
          className="google-btn"
          onClick={loginGoogle}
        >
          Continue with Google
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
