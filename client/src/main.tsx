import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/theme-context";
import { AuthProvider } from "./context/auth-context";
import { CalendarProvider } from "./context/calendar-context";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <CalendarProvider>
        <App />
      </CalendarProvider>
    </AuthProvider>
  </ThemeProvider>
);
