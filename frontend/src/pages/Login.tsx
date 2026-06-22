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


  // Email & Password Login
  const login = async () => {

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ไปหน้า Analyzer
      navigate("/");

    } catch (error: any) {

      alert(error.message);

    }

  };


  // Google Login
  const loginGoogle = async () => {

    try {

      await signInWithPopup(
        auth,
        googleProvider
      );

      // ไปหน้า Analyzer
      navigate("/");

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
          Vitamin B12 & Folate Analysis Platform
        </p>


        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />


        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
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

          Don't have an account?

          {" "}

          <Link to="/register">
            Create one
          </Link>

        </p>


      </div>

    </div>

  );

}