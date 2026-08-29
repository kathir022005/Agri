import axios from "axios";

// In local development (import.meta.env.DEV), always use "" so Vite proxies to localhost:5000.
// In production, use VITE_API_BASE_URL if set, otherwise fallback to current origin or Render URL.
const getBaseUrl = () => {
  if (import.meta.env.DEV) {
    // If running locally, route directly to local backend via relative proxy ""
    return "";
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/+$/, "");
  }
  return "https://agri-lg30.onrender.com";
};

const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
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

// Download Excel as Blob directly through Axios
export const downloadExcel = async (from = "", to = "") => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const response = await api.get("/bills/export", {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const dateSuffix = from || to ? `_${from || "start"}_to_${to || "end"}` : "";
  link.setAttribute("download", `agri-bills${dateSuffix}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Returns the full URL for Excel export (fallback)
export const getExportUrl = (from = "", to = "") => {
  const base = BASE_URL || "";
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  const query = params.toString() ? `?${params.toString()}` : "";
  return `${base}/api/bills/export${query}`;
};

export default api;
