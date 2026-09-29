import { ThemeProvider } from "./context/ThemeContext";
import Gsoc, { GsocDetail } from "./pages/Gsoc";
import OAuthComplete from "./pages/OAuthComplete";
import type { PropsWithChildren } from "react";
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
import { Navbar, Footer, BookmarkNotice } from "./components/Layout";
import { Button } from "./components/UI";
import Browse from "./pages/Browse";
import Auth from "./pages/Auth";
import { lazy, Suspense } from "react";
const Detail = lazy(() => import("./pages/Detail"));
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Seo from "./components/Seo";
import ContributionGuide from "./pages/ContributionGuide";
function Protected({ children }: PropsWithChildren) {
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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
export function AppContent() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <AuthProvider>
          <BookmarksProvider>
            <Seo />
            <a className="skip-link" href="#content">
              Skip to content
            </a>
            <Navbar />
            <BookmarkNotice />
            <div id="content">
              <Routes>
                <Route
                  path="/contribution-guide"
                  element={<ContributionGuide />}
                />
                <Route path="/gsoc" element={<Gsoc />} />
                <Route path="/gsoc/:id" element={<GsocDetail />} />
                <Route path="/auth/complete" element={<OAuthComplete />} />
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
      </ThemeProvider>
    </MotionConfig>
  );
}
