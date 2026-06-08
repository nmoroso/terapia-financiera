import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Home } from "./pages/Home";

// Lazy-load Firebase-dependent pages so firebase.ts is not imported
// on the landing page (avoids crash when VITE_FIREBASE_* vars are absent)
const Agenda = lazy(() => import("./pages/Agenda").then((m) => ({ default: m.Agenda })));
const Admin = lazy(() => import("./pages/Admin").then((m) => ({ default: m.Admin })));
const AdminLogin = lazy(() => import("./pages/AdminLogin").then((m) => ({ default: m.AdminLogin })));

const queryClient = new QueryClient();

const ADMIN_PATHS = ["/admin", "/admin/login"];

export default function App() {
  const isAdminPath = ADMIN_PATHS.some((p) => window.location.pathname.startsWith(p));
  const isAgendaPath = window.location.pathname.startsWith("/agenda");
  const showLayout = !isAdminPath && !isAgendaPath;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          {showLayout && <Navbar />}
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Routes>
          </Suspense>
          {showLayout && <Footer />}
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
