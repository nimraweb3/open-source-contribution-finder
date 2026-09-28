import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BookmarksProvider } from "./context/BookmarksContext";
import { Navbar, Footer } from "./components/Layout";
import { Button } from "./components/UI";
import Browse from "./pages/Browse";
import Auth from "./pages/Auth";
import { lazy, Suspense } from "react";
const Detail = lazy(() => import("./pages/Detail"));
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  return loading ? (
    <main className="state">Loading your workspace…</main>
  ) : user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} replace />
  );
}
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <BookmarksProvider>
            <a className="skip-link" href="#content">
              Skip to content
            </a>
            <Navbar />
            <div id="content">
              <Routes>
                <Route path="/" element={<Browse />} />
                <Route path="/browse" element={<Browse />} />
                <Route
                  path="/explore"
                  element={<Navigate to="/browse" replace />}
                />
                <Route path="/login" element={<Auth key="login" />} />
                <Route path="/signup" element={<Auth key="signup" signup />} />
                <Route
                  path="/issues/:id"
                  element={
                    <Suspense
                      fallback={
                        <main className="state" role="status">
                          Loading issue…
                        </main>
                      }
                    >
                      <Detail />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Protected>
                      <Dashboard />
                    </Protected>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Protected>
                      <Profile />
                    </Protected>
                  }
                />
                <Route
                  path="*"
                  element={
                    <main className="container not-found">
                      <div className="eyebrow">404</div>
                      <h1>Page not found</h1>
                      <p>The page may have moved, or the link is incorrect.</p>
                      <Button to="/">Browse issues</Button>
                    </main>
                  }
                />
              </Routes>
            </div>
            <Footer />
          </BookmarksProvider>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
