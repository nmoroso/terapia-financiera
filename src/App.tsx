import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Home } from "./pages/Home";
import { Agenda } from "./pages/Agenda";
import { Admin } from "./pages/Admin";
import { AdminLogin } from "./pages/AdminLogin";

const queryClient = new QueryClient();

const NO_LAYOUT_ROUTES = ["/admin", "/admin/login"];

export default function App() {
  const path = window.location.pathname;
  const showLayout = !NO_LAYOUT_ROUTES.some((r) => path.startsWith(r));

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes showLayout={showLayout} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AppRoutes({ showLayout }: { showLayout: boolean }) {
  return (
    <div className="min-h-screen bg-white">
      {showLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
      {showLayout && <Footer />}
    </div>
  );
}
