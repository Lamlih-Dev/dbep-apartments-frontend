import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

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

    const payload = {
      title,
      address: address || null,
      surface: surface ? Number(surface) : null,
      rooms: rooms ? Number(rooms) : null,
      pricePerNight: pricePerNight ? Number(pricePerNight) : null,
      description: description || null,
      imageUrl: imageUrl || null,
    };

    const res = await fetch(`${API_BASE_URL}/api/apartments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      alert("Update failed");
      return;
    }

    navigate(`/apartments/${id}`);
  }

  if (!id) return <div>Missing id</div>;

  if (loading) return <div className="text-muted">Loading…</div>;

  if (error) return <div className="alert alert-danger">{error}</div>;

  if (notFound) return <div className="alert alert-danger">Apartment not found</div>;

  return (
    <div>
      <div className="page-title">
        <h2 className="m-0">Update apartment</h2>
        <Link to={`/apartments/${id}`} className="btn btn-outline-secondary">
          Back
        </Link>
      </div>

      <form className="card p-3" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <input
            className="form-control"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label">Surface (m²)</label>
            <input
              className="form-control"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Rooms</label>
            <input
              className="form-control"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Price / night</label>
            <input
              className="form-control"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Image URL (temporary)</label>
          <input
            className="form-control"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
