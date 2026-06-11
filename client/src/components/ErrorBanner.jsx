import { AlertTriangle, X } from "lucide-react";

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert">
      <AlertTriangle size={18} aria-hidden="true" />
      <span>{message}</span>
      {onDismiss ? (
        <button className="icon-button ghost" type="button" onClick={onDismiss} title="Dismiss">
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
