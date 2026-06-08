import { useState, useEffect } from "react";
import { Menu, X, TrendingUp } from "lucide-react";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Método", href: "#metodo" },
  { label: "Servicios", href: "#servicios" },
  { label: "Recursos", href: "#recursos" },
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Contacto", href: "#contacto" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm"
          : "bg-white border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-2.5 group shrink-0">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, var(--c-primary), var(--c-accent))" }}
          >
            <TrendingUp size={15} className="text-white" />
          </span>
          <span className="text-sm font-black tracking-tight text-slate-900">
            Terapia Financiera
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <a href="#contacto" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.8125rem" }}>
            Agenda tu diagnóstico
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex md:hidden items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-50 transition"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 pb-5">
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <a
              href="#contacto"
              className="btn-primary w-full"
              style={{ display: "flex", justifyContent: "center" }}
              onClick={() => setOpen(false)}
            >
              Agenda tu diagnóstico
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
