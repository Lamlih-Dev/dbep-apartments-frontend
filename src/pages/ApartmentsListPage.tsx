import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { apiFetch } from "../api";
import "./ApartmentsListPage.css";
import { isLoggedIn } from "../auth";

type Apartment = {
  id: string;
  title: string;
  imageUrl: string | null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const DETAILS_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL
  ? `${import.meta.env.VITE_FRONTEND_BASE_URL}/apartments/`
  : "http://localhost:5173/apartments/";

const FALLBACK_IMG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <path d="M120 580 L420 320 L640 520 L780 420 L1080 620 L1080 700 L120 700 Z" fill="#e5e7eb"/>
  <circle cx="940" cy="240" r="60" fill="#e5e7eb"/>
</svg>
`);

export default function ApartmentsListPage() {
  const navigate = useNavigate();

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrApartmentId, setQrApartmentId] = useState<string | null>(null);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canEdit = isLoggedIn();

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
      setError(e?.message ?? "Impossible de charger les appartements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApartments();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet appartement ?")) return;

    const res = await apiFetch(`${API_BASE_URL}/api/apartments/${id}`, {
      method: "DELETE",
      auth: true,
    });

    if (!res.ok) {
      alert("Échec de la suppression.");
      return;
    }

    setApartments((prev) => prev.filter((a) => a.id !== id));
  }

  function downloadQr() {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "qr-appartement.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const qrValue = useMemo(() => {
    if (!qrApartmentId) return "";
    return `${DETAILS_BASE_URL}${qrApartmentId}`;
  }, [qrApartmentId]);

  function closeQrModal() {
    const el = document.getElementById("qrModal");
    if (!el) return;

    const w = window as any;
    const Modal = w?.bootstrap?.Modal;
    if (Modal) {
      const instance = Modal.getInstance(el) || new Modal(el);
      instance.hide();
    } else {
      el.classList.remove("show");
      el.setAttribute("aria-hidden", "true");
      (el as any).style.display = "none";
      document.body.classList.remove("modal-open");
      document.querySelectorAll(".modal-backdrop").forEach((b) => b.remove());
    }
  }

  function cleanupModalScrollLock() {
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
    document.querySelectorAll(".modal-backdrop").forEach((b) => b.remove());
  }

  function handleOpenDetailsFromModal() {
    if (!qrApartmentId) return;
    closeQrModal();
    cleanupModalScrollLock();
    navigate(`/apartments/${qrApartmentId}`);
  }

  return (
    <div className="apL">
      <header className="apL-header">
        <div>
          <div className="apL-kicker">Portfolio</div>
          <h1 className="apL-title">Appartements</h1>
          <p className="apL-subtitle">
            Organisez, partagez et gérez vos designs d’appartements.
          </p>
        </div>

        <div className="apL-headerActions">
          {canEdit && (
            <Link to="/apartments/new" className="apL-btn apL-btnPrimary">
              + Nouvel appartement
            </Link>
          )}
        </div>
      </header>

      {loading && <div className="apL-muted">Chargement…</div>}

      {error && (
        <div className="apL-alert">
          <div>
            <div className="apL-alertTitle">Impossible de charger les appartements</div>
            <div className="apL-alertText">{error}</div>
          </div>
          <button onClick={loadApartments} className="apL-btn apL-btnGhost">
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && apartments.length === 0 && (
        <div className="apL-empty">
          <div className="apL-emptyCard">
            <div className="apL-emptyTitle">Aucun appartement pour le moment</div>
            <div className="apL-emptyText">
              Créez votre premier appartement pour commencer à partager avec vos clients.
            </div>
            <Link to="/apartments/new" className="apL-btn apL-btnPrimary">
              Créer un appartement
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && apartments.length > 0 && (
        <section className="apL-grid">
          {apartments.map((apt) => (
            <article key={apt.id} className="apL-card">
              <div className="apL-media">
                <img
                  className="apL-mediaImg"
                  src={apt.imageUrl || FALLBACK_IMG}
                  alt={apt.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                  }}
                />
              </div>

              <div className="apL-cardTop">
                <div className="apL-cardTitle">{apt.title}</div>
                <div className="apL-badge">Appartement</div>
              </div>

              <div className="apL-cardMeta">
                <span className="apL-dot" />
                <span className="apL-metaText">Prêt à être partagé via QR</span>
              </div>

              <div className="apL-cardActions">
                <Link to={`/apartments/${apt.id}`} className="apL-btn apL-btnGhost">
                  Voir les détails
                </Link>

                <button
                  className="apL-btn apL-btnGhost"
                  data-bs-toggle="modal"
                  data-bs-target="#qrModal"
                  onClick={() => setQrApartmentId(apt.id)}
                >
                  Afficher le QR
                </button>

                {canEdit && (
                  <button className="apL-btn apL-btnDanger" onClick={() => handleDelete(apt.id)}>
                    Supprimer
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="modal fade" id="qrModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content apL-modal">
            <div className="modal-header apL-modalHeader">
              <div>
                <div className="apL-kicker">Partager</div>
                <h5 className="modal-title apL-modalTitle">QR Code de l’appartement</h5>
              </div>

              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>

            <div className="modal-body apL-modalBody">
              {!qrApartmentId ? (
                <div className="apL-muted">Chargement…</div>
              ) : (
                <div className="apL-qrWrap">
                  <div className="apL-qrBox">
                    <QRCodeCanvas
                      ref={qrCanvasRef}
                      value={qrValue}
                      size={240}
                      includeMargin
                      level="M"
                    />
                  </div>
                  <div className="apL-qrHint">
                    Scanner ouvre la page de détails de cet appartement.
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer apL-modalFooter">
              <button className="apL-btn apL-btnGhost" data-bs-dismiss="modal">
                Fermer
              </button>

              <button
                className="apL-btn apL-btnGhost"
                onClick={downloadQr}
                disabled={!qrApartmentId}
              >
                Télécharger le QR
              </button>

              <button
                className="apL-btn apL-btnPrimary"
                onClick={handleOpenDetailsFromModal}
                disabled={!qrApartmentId}
              >
                Ouvrir les détails
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
