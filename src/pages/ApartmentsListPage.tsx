import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

type Apartment = {
  id: string;
  title: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const DETAILS_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/apartments` : "http://localhost:5173/apartments/";

export default function ApartmentsListPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qrApartmentId, setQrApartmentId] = useState<string | null>(null);

  // Clear QR selection only after modal fully closes
  useEffect(() => {
    const el = document.getElementById("qrModal");
    if (!el) return;

    const handler = () => setQrApartmentId(null);
    el.addEventListener("hidden.bs.modal", handler);

    return () => el.removeEventListener("hidden.bs.modal", handler);
  }, []);

  async function loadApartments() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/apartments`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Apartment[];

      setApartments(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load apartments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    const ok = confirm("Delete this apartment?");
    if (!ok) return;

    const res = await fetch(`${API_BASE_URL}/api/apartments/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete.");
      return;
    }

    // update UI
    setApartments((prev) => prev.filter((a) => a.id !== id));
  }

  const qrValue = useMemo(() => {
    if (!qrApartmentId) return "";
    return `${DETAILS_BASE_URL}${qrApartmentId}`;
  }, [qrApartmentId]);

  return (
    <div>
      <div className="page-title">
        <h2 className="m-0">Apartments</h2>
        <Link to="/apartments/new" className="btn btn-primary">
          Create new apartment
        </Link>
      </div>

      {loading && <div className="text-muted">Loading…</div>}

      {error && (
        <div className="alert alert-danger">
          {error}{" "}
          <button className="btn btn-sm btn-outline-light ms-2" onClick={loadApartments}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && apartments.length === 0 && (
        <div className="text-muted">No apartments yet.</div>
      )}

      <div className="list-group">
        {apartments.map((apt) => (
          <div
            key={apt.id}
            className="list-group-item d-flex align-items-center justify-content-between"
          >
            <div>
              <div className="fw-bold">{apt.title}</div>
              <Link to={`/apartments/${apt.id}`} className="small">
                View details
              </Link>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#qrModal"
                onClick={() => setQrApartmentId(apt.id)}
              >
                Show QR
              </button>

              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDelete(apt.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="qrModal"
        tabIndex={-1}
        aria-labelledby="qrModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="qrModalLabel">
                Apartment QR Code
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              {!qrApartmentId ? (
                <div className="text-muted">Loading…</div>
              ) : (
                <div className="d-flex flex-column align-items-center gap-3">
                  <QRCodeCanvas value={qrValue} size={260} includeMargin level="M" />
                  <div className="small text-muted text-center">
                    Encoded URL:
                    <div className="text-break">{qrValue}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>

              {qrApartmentId && (
                <Link
                  className="btn btn-primary"
                  to={`/apartments/${qrApartmentId}`}
                  data-bs-dismiss="modal"
                >
                  Open details
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
