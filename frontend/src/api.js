import axios from "axios";

// If VITE_API_BASE_URL is specified (e.g. separate backend domain), use it.
// Otherwise, use relative "" so it automatically calls /api on the current host.
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/+$/, "");
  }
  return "";
};

const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

// Request Interceptor: Attach JWT Bearer Token if logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("agri_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Auth APIs ──
export const loginApi = (credentials) => api.post("/auth/login", credentials);
export const registerApi = (data) => api.post("/auth/register", data);
export const getMeApi = () => api.get("/auth/me");
export const getUsersApi = () => api.get("/auth/users");

// ── Bill APIs ──
export const createBill = (data) => api.post("/bills", data);

// Get bills (with optional date filter and admin userId filter)
export const getBills = (from = "", to = "", userId = "") => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  if (userId) params.userId = userId;
  return api.get("/bills", { params });
};

// Get single bill by ID
export const getBillById = (id) => api.get(`/bills/${id}`);

// Update a bill
export const updateBill = (id, data) => api.put(`/bills/${id}`, data);

// Delete a bill
export const deleteBill = (id) => api.delete(`/bills/${id}`);

// Download Excel as Blob directly through Axios
export const downloadExcel = async (from = "", to = "", userId = "") => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  if (userId) params.userId = userId;

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
  const userSuffix = userId && userId !== "all" ? `_user_${userId}` : "";
  const dateSuffix = from || to ? `_${from || "start"}_to_${to || "end"}` : "";
  link.setAttribute("download", `agri-bills${userSuffix}${dateSuffix}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Returns the full URL for Excel export (fallback)
export const getExportUrl = (from = "", to = "", userId = "") => {
  const base = BASE_URL || "";
  const token = localStorage.getItem("agri_token") || "";
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (userId) params.append("userId", userId);
  if (token) params.append("token", token);
  const query = params.toString() ? `?${params.toString()}` : "";
  return `${base}/api/bills/export${query}`;
};

export default api;
