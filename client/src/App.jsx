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
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Auth from "./pages/Auth";
import Detail from "./pages/Detail";
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
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route
                  path="/explore"
                  element={<Navigate to="/browse" replace />}
                />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth signup />} />
                <Route path="/issues/:id" element={<Detail />} />
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
                      <div className="eyebrow">404 / A LITTLE OFF THE PATH</div>
                      <h1>
                        This branch
                        <br />
                        doesn’t exist<span>.</span>
                      </h1>
                      <p>There’s still plenty of good work waiting for you.</p>
                      <Button to="/browse">Find your way back ↗</Button>
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
