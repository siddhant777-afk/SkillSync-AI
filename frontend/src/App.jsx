import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { warmUpBackend } from "./services/api";

function App() {
  useEffect(() => {
    // Silently pre-warm backend so cold starts wake up early
    warmUpBackend();
  }, []);

  return <AppRoutes />;
}

export default App;