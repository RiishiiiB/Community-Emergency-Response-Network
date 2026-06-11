import { AlertCircle, CheckCircle2, Radio, Search, ShieldCheck, Siren } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { apiRequest, SOCKET_URL } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import AlertCard from "./AlertCard.jsx";
import ErrorBanner from "./ErrorBanner.jsx";
import SOSPanel from "./SOSPanel.jsx";
import { AlertSkeletonList } from "./Skeletons.jsx";
import StatCard from "./StatCard.jsx";

const filterOptions = ["all", "active", "acknowledged", "resolved"];

function upsertAlert(alerts, nextAlert) {
  const exists = alerts.some((alert) => alert._id === nextAlert._id);

  if (!exists) {
    return [nextAlert, ...alerts];
  }

  return alerts.map((alert) => (alert._id === nextAlert._id ? nextAlert : alert));
}

export default function Dashboard() {
  const { token, user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ active: 0, acknowledged: 0, resolved: 0, total: 0 });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [busyAlertId, setBusyAlertId] = useState("");
  const [error, setError] = useState("");
  const [liveState, setLiveState] = useState("connecting");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        status: filter,
        search
      }).toString();
      const [alertData, statData] = await Promise.all([
        apiRequest(`/alerts?${query}`, { token }),
        apiRequest("/alerts/stats", { token })
      ]);

      setAlerts(alertData.alerts);
      setStats(statData.stats);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search, token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => setLiveState("live"));
    socket.on("connect_error", () => setLiveState("offline"));
    socket.on("disconnect", () => setLiveState("offline"));
    socket.on("alert:new", ({ alert }) => {
      setAlerts((currentAlerts) => upsertAlert(currentAlerts, alert));
      fetchDashboard();
    });
    socket.on("alert:update", ({ alert }) => {
      setAlerts((currentAlerts) => upsertAlert(currentAlerts, alert));
      fetchDashboard();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchDashboard, token]);

  const sortedAlerts = useMemo(() => {
    const statusOrder = { active: 0, acknowledged: 1, resolved: 2 };

    return [...alerts].sort((first, second) => {
      const statusDiff = statusOrder[first.status] - statusOrder[second.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(second.createdAt) - new Date(first.createdAt);
    });
  }, [alerts]);

  async function createAlert(payload) {
    setSending(true);
    setError("");

    try {
      const data = await apiRequest("/alerts", {
        method: "POST",
        token,
        body: payload
      });
      setAlerts((currentAlerts) => upsertAlert(currentAlerts, data.alert));
      fetchDashboard();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSending(false);
    }
  }

  async function acknowledgeAlert(alertId) {
    setBusyAlertId(alertId);
    setError("");

    try {
      const data = await apiRequest(`/alerts/${alertId}/acknowledge`, {
        method: "PATCH",
        token
      });
      setAlerts((currentAlerts) => upsertAlert(currentAlerts, data.alert));
      fetchDashboard();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyAlertId("");
    }
  }

  async function resolveAlert(alertId) {
    setBusyAlertId(alertId);
    setError("");

    try {
      const data = await apiRequest(`/alerts/${alertId}/resolve`, {
        method: "PATCH",
        token,
        body: { note: "Emergency handled by responder" }
      });
      setAlerts((currentAlerts) => upsertAlert(currentAlerts, data.alert));
      fetchDashboard();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyAlertId("");
    }
  }

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Realtime command center</span>
          <h1>Emergency support and response</h1>
        </div>
        <div className={`live-indicator ${liveState}`}>
          <Radio size={16} aria-hidden="true" />
          <span>{liveState}</span>
        </div>
      </section>

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      <section className="stat-grid" aria-label="Alert summary">
        <StatCard icon={Siren} label="Active" value={stats.active} tone="danger" />
        <StatCard icon={ShieldCheck} label="Acknowledged" value={stats.acknowledged} tone="warning" />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} tone="success" />
        <StatCard icon={AlertCircle} label="Total" value={stats.total} />
      </section>

      <div className="dashboard-grid">
        <div className="side-console">
          <SOSPanel onCreateAlert={createAlert} sending={sending} />
          <section className="responder-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Responder console</span>
                <h2>Open queue</h2>
              </div>
              <ShieldCheck size={26} aria-hidden="true" />
            </div>
            <p className="panel-note">
              Every signed-in user can accept unassigned alerts, resolve incidents, and stay synced in realtime.
            </p>
          </section>
        </div>

        <section className="alerts-panel">
          <div className="toolbar">
            <div className="segmented-control compact-control">
              {filterOptions.map((option) => (
                <button
                  className={filter === option ? "active" : ""}
                  type="button"
                  key={option}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <label className="search-field">
              <Search size={16} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search alerts"
              />
            </label>
          </div>

          {loading ? (
            <AlertSkeletonList />
          ) : sortedAlerts.length ? (
            <div className="alert-list">
              {sortedAlerts.map((alert) => (
                <AlertCard
                  alert={alert}
                  busy={busyAlertId === alert._id}
                  key={alert._id}
                  onAcknowledge={acknowledgeAlert}
                  onResolve={resolveAlert}
                  user={user}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Siren size={34} aria-hidden="true" />
              <strong>No alerts found</strong>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
