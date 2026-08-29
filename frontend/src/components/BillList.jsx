import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getBills, deleteBill, getExportUrl } from "../api";

/* ── Confirm Dialog ── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="confirm-box">
        <h3>⚠️ Confirm Delete</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── BillList ── */
function BillList() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [confirm, setConfirm] = useState(null); // { id, date }
  const [error, setError] = useState("");

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getBills(from, to);
      setBills(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load bills. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  // Load on mount
  useEffect(() => { fetchBills(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchBills();
  };

  const handleClear = () => {
    setFrom("");
    setTo("");
    setTimeout(fetchBills, 0);
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await deleteBill(confirm.id);
      setBills((prev) => prev.filter((b) => b._id !== confirm.id));
    } catch {
      setError("Failed to delete bill.");
    } finally {
      setConfirm(null);
    }
  };

  const exportUrl = getExportUrl(from, to);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const formatAmount = (n) =>
    Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  return (
    <div>
      {confirm && (
        <ConfirmDialog
          message={`Delete bill dated ${formatDate(confirm.date)}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      <h1 className="page-heading">📋 Bill History</h1>

      {/* ── Filter Bar ── */}
      <form className="filter-bar" onSubmit={handleFilter}>
        <div className="form-group">
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-control"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-control"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button type="submit" className="btn btn-primary">🔍 Filter</button>
          <button type="button" className="btn btn-secondary" onClick={handleClear}>✕ Clear</button>
          <a
            href={exportUrl}
            className="btn btn-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            📥 Download Excel
          </a>
        </div>
      </form>

      {/* ── Error ── */}
      {error && (
        <div className="card" style={{ borderLeft: "4px solid var(--danger)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : bills.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🌾</div>
          <p>No bills found. Create your first bill!</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            + New Bill
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="bills-table-wrapper">
            <table className="bills-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th style={{ textAlign: "right" }}>Grand Total (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill, idx) => (
                  <tr key={bill._id}>
                    <td>{bills.length - idx}</td>
                    <td>{formatDate(bill.date)}</td>
                    <td>
                      <span className="badge">{bill.items.length} item{bill.items.length !== 1 ? "s" : ""}</span>
                      <span style={{ marginLeft: "0.5rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                        {bill.items.map((i) => i.itemCode).join(", ")}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--brown)" }}>
                      ₹ {formatAmount(bill.grandTotal)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate(`/bills/${bill._id}`)}
                        >
                          👁 View
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/bills/${bill._id}/edit`)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setConfirm({ id: bill._id, date: bill.date })}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Summary footer */}
          <div style={{
            background: "var(--cream-dark)",
            padding: "0.75rem 1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid var(--cream-darker)",
            fontSize: "0.88rem",
            color: "var(--text-muted)",
          }}>
            <span>{bills.length} bill{bills.length !== 1 ? "s" : ""} found</span>
            <span style={{ fontWeight: 700, color: "var(--brown)" }}>
              Period Total: ₹ {formatAmount(bills.reduce((s, b) => s + b.grandTotal, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillList;
