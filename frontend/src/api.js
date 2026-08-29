import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Create a new bill
export const createBill = (data) => api.post("/bills", data);

// Get all bills (with optional date filter)
export const getBills = (from = "", to = "") => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  return api.get("/bills", { params });
};

// Get single bill by ID
export const getBillById = (id) => api.get(`/bills/${id}`);

// Update a bill
export const updateBill = (id, data) => api.put(`/bills/${id}`, data);

// Delete a bill
export const deleteBill = (id) => api.delete(`/bills/${id}`);

// Returns the full URL for Excel export (used as <a href> for direct download)
export const getExportUrl = (from = "", to = "") => {
  const base = BASE_URL || "";
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  const query = params.toString() ? `?${params.toString()}` : "";
  return `${base}/api/bills/export${query}`;
};

export default api;
