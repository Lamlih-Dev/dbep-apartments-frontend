import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      address: address || null,
      surface: surface ? Number(surface) : null,
      rooms: rooms ? Number(rooms) : null,
      pricePerNight: pricePerNight ? Number(pricePerNight) : null,
      description: description || null,
      imageUrl: imageUrl || null,
    };

    const res = await fetch(`${API_BASE_URL}/api/apartments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Create failed");
      return;
    }

    const created = await res.json();
    navigate(`/apartments/${created.id}`);
  }

  return (
    <div>
      <div className="page-title">
        <h2 className="m-0">Create apartment</h2>
      </div>

      <form className="card p-3" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <input className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label">Surface (m²)</label>
            <input className="form-control" value={surface} onChange={(e) => setSurface(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Rooms</label>
            <input className="form-control" value={rooms} onChange={(e) => setRooms(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Price / night</label>
            <input className="form-control" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Image URL (temporary)</label>
          <input className="form-control" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
