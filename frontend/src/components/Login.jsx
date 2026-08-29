import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickFill = () => {
    setUsername("kathirusha");
    setPassword("Usha2005@@");
  };

  return (
    <div style={{ maxWidth: "440px", margin: "2rem auto" }}>
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "2.5rem" }}>🌾</span>
          <h2 style={{ color: "var(--green)", marginTop: "0.5rem" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Sign in to manage agriculture bills & accounts
          </p>
        </div>

        {error && (
          <div
            className="card"
            style={{
              borderLeft: "4px solid var(--danger)",
              color: "var(--danger)",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              fontSize: "0.9rem",
              background: "#FFF4F4",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. kathirusha"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--brown)",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  padding: 0,
                  fontWeight: 600,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "🔐 Sign In"}
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "0.75rem",
            background: "var(--cream-dark)",
            borderRadius: "var(--radius)",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><strong>Admin Login:</strong> kathirusha</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAdminQuickFill}
              style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
            >
              Fill Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          New Farmer / User?{" "}
          <Link to="/register" style={{ color: "var(--green)", fontWeight: 700 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
