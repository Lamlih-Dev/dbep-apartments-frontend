import { Routes, Route, Navigate, Link } from "react-router-dom";

import ApartmentsListPage from "./pages/ApartmentsListPage.tsx";
import ApartmentCreatePage from "./pages/ApartmentCreatePage.tsx";
import ApartmentDetailsPage from "./pages/ApartmentDetailsPage.tsx";
import ApartmentUpdatePage from "./pages/ApartmentUpdatePage.tsx";

export default function App() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/apartments">
            Apartments
          </Link>

          <div className="ms-auto">
            <Link className="btn btn-outline-light" to="/apartments/new">
              New apartment
            </Link>
          </div>
        </div>
      </nav>

      <main className="container py-4">
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
