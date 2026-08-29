import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsersApi } from "../api";
import { useAuth } from "../context/AuthContext";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }

    setLoading(true);
    getUsersApi()
      .then(({ data }) => setUsers(data))
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load registered farmers list.");
      })
      .finally(() => setLoading(false));
  }, [isAdmin, navigate]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.address.toLowerCase().includes(search.toLowerCase())
  );

  const formatAmount = (n) =>
    Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const totalFarmersBills = users.reduce((sum, u) => sum + (u.billsCount || 0), 0);
  const totalFarmersTurnover = users.reduce((sum, u) => sum + (u.totalAmount || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-heading" style={{ margin: 0 }}>👥 Registered Farmers & Users</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
            Admin overview of all registered accounts and their transaction activity
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/history")}>
          ← Back to All Bills
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="card" style={{ marginBottom: 0, padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
            Total Farmers
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--green)", marginTop: "0.25rem" }}>
            {users.length}
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0, padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
            Total Bills Recorded
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brown)", marginTop: "0.25rem" }}>
            {totalFarmersBills}
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0, padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
            Total Trade Value
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--mustard-dark)", marginTop: "0.25rem" }}>
            ₹ {formatAmount(totalFarmersTurnover)}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search farmers by name, username, or village/address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="card" style={{ borderLeft: "4px solid var(--danger)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🌾</div>
          <p>{search ? "No farmers match your search." : "No registered farmers yet."}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Farmer / Name</th>
                  <th>Username</th>
                  <th>Address</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: "center" }}>Bills</th>
                  <th style={{ textAlign: "right" }}>Total Value (₹)</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr key={u._id}>
                    <td>{idx + 1}</td>
                    <td><strong>{u.name}</strong></td>
                    <td><code>@{u.username}</code></td>
                    <td>{u.address}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className="badge">{u.billsCount}</span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--brown)" }}>
                      ₹ {formatAmount(u.totalAmount)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/history?userId=${u._id}`)}
                      >
                        📂 View Bills
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
