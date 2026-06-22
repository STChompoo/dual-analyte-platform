import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

import "./Navbar.css";

export default function Navbar() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link to="/" className="logo">
        🧬 Dual-Analyte ePAD
      </Link>


      {/* Navigation */}
      <div className="menu">

        <Link to="/">
          🧪 Analyzer
        </Link>

        <Link to="/history">
          📊 History
        </Link>

      </div>


      {/* Right side */}
      <div className="user">

        


        <span className="user-email">
          {user.email}
        </span>


        <button onClick={logout}>
          Logout
        </button>

      </div>

    </nav>
  );
}