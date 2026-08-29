import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getBills, deleteBill, downloadExcel, getExportUrl } from "../api";

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

/* ── Quick View Modal ── */
function QuickViewModal({ bill, onClose, onEdit }) {
  if (!bill) return null;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      weekday: "short", day: "2-digit", month: "short", year: "numeric",
    });
  const formatAmount = (n) =>
    Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="confirm-box" style={{ maxWidth: "600px", textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, color: "var(--green)" }}>📄 Bill Summary</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          <strong>Date:</strong> {formatDate(bill.date)}
        </div>
        <div className="table-wrapper" style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "1rem" }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item (Tanglish)</th>
                <th style={{ textAlign: "right" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Rate (₹)</th>
                <th style={{ textAlign: "right" }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{item.itemLabel}</td>
                  <td style={{ textAlign: "right" }}>{item.capacity}</td>
                  <td style={{ textAlign: "right" }}>₹ {formatAmount(item.amount)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>₹ {formatAmount(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grand-total-bar" style={{ borderRadius: "var(--radius)", marginBottom: "1.25rem" }}>
          <span className="label">Grand Total:</span>
          <span className="amount">₹ {formatAmount(bill.grandTotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => onEdit(bill._id)}>✏️ Edit</button>
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
  const [downloading, setDownloading] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [confirm, setConfirm] = useState(null); // { id, date }
  const [quickViewBill, setQuickViewBill] = useState(null);
  const [error, setError] = useState("");

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getBills(from, to);
      setBills(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load bills. Please ensure the backend is connected.");
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

  const handleExcelDownload = async () => {
    if (bills.length === 0) {
      alert("No bills available to export.");
      return;
    }
    setDownloading(true);
    try {
      await downloadExcel(from, to);
    } catch (err) {
      console.error("Excel download error:", err);
      // Fallback to direct link if blob download fails
      window.open(getExportUrl(from, to), "_blank");
    } finally {
      setDownloading(false);
    }
  };

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

      {quickViewBill && (
        <QuickViewModal
          bill={quickViewBill}
          onClose={() => setQuickViewBill(null)}
          onEdit={(id) => navigate(`/bills/${id}/edit`)}
        />
      )}

      <h1 className="page-heading">📋 Bill History & Export</h1>

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
          <button
            type="button"
            className="btn btn-accent"
            onClick={handleExcelDownload}
            disabled={downloading}
          >
            {downloading ? "⏳ Exporting..." : "📥 Download Excel (.xlsx)"}
          </button>
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
          <p>No bills found. Create your first bill to record transactions and export data to Excel!</p>
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
                  <th>Items (Tanglish)</th>
                  <th style={{ textAlign: "right" }}>Grand Total (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill, idx) => (
                  <tr key={bill._id}>
                    <td>{bills.length - idx}</td>
                    <td><strong>{formatDate(bill.date)}</strong></td>
                    <td>
                      <span className="badge">{bill.items.length} item{bill.items.length !== 1 ? "s" : ""}</span>
                      <span style={{ marginLeft: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {bill.items.map((i) => i.itemLabel ? i.itemLabel.split(" - ")[0] : i.itemCode).join(", ")}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--brown)", fontSize: "1rem" }}>
                      ₹ {formatAmount(bill.grandTotal)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setQuickViewBill(bill)}
                          title="Quick View"
                        >
                          👁 Quick View
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/bills/${bill._id}`)}
                          title="Full Details"
                        >
                          📄 Detail
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/bills/${bill._id}/edit`)}
                          title="Edit Bill"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => setConfirm({ id: bill._id, date: bill.date })}
                          title="Delete Bill"
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
            padding: "0.85rem 1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid var(--cream-darker)",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}>
            <span><strong>{bills.length}</strong> bill{bills.length !== 1 ? "s" : ""} recorded</span>
            <span style={{ fontWeight: 800, color: "var(--green-dark)", fontSize: "1.05rem" }}>
              Total Value: ₹ {formatAmount(bills.reduce((s, b) => s + (b.grandTotal || 0), 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillList;
