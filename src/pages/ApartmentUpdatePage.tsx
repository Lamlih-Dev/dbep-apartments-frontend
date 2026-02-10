import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

  // form fields
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [surface, setSurface] = useState<string>("");
  const [rooms, setRooms] = useState<string>("");
  const [pricePerNight, setPricePerNight] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

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
          setError(`Request failed (HTTP ${res.status})`);
          return;
        }

        const apt = (await res.json()) as Apartment;

        // Prefill form
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
        if (!cancelled) setError(e?.message ?? "Network error");
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
      setError("Title is required.");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/apartments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Update failed. Please check your inputs and try again.");
      return;
    }

    navigate(`/apartments/${id}`);
  }

  if (!id) return <div>Missing id</div>;

  if (loading) return <div className="apU-muted">Loading…</div>;

  if (error && !saving && notFound === false && loading === false) {
    // keep rendering the page too, but show alert
  }

  if (notFound) return <div className="apU-alert apU-alertDanger">Apartment not found</div>;

  return (
    <div className="apU">
      <div className="apU-top">
        <div>
          <div className="apU-kicker">Portfolio</div>
          <h1 className="apU-title">Update apartment</h1>
          <p className="apU-subtitle">Refine details and keep your listing premium.</p>
        </div>

        <div className="apU-actions">
          <Link to={`/apartments/${id}`} className="apU-btn apU-btnGhost">
            Back
          </Link>
          <button
            className="apU-btn apU-btnPrimary"
            type="submit"
            form="updateApartmentForm"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="apU-alert">
          <div>
            <div className="apU-alertTitle">Couldn’t update apartment</div>
            <div className="apU-alertText">{error}</div>
          </div>
        </div>
      )}

      <div className="apU-grid">
        {/* Form */}
        <form id="updateApartmentForm" className="apU-card" onSubmit={handleSubmit}>
          <div className="apU-cardHeader">
            <div>
              <div className="apU-cardKicker">Details</div>
              <h2 className="apU-cardTitle">Apartment information</h2>
            </div>
          </div>

          <div className="apU-cardBody">
            <div className="apU-row">
              <div className="apU-field apU-fieldFull">
                <label className="apU-label">
                  Title <span className="apU-required">*</span>
                </label>
                <input
                  className="apU-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Veloura Residences"
                  required
                />
                <div className="apU-help">A clear name for designers and clients.</div>
              </div>

              <div className="apU-field apU-fieldFull">
                <label className="apU-label">Address</label>
                <input
                  className="apU-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Casablanca, Morocco"
                />
              </div>

              <div className="apU-field">
                <label className="apU-label">Surface (m²)</label>
                <input
                  className="apU-input"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="e.g. 92"
                  inputMode="decimal"
                />
              </div>

              <div className="apU-field">
                <label className="apU-label">Rooms</label>
                <input
                  className="apU-input"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="e.g. 3"
                  inputMode="numeric"
                />
              </div>

              <div className="apU-field">
                <label className="apU-label">Price / night</label>
                <input
                  className="apU-input"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="e.g. 300"
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
                  placeholder="Write a short designer-friendly description…"
                />
              </div>

              <div className="apU-field apU-fieldFull">
                <label className="apU-label">Image URL</label>
                <input
                  className="apU-input"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                <div className="apU-help">Paste an image URL.</div>
              </div>
            </div>

            <div className="apU-footerRow">
              <Link to={`/apartments/${id}`} className="apU-btn apU-btnGhost">
                Cancel
              </Link>

              <button className="apU-btn apU-btnPrimary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </form>

        {/* Preview */}
        <aside className="apU-card apU-sticky">
          <div className="apU-cardHeader">
            <div>
              <div className="apU-cardKicker">Preview</div>
              <h2 className="apU-cardTitle">Cover image</h2>
            </div>
          </div>

          <div className="apU-cardBody">
            <div className="apU-preview">
              {imagePreview ? (
                <img
                  className="apU-previewImg"
                  src={imagePreview}
                  alt="Preview"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="apU-previewEmpty">
                  <div className="apU-previewEmptyTitle">No image yet</div>
                  <div className="apU-previewEmptyText">
                    Add an image URL to preview the cover.
                  </div>
                </div>
              )}
            </div>

            <div className="apU-mini">
              <div className="apU-miniKicker">Tip</div>
              <div className="apU-miniText">
                Use a wide photo (landscape) to match the premium layout.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
