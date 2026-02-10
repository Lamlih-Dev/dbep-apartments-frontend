import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ApartmentCreatePage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export default function ApartmentCreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [surface, setSurface] = useState<string>("");
  const [rooms, setRooms] = useState<string>("");
  const [pricePerNight, setPricePerNight] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
      setError("Title is required.");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/apartments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Create failed. Please check your inputs and try again.");
      return;
    }

    const created = await res.json();
    navigate(`/apartments/${created.id}`);
  }

  return (
    <div className="apC">
      <div className="apC-top">
        <div>
          <div className="apC-kicker">Portfolio</div>
          <h1 className="apC-title">Create apartment</h1>
          <p className="apC-subtitle">Add a new apartment design to your collection.</p>
        </div>

        <div className="apC-actions">
          <Link to="/apartments" className="apC-btn apC-btnGhost">
            Back
          </Link>
          <button
            className="apC-btn apC-btnPrimary"
            type="submit"
            form="createApartmentForm"
            disabled={loading}
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>

      {error && (
        <div className="apC-alert">
          <div>
            <div className="apC-alertTitle">Something went wrong</div>
            <div className="apC-alertText">{error}</div>
          </div>
        </div>
      )}

      <div className="apC-grid">
        {/* Form */}
        <form
          id="createApartmentForm"
          className="apC-card"
          onSubmit={handleSubmit}
        >
          <div className="apC-cardHeader">
            <div>
              <div className="apC-cardKicker">Details</div>
              <h2 className="apC-cardTitle">Apartment information</h2>
            </div>
          </div>

          <div className="apC-cardBody">
            <div className="apC-row">
              <div className="apC-field apC-fieldFull">
                <label className="apC-label">
                  Title <span className="apC-required">*</span>
                </label>
                <input
                  className="apC-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Veloura Residences"
                  required
                />
                <div className="apC-help">A clear name for designers and clients.</div>
              </div>

              <div className="apC-field apC-fieldFull">
                <label className="apC-label">Address</label>
                <input
                  className="apC-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Casablanca, Morocco"
                />
              </div>

              <div className="apC-field">
                <label className="apC-label">Surface (m²)</label>
                <input
                  className="apC-input"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="e.g. 92"
                  inputMode="decimal"
                />
              </div>

              <div className="apC-field">
                <label className="apC-label">Rooms</label>
                <input
                  className="apC-input"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="e.g. 3"
                  inputMode="numeric"
                />
              </div>

              <div className="apC-field">
                <label className="apC-label">Price / night</label>
                <input
                  className="apC-input"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="e.g. 300"
                  inputMode="decimal"
                />
              </div>

              <div className="apC-field apC-fieldFull">
                <label className="apC-label">Description</label>
                <textarea
                  className="apC-textarea"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a short designer-friendly description…"
                />
              </div>

              <div className="apC-field apC-fieldFull">
                <label className="apC-label">Image URL</label>
                <input
                  className="apC-input"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                <div className="apC-help">
                  Temporary: paste an image URL. Later we can add upload.
                </div>
              </div>
            </div>

            <div className="apC-footerRow">
              <Link to="/apartments" className="apC-btn apC-btnGhost">
                Cancel
              </Link>

              <button className="apC-btn apC-btnPrimary" type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create apartment"}
              </button>
            </div>
          </div>
        </form>

        {/* Preview */}
        <aside className="apC-card apC-sticky">
          <div className="apC-cardHeader">
            <div>
              <div className="apC-cardKicker">Preview</div>
              <h2 className="apC-cardTitle">Cover image</h2>
            </div>
          </div>

          <div className="apC-cardBody">
            <div className="apC-preview">
              {imagePreview ? (
                <img
                  className="apC-previewImg"
                  src={imagePreview}
                  alt="Preview"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="apC-previewEmpty">
                  <div className="apC-previewEmptyTitle">No image yet</div>
                  <div className="apC-previewEmptyText">
                    Add an image URL to preview the cover.
                  </div>
                </div>
              )}
            </div>

            <div className="apC-mini">
              <div className="apC-miniKicker">Tip</div>
              <div className="apC-miniText">
                Use a wide photo (landscape) to match the premium layout.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
