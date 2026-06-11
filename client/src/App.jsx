import { Activity } from "lucide-react";
import AuthPanel from "./components/AuthPanel.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Navbar from "./components/Navbar.jsx";
import { PageSkeleton } from "./components/Skeletons.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { booting, user } = useAuth();

  if (booting) {
    return (
      <main className="app-shell">
        <div className="boot-screen">
          <Activity className="spin" aria-hidden="true" />
          <PageSkeleton />
        </div>
      </main>
    );
  }

  if (!user) {
    return <AuthPanel />;
  }

  return (
    <main className="app-shell">
      <Navbar />
      <Dashboard />
    </main>
  );
}
