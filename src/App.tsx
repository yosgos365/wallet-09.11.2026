import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return null; // Let AuthProvider handle loading space

  return user ? <Dashboard /> : <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}
