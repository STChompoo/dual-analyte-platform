import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";

import { auth } from "../firebase";

import "./Register.css";

export default function Register() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");


  const register = async () => {

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Account created successfully!");

    } catch (error: any) {

      alert(error.message);

    }

  };


  return (

    <div className="register-page">

      <div className="register-card">

        <h1 className="logo">
          🧬
        </h1>


        <h2>
          Create Account
        </h2>


        <p className="subtitle">
          Join Dual-Analyte ePAD Platform
        </p>


        <input
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />


        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />


        <button onClick={register}>
          Create Account
        </button>


        <p className="login-text">

          Already have an account?

          <Link to="/login">
            Sign In
          </Link>

        </p>

      </div>

    </div>

  );

}