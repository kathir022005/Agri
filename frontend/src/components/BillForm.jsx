import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AGRI_ITEMS } from "../config/items";
import { createBill, getBillById, updateBill } from "../api";

/* ── Helpers ── */
const today = () => new Date().toISOString().split("T")[0];

const emptyRow = () => ({
  itemCode: AGRI_ITEMS[0].code,
  itemLabel: AGRI_ITEMS[0].label,
  capacity: "",
  amount: "",
  total: 0,
});

/* ── Toast Component ── */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

/* ── BillForm ── */
function BillForm({ editMode }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [date, setDate] = useState(today());
  const [rows, setRows] = useState([emptyRow()]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => setToast({ msg, type });
  const clearToast = () => setToast({ msg: "", type: "success" });

  // Load bill data for edit mode
  useEffect(() => {
    if (!editMode || !id) return;
    setFetching(true);
    getBillById(id)
      .then(({ data }) => {
        setDate(new Date(data.date).toISOString().split("T")[0]);
        setRows(
          data.items.map((item) => ({
            itemCode: item.itemCode,
            itemLabel: item.itemLabel,
            capacity: item.capacity,
            amount: item.amount,
            total: item.total,
          }))
        );
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || "Failed to load bill.";
        showToast(`Error: ${msg}`, "error");
      })
      .finally(() => setFetching(false));
  }, [editMode, id]);

  /* ── Row Handlers ── */
  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Recalculate total for this row
      const cap = parseFloat(field === "capacity" ? value : updated[index].capacity) || 0;
      const amt = parseFloat(field === "amount" ? value : updated[index].amount) || 0;
      updated[index].total = parseFloat((cap * amt).toFixed(2));

      // If item dropdown changed, update label too
      if (field === "itemCode") {
        const found = AGRI_ITEMS.find((i) => i.code === value);
        updated[index].itemLabel = found ? found.label : value;
      }

      return updated;
    });
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (index) => {
    if (rows.length === 1) return; // keep at least one row
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotal = rows.reduce((sum, r) => sum + (r.total || 0), 0);

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) { showToast("Please select a date.", "error"); return; }

    const invalidRow = rows.find(
      (r) => !r.itemCode || !r.capacity || !r.amount || r.capacity <= 0 || r.amount <= 0
    );
    if (invalidRow) {
      showToast("Please fill in all item rows with valid Capacity and Amount.", "error");
      return;
    }

    const payload = {
      date,
      items: rows.map((r) => ({
        itemCode: r.itemCode,
        itemLabel: r.itemLabel,
        capacity: parseFloat(r.capacity),
        amount: parseFloat(r.amount),
        total: r.total,
      })),
      grandTotal,
    };

    setLoading(true);
    try {
      if (editMode && id) {
        await updateBill(id, payload);
        showToast("✅ Bill updated successfully!");
        setTimeout(() => navigate(`/bills/${id}`), 1200);
      } else {
        await createBill(payload);
        showToast("✅ Bill saved successfully!");
        setTimeout(() => navigate("/history"), 1200);
      }
    } catch (err) {
      console.error("Save bill error:", err);
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        showToast(`❌ ${serverMsg}`, "error");
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network")) {
        showToast("❌ Network Error: Backend server is waking up or unreachable. Retrying in a few seconds...", "error");
      } else {
        showToast(`❌ Save failed: ${err.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading"><div className="spinner" /></div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Toast msg={toast.msg} type={toast.type} onClose={clearToast} />

      <h1 className="page-heading">
        {editMode ? "✏️ Edit Bill" : "📝 New Bill Entry"}
      </h1>

      {/* ── Date ── */}
      <div className="card">
        <div className="bill-form-header">
          <div className="form-group bill-date-group">
            <label className="form-label">Bill Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* ── Line Items ── */}
        <div className="line-items-section">
          <h3>📦 Item Details</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="col-item">Item (Tanglish)</th>
                  <th className="col-num">Capacity</th>
                  <th className="col-num">Amount (₹)</th>
                  <th className="col-total">Total (₹)</th>
                  <th className="col-action"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    {/* Item Dropdown */}
                    <td className="col-item">
                      <select
                        className="form-control"
                        value={row.itemCode}
                        onChange={(e) => updateRow(idx, "itemCode", e.target.value)}
                      >
                        {AGRI_ITEMS.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Capacity */}
                    <td className="col-num">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        value={row.capacity}
                        onChange={(e) => updateRow(idx, "capacity", e.target.value)}
                        required
                      />
                    </td>

                    {/* Amount */}
                    <td className="col-num">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={row.amount}
                        onChange={(e) => updateRow(idx, "amount", e.target.value)}
                        required
                      />
                    </td>

                    {/* Auto-calculated Total */}
                    <td className="col-total">
                      ₹ {row.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Remove Row */}
                    <td className="col-action">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeRow(idx)}
                        disabled={rows.length === 1}
                        title="Remove row"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grand Total Bar */}
          <div className="grand-total-bar">
            <span className="label">Grand Total:</span>
            <span className="amount">
              ₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Add Row button */}
        <div className="add-row-section" style={{ marginTop: "1rem" }}>
          <button type="button" className="btn btn-secondary" onClick={addRow}>
            + Add Item Row
          </button>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(editMode ? `/bills/${id}` : "/history")}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? "Saving…" : editMode ? "💾 Update Bill" : "💾 Save Bill"}
        </button>
      </div>
    </form>
  );
}

export default BillForm;
