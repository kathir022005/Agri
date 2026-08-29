import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, username, password, confirmPassword, address } = formData;

    if (!name || !username || !password || !address) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await register({
        name,
        username,
        password,
        address,
      });
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "2.5rem" }}>🧑‍🌾</span>
          <h2 style={{ color: "var(--green)", marginTop: "0.5rem" }}>Farmer Registration</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Create an account to record and track your agricultural purchase/sale bills
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
            <label className="form-label">Full Name / Farm Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Karthik / Green Valley Agro"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username (Login ID) *</label>
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="e.g. karthik_agri"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address / Village / District *</label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="e.g. 12, South Street, Madurai, Tamil Nadu"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password *</label>
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
              name="password"
              className="form-control"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              className="form-control"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "✨ Register Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--green)", fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
