import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBillById, deleteBill } from "../api";
import { useAuth } from "../context/AuthContext";

/* ── Confirm Dialog ── */
function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="confirm-box">
        <h3>⚠️ Delete Bill?</h3>
        <p>This bill and all its line items will be permanently deleted. This cannot be undone.</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── BillDetail ── */
function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    getBillById(id)
      .then(({ data }) => setBill(data))
      .catch((err) => {
        const msg = err.response?.data?.message || "Bill not found or access denied.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteBill(id);
      navigate("/history");
    } catch {
      setError("Failed to delete bill.");
      setShowConfirm(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });

  const formatAmount = (n) =>
    Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  if (error) return (
    <div>
      <Link to="/history" className="back-link">← Back to History</Link>
      <div className="card" style={{ borderLeft: "4px solid var(--danger)", color: "var(--danger)" }}>
        {error}
      </div>
    </div>
  );

  return (
    <div>
      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <Link to="/history" className="back-link">← Back to Bill History</Link>

      <h1 className="page-heading">📄 Bill Details</h1>

      <div className="card">
        {/* ── Meta info ── */}
        <div className="detail-meta">
          <div className="meta-item">
            <span className="meta-label">Bill Date</span>
            <span className="meta-value">{formatDate(bill.date)}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Farmer / Account</span>
            <span className="meta-value" style={{ color: "var(--brown)" }}>
              {bill.userName || "Admin"}
            </span>
            {bill.userAddress && (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {bill.userAddress}
              </span>
            )}
          </div>

          <div className="meta-item">
            <span className="meta-label">Total Items</span>
            <span className="meta-value">{bill.items.length}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Grand Total</span>
            <span className="meta-value grand">₹ {formatAmount(bill.grandTotal)}</span>
          </div>
        </div>

        {/* ── Line Items Table ── */}
        <div className="card-title">📦 Items in this Bill</div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item (Tanglish)</th>
                <th style={{ textAlign: "right" }}>Capacity</th>
                <th style={{ textAlign: "right" }}>Amount (₹)</th>
                <th style={{ textAlign: "right" }}>Row Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{item.itemLabel}</td>
                  <td style={{ textAlign: "right" }}>{item.capacity}</td>
                  <td style={{ textAlign: "right" }}>₹ {formatAmount(item.amount)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--brown)" }}>
                    ₹ {formatAmount(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grand Total footer */}
        <div className="grand-total-bar" style={{ borderRadius: "0 0 var(--radius) var(--radius)", marginTop: 0 }}>
          <span className="label">Grand Total:</span>
          <span className="amount">₹ {formatAmount(bill.grandTotal)}</span>
        </div>

        {/* ── Actions ── */}
        <div className="detail-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate(`/bills/${id}/edit`)}
          >
            ✏️ Edit Bill
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setShowConfirm(true)}
          >
            🗑 Delete Bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillDetail;
