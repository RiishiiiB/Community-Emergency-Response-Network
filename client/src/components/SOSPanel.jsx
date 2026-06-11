import { Crosshair, Loader2, MapPin, Siren } from "lucide-react";
import { useState } from "react";

const initialForm = {
  title: "Emergency SOS",
  type: "medical",
  severity: "critical",
  description: "",
  address: ""
};

function getBrowserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy)
        });
      },
      () => resolve({}),
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );
  });
}

export default function SOSPanel({ onCreateAlert, sending }) {
  const [form, setForm] = useState(initialForm);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function submitAlert(event) {
    event.preventDefault();
    const coordinates = await getBrowserLocation();

    await onCreateAlert({
      title: form.title,
      type: form.type,
      severity: form.severity,
      description: form.description,
      location: {
        address: form.address,
        ...coordinates
      }
    });

    setForm(initialForm);
  }

  return (
    <section className="sos-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Citizen console</span>
          <h2>Send SOS</h2>
        </div>
        <Siren size={26} aria-hidden="true" />
      </div>

      <form className="sos-form" onSubmit={submitAlert}>
        <div className="form-row">
          <label>
            Emergency type
            <select name="type" value={form.type} onChange={updateField}>
              <option value="medical">Medical</option>
              <option value="fire">Fire</option>
              <option value="crime">Crime</option>
              <option value="accident">Accident</option>
              <option value="disaster">Disaster</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Severity
            <select name="severity" value={form.severity} onChange={updateField}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>

        <label>
          Title
          <input name="title" value={form.title} onChange={updateField} required />
        </label>

        <label>
          Location
          <div className="input-with-icon">
            <MapPin size={16} aria-hidden="true" />
            <input
              name="address"
              value={form.address}
              onChange={updateField}
              placeholder="Street, building, landmark"
            />
          </div>
        </label>

        <label>
          Details
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            rows="4"
            placeholder="What happened?"
          />
        </label>

        <button className="sos-button" type="submit" disabled={sending}>
          {sending ? <Loader2 className="spin" size={22} /> : <Crosshair size={22} />}
          <span>{sending ? "Sending..." : "Trigger SOS"}</span>
        </button>
      </form>
    </section>
  );
}
