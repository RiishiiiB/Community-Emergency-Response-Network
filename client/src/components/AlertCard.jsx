import {
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  Siren,
  UserRound
} from "lucide-react";
import StatusPill from "./StatusPill.jsx";

const severityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function hasCoordinates(location = {}) {
  return typeof location.lat === "number" && typeof location.lng === "number";
}

export default function AlertCard({
  alert,
  busy,
  onAcknowledge,
  onResolve,
  user
}) {
  const canAcknowledge =
    user?.role !== "citizen" &&
    alert.status === "active" &&
    !alert.assignedResponder;

  const canResolve = alert.status !== "resolved";

  const latestTimeline = [...(alert.timeline || [])]
    .reverse()
    .slice(0, 3);

  const resolvedInfo =
    alert.status === "resolved" &&
    alert.resolvedByUser &&
    alert.resolvedByRole;

  return (
    <article className={`alert-card ${alert.severity}`}>
      <header className="alert-card-header">
        <div>
          <div className="alert-kicker">
            <Siren size={16} aria-hidden="true" />
            <span>{severityLabels[alert.severity] || alert.severity}</span>
            <span>{alert.type}</span>
          </div>
          <h3>{alert.title}</h3>
        </div>

        <StatusPill status={alert.status} />
      </header>

      {alert.description ? (
        <p className="alert-description">
          {alert.description}
        </p>
      ) : null}

      <div className="alert-meta">
        <span>
          <Clock3 size={15} aria-hidden="true" />
          {formatDate(alert.createdAt)}
        </span>

        <span>
          <UserRound size={15} aria-hidden="true" />
          {alert.citizen?.name ||
            alert.contact?.name ||
            "Citizen"}
        </span>

        {alert.contact?.phone || alert.citizen?.phone ? (
          <a
            href={`tel:${
              alert.contact?.phone ||
              alert.citizen?.phone
            }`}
          >
            <Phone size={15} aria-hidden="true" />
            {alert.contact?.phone ||
              alert.citizen?.phone}
          </a>
        ) : null}
      </div>

      <div className="location-row">
        <MapPin size={17} aria-hidden="true" />

        <div>
          <strong>
            {alert.location?.address ||
              "Location pending"}
          </strong>

          {hasCoordinates(alert.location) ? (
            <a
              href={alert.location.mapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              {alert.location.lat.toFixed(4)},{" "}
              {alert.location.lng.toFixed(4)}
            </a>
          ) : (
            <span>No coordinates shared</span>
          )}
        </div>
      </div>

      {resolvedInfo ? (
        <div className="assigned-row">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>
            Resolved by {alert.resolvedByUser} (
            {alert.resolvedByRole})
          </span>
        </div>
      ) : null}

      {alert.assignedResponder ? (
        <div className="assigned-row">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>
            Assigned to {alert.assignedResponder.name}
          </span>
        </div>
      ) : null}

      {latestTimeline.length ? (
        <ol className="timeline">
          {latestTimeline.map((item) => (
            <li key={`${item.status}-${item.at}`}>
              <span />

              <div>
                <strong>{item.message}</strong>

                <small>
                  <span
                    className={`action-chip ${
                      item.action || "note"
                    }`}
                  >
                    {item.action || "note"}
                  </span>

                  {formatDate(item.at)}
                </small>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      {canAcknowledge || canResolve ? (
        <footer className="alert-actions">
          {canAcknowledge ? (
            <button
              className="secondary-button"
              type="button"
              disabled={busy}
              onClick={() =>
                onAcknowledge(alert._id)
              }
            >
              <ShieldCheck
                size={16}
                aria-hidden="true"
              />
              Accept
            </button>
          ) : null}

          {canResolve ? (
            <button
              className="primary-button compact"
              type="button"
              disabled={busy}
              onClick={() =>
                onResolve(alert._id)
              }
            >
              <CheckCircle2
                size={16}
                aria-hidden="true"
              />
              {user?.role === "citizen"
                ? "Mark Safe"
                : "Resolve"}
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}