import { Ambulance, Eye, EyeOff, Moon, ShieldAlert, Sun } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ErrorBanner from "./ErrorBanner.jsx";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "citizen",
  guardianName: "",
  guardianPhone: ""
};

export default function AuthPanel() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: form.role,
          guardians:
            form.guardianName || form.guardianPhone
              ? [
                  {
                    name: form.guardianName,
                    phone: form.guardianPhone,
                    relationship: "Emergency contact"
                  }
                ]
              : []
        });
      } else {
        await login({
          email: form.email,
          password: form.password
        });
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-visual" aria-label="Emergency SOS">
        <div className="auth-emblem">
          <ShieldAlert size={64} aria-hidden="true" />
        </div>
        <div>
          <span className="eyebrow">Live dispatch</span>
          <h1>Emergency SOS</h1>
          <p>Secure access for citizens, responders, and command staff.</p>
        </div>
      </section>

      <section className="auth-card" aria-label={isSignup ? "Create account" : "Sign in"}>
        <div className="auth-card-header">
          <div>
            <Ambulance size={24} aria-hidden="true" />
            <h2>{isSignup ? "Create account" : "Welcome back"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="segmented-control">
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            type="button"
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <ErrorBanner message={error} onDismiss={() => setError("")} />

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup ? (
            <>
              <label>
                Name
                <input name="name" value={form.name} onChange={updateField} required />
              </label>
              <label>
                Role
                <select name="role" value={form.role} onChange={updateField}>
                  <option value="citizen">Citizen</option>
                  <option value="responder">Responder</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </>
          ) : null}

          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
                minLength={6}
                required
              />
              <button
                className="icon-button ghost"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {isSignup ? (
            <>
              <label>
                Phone
                <input name="phone" value={form.phone} onChange={updateField} />
              </label>
              <div className="form-row">
                <label>
                  Guardian
                  <input name="guardianName" value={form.guardianName} onChange={updateField} />
                </label>
                <label>
                  Guardian phone
                  <input name="guardianPhone" value={form.guardianPhone} onChange={updateField} />
                </label>
              </div>
            </>
          ) : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
