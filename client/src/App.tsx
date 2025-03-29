import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Appointments from "@/pages/appointments";
import Staff from "@/pages/staff";
import Clients from "@/pages/clients";
import Settings from "@/pages/settings";
import { useAuth, AuthProvider } from "./context/auth-context";
import { ThemeProvider } from "./context/theme-context";
import { CalendarProvider } from "./context/calendar-context";
import { Loader2 } from "lucide-react";

function PrivateRoute({ component: Component, ...rest }: { component: React.ComponentType<any>; path: string }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    window.location.href = "/login";
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {(params) => <PrivateRoute component={Dashboard} path="/" />}
      </Route>
      <Route path="/calendar">
        {(params) => <PrivateRoute component={Calendar} path="/calendar" />}
      </Route>
      <Route path="/appointments">
        {(params) => <PrivateRoute component={Appointments} path="/appointments" />}
      </Route>
      <Route path="/staff">
        {(params) => <PrivateRoute component={Staff} path="/staff" />}
      </Route>
      <Route path="/clients">
        {(params) => <PrivateRoute component={Clients} path="/clients" />}
      </Route>
      <Route path="/settings">
        {(params) => <PrivateRoute component={Settings} path="/settings" />}
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CalendarProvider>
          <QueryClientProvider client={queryClient}>
            <Router />
            <Toaster />
          </QueryClientProvider>
        </CalendarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
