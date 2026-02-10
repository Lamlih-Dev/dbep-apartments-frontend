import { Routes, Route, Navigate, Link } from "react-router-dom";

import ApartmentsListPage from "./pages/ApartmentsListPage";
import ApartmentCreatePage from "./pages/ApartmentCreatePage";
import ApartmentDetailsPage from "./pages/ApartmentDetailsPage";
import ApartmentUpdatePage from "./pages/ApartmentUpdatePage";

import "./AppLayout.css";

export default function App() {
  return (
    <div className="appShell">
      <header className="appNav">
        <div className="appContainer appNavInner">
          <Link className="appBrand" to="/apartments" aria-label="Apartments home">
            <span className="appBrandMark" />
            <span className="appBrandText">DBEP REAL ESTATE</span>
          </Link>

          <nav className="appNavLinks" aria-label="Primary">
            <Link className="appNavLink" to="/apartments">
              Portfolio
            </Link>
          </nav>

          <div className="appNavActions">
            <Link className="appBtn appBtnGhost" to="/apartments/new">
              New apartment
            </Link>
          </div>
        </div>
      </header>

      <main className="appContainer appMain">
        <Routes>
          <Route path="/" element={<Navigate to="/apartments" replace />} />

          <Route path="/apartments" element={<ApartmentsListPage />} />
          <Route path="/apartments/new" element={<ApartmentCreatePage />} />
          <Route path="/apartments/:id" element={<ApartmentDetailsPage />} />
          <Route path="/apartments/:id/edit" element={<ApartmentUpdatePage />} />

          <Route path="*" element={<div>404 - Not found</div>} />
        </Routes>
      </main>
    </div>
  );
}
