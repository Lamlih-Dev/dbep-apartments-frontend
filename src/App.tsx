import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { isLoggedIn, clearToken } from "./auth";

import ApartmentsListPage from "./pages/ApartmentsListPage";
import ApartmentCreatePage from "./pages/ApartmentCreatePage";
import ApartmentDetailsPage from "./pages/ApartmentDetailsPage";
import ApartmentUpdatePage from "./pages/ApartmentUpdatePage";
import LoginPage from "./pages/LoginPage";
import RequireAuth from "./RequireAuth";

import "./AppLayout.css";

export default function App() {
  const navigate = useNavigate();
  const logged = isLoggedIn();

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="appShell">
      <header className="appNav">
        <div className="appContainer appNavInner">
          <Link className="appBrand" to="/apartments" aria-label="Accueil des appartements">
            <span className="appBrandMark" />
            <span className="appBrandText">DBEP REAL ESTATE</span>
          </Link>

          <nav className="appNavLinks" aria-label="Principal">
            <Link className="appNavLink" to="/apartments">
              Portfolio
            </Link>
          </nav>

          <div className="appNavActions">
            {logged && (
              <Link className="appBtn appBtnGhost" to="/apartments/new">
                Nouvel appartement
              </Link>
            )}

            {!logged ? (
              <Link className="appBtn appBtnPrimary" to="/login">
                Connexion
              </Link>
            ) : (
              <button className="appBtn appBtnPrimary" onClick={handleLogout}>
                Déconnexion
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="appContainer appMain">
        <Routes>
          <Route path="/" element={<Navigate to="/apartments" replace />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/apartments" element={<ApartmentsListPage />} />

          <Route
            path="/apartments/new"
            element={
              <RequireAuth>
                <ApartmentCreatePage />
              </RequireAuth>
            }
          />

          <Route path="/apartments/:id" element={<ApartmentDetailsPage />} />

          <Route
            path="/apartments/:id/edit"
            element={
              <RequireAuth>
                <ApartmentUpdatePage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<div>404 - Introuvable</div>} />
        </Routes>
      </main>
    </div>
  );
}
