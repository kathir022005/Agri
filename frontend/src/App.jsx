import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import BillForm from "./components/BillForm";
import BillList from "./components/BillList";
import BillDetail from "./components/BillDetail";

function App() {
  return (
    <div className="app-wrapper">
      {/* ── Top Navigation Bar ── */}
      <header className="navbar">
        <div className="navbar-brand">
          <span className="navbar-icon">🌾</span>
          <span className="navbar-title">Agri Billing</span>
          <span className="navbar-subtitle">வேளாண் கணக்கு</span>
        </div>
        <nav className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            + New Bill
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Bill History
          </NavLink>
        </nav>
      </header>

      {/* ── Page Content ── */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<BillForm />} />
          <Route path="/history" element={<BillList />} />
          <Route path="/bills/:id" element={<BillDetail />} />
          <Route path="/bills/:id/edit" element={<BillForm editMode />} />
          <Route path="*" element={
            <div className="not-found">
              <h2>404 — Page Not Found</h2>
              <NavLink to="/" className="btn btn-primary">Go Home</NavLink>
            </div>
          } />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>🌱 Agri Billing App · Built with MERN Stack</p>
      </footer>
    </div>
  );
}

export default App;
