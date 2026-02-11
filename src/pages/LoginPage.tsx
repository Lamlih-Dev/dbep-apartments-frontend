import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../auth";
import "./LoginPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/apartments";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        setError("E-mail ou mot de passe invalide.");
        setLoading(false);
        return;
      }

      const data = (await res.json()) as { token?: string };

      if (!data.token) {
        setError("Connexion réussie, mais le token est manquant.");
        setLoading(false);
        return;
      }

      setToken(data.token);
      navigate(from, { replace: true });
    } catch (e: any) {
      setError(e?.message ?? "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lg">
      <div className="lg-card">
        <div className="lg-head">
          <div className="lg-kicker">Admin</div>
          <h1 className="lg-title">Connexion</h1>
          <p className="lg-subtitle">Accédez aux contrôles avancés pour gérer les appartements.</p>
        </div>

        {error && (
          <div className="lg-alert">
            <div className="lg-alertTitle">Échec de la connexion</div>
            <div className="lg-alertText">{error}</div>
          </div>
        )}

        <form className="lg-form" onSubmit={handleSubmit}>
          <label className="lg-label">
            E-mail
            <input
              className="lg-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="lg-label">
            Mot de passe
            <input
              className="lg-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <button className="lg-btn" type="submit" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>

          <div className="lg-foot">
            <Link to="/apartments" className="lg-link">
              Continuer en tant que visiteur →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
