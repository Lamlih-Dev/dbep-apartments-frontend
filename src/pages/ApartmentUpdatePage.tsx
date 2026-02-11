import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isLoggedIn } from "../auth";
import "./ApartmentUpdatePage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

type Apartment = {
  id: string;
  title: string;
  address: string | null;
  surface: number | null;
  rooms: number | null;
  pricePerNight: number | null;
  description: string | null;
  imageUrl: string | null;
};

export default function ApartmentUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [surface, setSurface] = useState<string>("");
  const [rooms, setRooms] = useState<string>("");
  const [pricePerNight, setPricePerNight] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const canEdit = isLoggedIn();

  const imagePreview = useMemo(() => {
    const url = imageUrl.trim();
    if (!url) return null;
    return url;
  }, [imageUrl]);

  function toNumberOrNull(v: string) {
    const s = v.trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/apartments/${id}`);
        if (cancelled) return;

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          setError(`Requête échouée (HTTP ${res.status})`);
          return;
        }

        const apt = (await res.json()) as Apartment;

        setTitle(apt.title ?? "");
        setAddress(apt.address ?? "");
        setSurface(apt.surface !== null && apt.surface !== undefined ? String(apt.surface) : "");
        setRooms(apt.rooms !== null && apt.rooms !== undefined ? String(apt.rooms) : "");
        setPricePerNight(
          apt.pricePerNight !== null && apt.pricePerNight !== undefined
            ? String(apt.pricePerNight)
            : ""
        );
        setDescription(apt.description ?? "");
        setImageUrl(apt.imageUrl ?? "");
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Erreur réseau");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      address: address.trim() || null,
      surface: toNumberOrNull(surface),
      rooms: toNumberOrNull(rooms),
      pricePerNight: toNumberOrNull(pricePerNight),
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
    };

    if (!payload.title) {
      setSaving(false);
      setError("Le titre est obligatoire.");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/apartments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      setError("La mise à jour a échoué. Vérifiez vos informations et réessayez.");
      return;
    }

    navigate(`/apartments/${id}`);
  }

  if (!id) return <div>ID manquant</div>;

  if (!canEdit) {
    return (
      <div className="apU">
        <div className="apU-alert apU-alertDanger">
          Vous devez être connecté pour modifier cet appartement.
        </div>
        <Link to="/login" className="apU-btn apU-btnPrimary">
          Se connecter
        </Link>
      </div>
    );
  }

  if (loading) return <div className="apU-muted">Chargement…</div>;

  if (notFound) return <div className="apU-alert apU-alertDanger">Appartement introuvable</div>;

  return (
    <div className="apU">
      <div className="apU-top">
        <div>
          <div className="apU-kicker">Portfolio</div>
          <h1 className="apU-title">Mettre à jour l'appartement</h1>
          <p className="apU-subtitle">Affinez les détails et gardez une annonce premium.</p>
        </div>

        <div className="apU-actions">
          <Link to={`/apartments/${id}`} className="apU-btn apU-btnGhost">
            Retour
          </Link>
          <button
            className="apU-btn apU-btnPrimary"
            type="submit"
            form="updateApartmentForm"
            disabled={saving}
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {error && (
        <div className="apU-alert">
          <div>
            <div className="apU-alertTitle">Impossible de mettre à jour l'appartement</div>
            <div className="apU-alertText">{error}</div>
          </div>
        </div>
      )}

      <div className="apU-grid">
        <form id="updateApartmentForm" className="apU-card" onSubmit={handleSubmit}>
          <div className="apU-cardHeader">
            <div>
              <div className="apU-cardKicker">Détails</div>
              <h2 className="apU-cardTitle">Informations sur l'appartement</h2>
            </div>
          </div>

          <div className="apU-cardBody">
            <div className="apU-row">
              <div className="apU-field apU-fieldFull">
                <label className="apU-label">
                  Titre <span className="apU-required">*</span>
                </label>
                <input
                  className="apU-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex : Veloura Residences"
                  required
                />
                <div className="apU-help">Un nom clair pour les designers et les clients.</div>
              </div>

              <div className="apU-field apU-fieldFull">
                <label className="apU-label">Adresse</label>
                <input
                  className="apU-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ex : Casablanca, Maroc"
                />
              </div>

              <div className="apU-field">
                <label className="apU-label">Surface (m²)</label>
                <input
                  className="apU-input"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="ex : 92"
                  inputMode="decimal"
                />
              </div>

              <div className="apU-field">
                <label className="apU-label">Pièces</label>
                <input
                  className="apU-input"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="ex : 3"
                  inputMode="numeric"
                />
              </div>

              <div className="apU-field">
                <label className="apU-label">Prix / nuit</label>
                <input
                  className="apU-input"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="ex : 300"
                  inputMode="decimal"
                />
              </div>

              <div className="apU-field apU-fieldFull">
                <label className="apU-label">Description</label>
                <textarea
                  className="apU-textarea"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Rédigez une courte description…"
                />
              </div>

              <div className="apU-field apU-fieldFull">
                <label className="apU-label">URL de l'image</label>
                <input
                  className="apU-input"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                <div className="apU-help">Collez une URL d'image.</div>
              </div>
            </div>

            <div className="apU-footerRow">
              <Link to={`/apartments/${id}`} className="apU-btn apU-btnGhost">
                Annuler
              </Link>

              <button className="apU-btn apU-btnPrimary" type="submit" disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer les modifications"}
              </button>
            </div>
          </div>
        </form>

        <aside className="apU-card apU-sticky">
          <div className="apU-cardHeader">
            <div>
              <div className="apU-cardKicker">Aperçu</div>
              <h2 className="apU-cardTitle">Image de couverture</h2>
            </div>
          </div>

          <div className="apU-cardBody">
            <div className="apU-preview">
              {imagePreview ? (
                <img
                  className="apU-previewImg"
                  src={imagePreview}
                  alt="Aperçu"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="apU-previewEmpty">
                  <div className="apU-previewEmptyTitle">Pas d'image pour l'instant</div>
                  <div className="apU-previewEmptyText">
                    Ajoutez une URL d'image pour prévisualiser la couverture.
                  </div>
                </div>
              )}
            </div>

            <div className="apU-mini">
              <div className="apU-miniKicker">Astuce</div>
              <div className="apU-miniText">
                Utilisez une photo en mode paysage pour correspondre à la mise en page premium.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
