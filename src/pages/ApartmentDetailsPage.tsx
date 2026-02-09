import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const DETAILS_BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/apartments` : "http://localhost:5173/apartments/";

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

export default function ApartmentDetailsPage() {
  const { id } = useParams();

  const [apt, setApt] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrValue = useMemo(() => (id ? `${DETAILS_BASE_URL}${id}` : ""), [id]);

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
          setApt(null);
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          setApt(null);
          setError(`Request failed (HTTP ${res.status})`);
          return;
        }

        const data = (await res.json()) as Apartment;
        setApt(data);
      } catch (e: any) {
        if (!cancelled) {
          setApt(null);
          setError(e?.message ?? "Network error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return <div>Missing id</div>;

  if (loading) return <div className="text-muted">Loading…</div>;

  if (error) return <div className="alert alert-danger">{error}</div>;

  if (notFound) return <div className="alert alert-danger">Apartment not found</div>;

  if (!apt) return <div className="alert alert-danger">Something went wrong</div>;

  return (
    <div>
      <div className="page-title">
        <h2 className="m-0">{apt.title}</h2>
        <Link to={`/apartments/${id}/edit`} className="btn btn-outline-primary">
          Update
        </Link>
      </div>

      <div className="card p-3">
        <div className="row g-4">
          <div className="col-md-7">
            <div className="mb-2">
              <span className="fw-bold">UUID:</span> {apt.id}
            </div>

            {apt.address && (
              <div className="mb-2">
                <span className="fw-bold">Address:</span> {apt.address}
              </div>
            )}

            <div className="mb-2">
              <span className="fw-bold">Surface:</span> {apt.surface ?? "-"} m²
            </div>

            <div className="mb-2">
              <span className="fw-bold">Rooms:</span> {apt.rooms ?? "-"}
            </div>

            <div className="mb-2">
              <span className="fw-bold">Price/night:</span> {apt.pricePerNight ?? "-"}
            </div>

            {apt.description && (
              <div className="mt-3">
                <div className="fw-bold">Description</div>
                <div className="text-muted">{apt.description}</div>
              </div>
            )}

            {apt.imageUrl && (
              <div className="mt-3">
                <div className="fw-bold">Image</div>
                <img
                  src={apt.imageUrl}
                  alt="apartment"
                  style={{ maxWidth: "100%", borderRadius: 12 }}
                />
              </div>
            )}
          </div>

          <div className="col-md-5 d-flex flex-column align-items-center">
            <div className="fw-bold mb-2">QR Code</div>
            <QRCodeCanvas value={qrValue} size={240} includeMargin level="M" />
            <div className="small text-muted mt-2 text-break text-center">
              {qrValue}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
