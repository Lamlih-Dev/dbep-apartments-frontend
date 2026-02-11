import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAdmin, isLoggedIn } from "../auth";
import { apiFetch } from "../api";
import "./AdminActionsCard.css";

export default function AdminActionsCard({
  apartmentId,
}: {
  apartmentId: string;
}) {
  const navigate = useNavigate();
  const logged = isLoggedIn();
  const admin = isAdmin();
  const location = useLocation();

  async function handleDelete() {
    if (!confirm("Supprimer définitivement cet appartement ?")) return;

    const res = await apiFetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/apartments/${apartmentId}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      alert("Échec de la suppression.");
      return;
    }

    navigate("/apartments");
  }

  return (
    <div className="admCard">
      <div className="admTop">
        <div>
          <div className="admKicker">Administration</div>
          <div className="admTitle">Actions administrateur</div>
          <div className="admSub">
            {admin
              ? "Vous avez un accès administrateur."
              : logged
              ? "Vous êtes connecté, mais vous n’avez pas les autorisations nécessaires."
              : "Connectez-vous pour modifier cet appartement et accéder aux outils avancés."}
          </div>
        </div>

        {!admin && <div className="admBadge">Verrouillé</div>}
      </div>

      <div className="admBody">
        {admin ? (
          <div className="admActions">
            <Link
              to={`/apartments/${apartmentId}/edit`}
              className="admBtn admBtnPrimary"
            >
              Modifier les détails
            </Link>

            <button
              onClick={handleDelete}
              className="admBtn admBtnDanger"
            >
              Supprimer l’appartement
            </button>
          </div>
        ) : (
          <div className="admLocked">
            <div className="admLockedText">
              Cette section est réservée aux administrateurs.
            </div>

            {!logged ? (
              <Link to="/login" className="admBtn admBtnPrimary" state={{ from: location }}>
                Se connecter
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
