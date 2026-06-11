import { LogOut, Moon, ShieldAlert, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navbar() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-mark">
          <ShieldAlert size={22} aria-hidden="true" />
        </span>
        <div>
          <strong>Emergency SOS</strong>
          <span>{user.role}</span>
        </div>
      </div>

      <nav className="nav-actions" aria-label="User actions">
        <span className="user-chip">{user.name}</span>
        <button className="icon-button" type="button" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="icon-button danger" type="button" onClick={logout} title="Sign out">
          <LogOut size={18} />
        </button>
      </nav>
    </header>
  );
}
