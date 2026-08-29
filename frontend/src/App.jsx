import React from "react";
import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import BillForm from "./components/BillForm";
import BillList from "./components/BillList";
import BillDetail from "./components/BillDetail";
import AdminUsers from "./components/AdminUsers";
import Login from "./components/Login";
import Register from "./components/Register";

// Protected Route wrapper: requires login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Admin Route wrapper: requires admin role
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function Navigation() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <span className="navbar-icon">🌾</span>
        <div>
          <span className="navbar-title">Agri Billing</span>
          <span className="navbar-subtitle">வேளாண் கணக்கு</span>
        </div>
      </div>

      <nav className="navbar-links">
        {user ? (
          <>
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              + New Bill
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              {isAdmin ? "All Bills" : "My Bills"}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                👥 Farmers
              </NavLink>
            )}

            {/* User Profile Badge & Logout */}
            <div className="user-profile-badge">
              <span className="user-name">
                {isAdmin ? "👑" : "🧑‍🌾"} {user.name}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
                title="Sign Out"
                style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem" }}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Sign In
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Navigation />

        <main className="main-content">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected App Routes */}
            <Route path="/" element={<ProtectedRoute><BillForm /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><BillList /></ProtectedRoute>} />
            <Route path="/bills/:id" element={<ProtectedRoute><BillDetail /></ProtectedRoute>} />
            <Route path="/bills/:id/edit" element={<ProtectedRoute><BillForm editMode /></ProtectedRoute>} />

            {/* Admin Only Route */}
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <div className="not-found">
                <h2>404 — Page Not Found</h2>
                <NavLink to="/" className="btn btn-primary">Go Home</NavLink>
              </div>
            } />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>🌱 Agri Billing App · Built with MERN Stack · Role-Based Security</p>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
