import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "./ApartmentDetailsPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const DETAILS_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL
  ? `${import.meta.env.VITE_FRONTEND_BASE_URL}/apartments/`
  : "http://localhost:5173/apartments/";

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

type Review = {
  id: string;
  name: string;
  role: string;
  rating: number; // 1..5
  date: string;
  text: string;
};

function formatMoney(value: number | null) {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value}`;
  }
}

function clampRating(n: number) {
  return Math.max(1, Math.min(5, Math.round(n)));
}

function Stars({ rating }: { rating: number }) {
  const r = clampRating(rating);
  return (
    <div className="aptD-stars" aria-label={`${r} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < r ? "aptD-star aptD-starOn" : "aptD-star"}>
          ★
        </span>
      ))}
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function avgRating(reviews: Review[]) {
  if (!reviews.length) return 0;
  const s = reviews.reduce((acc, r) => acc + r.rating, 0);
  return s / reviews.length;
}

export default function ApartmentDetailsPage() {
  const { id } = useParams();

  const [apt, setApt] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  // Demo reviews (replace later with API)
  const demoReviews: Review[] = useMemo(
    () => [
      {
        id: "r1",
        name: "Salma Bennani",
        role: "Interior Designer",
        rating: 5,
        date: "2026-01-14",
        text: "Beautifully balanced layout. The lighting and materials feel premium, and the flow is perfect for client walkthroughs.",
      },
      {
        id: "r2",
        name: "Youssef El Amrani",
        role: "Architect",
        rating: 4,
        date: "2026-01-08",
        text: "Clean geometry and strong proportions. I'd add a bit more storage detail, but overall it’s a very solid design.",
      },
      {
        id: "r3",
        name: "Nora Lahlou",
        role: "Property Stylist",
        rating: 5,
        date: "2025-12-22",
        text: "Perfect for showcasing. Great hero image, and the QR share is super convenient for clients on-site.",
      },
    ],
    []
  );

  const shareUrl = useMemo(() => (id ? `${DETAILS_BASE_URL}${id}` : ""), [id]);

  // Map embed (no API key): uses address if available, else falls back to city
  const mapQuery = useMemo(() => {
    const q = apt?.address?.trim() || "Casablanca, Morocco";
    return encodeURIComponent(q);
  }, [apt?.address]);

  const mapEmbedUrl = useMemo(() => {
    // Works without an API key in most cases; great for demo/prototypes.
    return `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  }, [mapQuery]);

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

  function downloadQr() {
    const canvas = qrCanvasRef.current;
    if (!canvas || !apt) return;

    const a = document.createElement("a");
    a.download = `${apt.title?.trim()?.replace(/\s+/g, "-").toLowerCase() || "apartment"}-qr.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }

  if (!id) return <div>Missing id</div>;
  if (loading) return <div className="text-muted">Loading…</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (notFound) return <div className="alert alert-danger">Apartment not found</div>;
  if (!apt) return <div className="alert alert-danger">Something went wrong</div>;

  const rating = avgRating(demoReviews);
  const ratingRounded = Math.round(rating * 10) / 10;

  return (
    <div className="aptD">
      {/* Top bar */}
      <div className="aptD-top">
        <div className="aptD-breadcrumb">
          <Link to="/apartments" className="aptD-linkMuted">
            Apartments
          </Link>
          <span className="aptD-dot">•</span>
          <span className="aptD-current">Details</span>
        </div>

        <div className="aptD-actions">
          <Link to={`/apartments/${id}/edit`} className="aptD-btn aptD-btnGhost">
            Update
          </Link>
          <Link to="/apartments" className="aptD-btn aptD-btnPrimary">
            Back to list
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="aptD-hero">
        <div className="aptD-heroMedia">
          {apt.imageUrl ? (
            <img className="aptD-heroImg" src={apt.imageUrl} alt={apt.title} />
          ) : (
            <div className="aptD-heroPlaceholder">
              <div className="aptD-heroPlaceholderInner">
                <div className="aptD-heroPlaceholderTitle">No image</div>
                <div className="aptD-heroPlaceholderSub">Add one to elevate the listing.</div>
              </div>
            </div>
          )}
        </div>

        <div className="aptD-heroPanel">
          <div className="aptD-kicker">Apartment</div>

          <h1 className="aptD-title">{apt.title}</h1>

          {apt.address ? (
            <div className="aptD-address">{apt.address}</div>
          ) : (
            <div className="aptD-address aptD-muted">No address provided</div>
          )}

          <div className="aptD-metaRow">
            <div className="aptD-chip">
              <span className="aptD-chipLabel">Surface</span>
              <span className="aptD-chipValue">{apt.surface ?? "—"} m²</span>
            </div>

            <div className="aptD-chip">
              <span className="aptD-chipLabel">Rooms</span>
              <span className="aptD-chipValue">{apt.rooms ?? "—"}</span>
            </div>

            <div className="aptD-chip">
              <span className="aptD-chipLabel">Rating</span>
              <span className="aptD-chipValue">{ratingRounded || "—"}/5</span>
            </div>
          </div>

          <div className="aptD-priceCard">
            <div>
              <div className="aptD-priceLabel">Price / night</div>
              <div className="aptD-priceValue">{formatMoney(apt.pricePerNight)}</div>
            </div>

            <div className="aptD-priceBadge">Premium</div>
          </div>

          {/* Optional: keep UUID subtle */}
          <details className="aptD-details">
            <summary className="aptD-detailsSummary">Technical details</summary>
            <div className="aptD-detailsBody">
              <div className="aptD-row">
                <span className="aptD-rowKey">UUID</span>
                <span className="aptD-rowVal">{apt.id}</span>
              </div>
              <div className="aptD-row">
                <span className="aptD-rowKey">Share URL</span>
                <span className="aptD-rowVal">{shareUrl}</span>
              </div>
            </div>
          </details>
        </div>
      </section>

      {/* Content grid */}
      <section className="aptD-grid">
        {/* Left column */}
        <div className="aptD-leftCol">
          {/* Description */}
          <article className="aptD-card">
            <div className="aptD-cardHeader">
              <div>
                <div className="aptD-cardKicker">Overview</div>
                <h2 className="aptD-cardTitle">Description</h2>
              </div>
            </div>

            <div className="aptD-cardBody">
              {apt.description ? (
                <p className="aptD-paragraph">{apt.description}</p>
              ) : (
                <div className="aptD-muted">No description yet.</div>
              )}
            </div>
          </article>

          {/* Reviews (avis) */}
          <article className="aptD-card">
            <div className="aptD-cardHeader aptD-cardHeaderRow">
              <div>
                <div className="aptD-cardKicker">Avis</div>
                <h2 className="aptD-cardTitle">Reviews</h2>
              </div>

              <div className="aptD-ratingPill" title="Demo rating">
                <Stars rating={ratingRounded || 5} />
                <span className="aptD-ratingText">{ratingRounded || "5.0"}</span>
                <span className="aptD-ratingCount">({demoReviews.length})</span>
              </div>
            </div>

            <div className="aptD-cardBody">
              <div className="aptD-reviews">
                {demoReviews.map((r) => (
                  <div key={r.id} className="aptD-review">
                    <div className="aptD-avatar" aria-hidden="true">
                      {initials(r.name)}
                    </div>

                    <div className="aptD-reviewMain">
                      <div className="aptD-reviewTop">
                        <div className="aptD-reviewName">{r.name}</div>
                        <div className="aptD-reviewMeta">
                          <span className="aptD-muted">{r.role}</span>
                          <span className="aptD-dotSm">•</span>
                          <span className="aptD-muted">{r.date}</span>
                        </div>
                      </div>

                      <div className="aptD-reviewStars">
                        <Stars rating={r.rating} />
                      </div>

                      <div className="aptD-reviewText">{r.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Map */}
          <article className="aptD-card">
            <div className="aptD-cardHeader">
              <div>
                <div className="aptD-cardKicker">Location</div>
                <h2 className="aptD-cardTitle">Map</h2>
              </div>
            </div>

            <div className="aptD-cardBody">
              <div className="aptD-mapWrap">
                <iframe
                  title="Apartment location map"
                  src={mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="aptD-mapFooter">
                <div className="aptD-muted">
                  {apt.address ? apt.address : "No address — showing demo location."}
                </div>

                <a
                  className="aptD-btn aptD-btnGhost"
                  href={`https://www.google.com/maps?q=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </article>
        </div>

        {/* Right column: share/QR */}
        <aside className="aptD-card aptD-cardSticky">
          <div className="aptD-cardHeader">
            <div>
              <div className="aptD-cardKicker">Share</div>
              <h2 className="aptD-cardTitle">QR Code</h2>
            </div>
          </div>

          <div className="aptD-cardBody">
            <div className="aptD-qrBox">
              <QRCodeCanvas
                ref={qrCanvasRef}
                value={shareUrl}
                size={220}
                includeMargin
                level="M"
              />
            </div>

            <div className="aptD-shareActions">
              <button className="aptD-btn aptD-btnPrimary aptD-btnWide" onClick={downloadQr}>
                Download QR
              </button>

              <button className="aptD-btn aptD-btnGhost aptD-btnWide" onClick={copyLink}>
                {copied ? "Copied ✓" : "Copy link"}
              </button>
            </div>

            <div className="aptD-footnote">
              Share with clients by QR or link. Great for visits & presentations.
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
