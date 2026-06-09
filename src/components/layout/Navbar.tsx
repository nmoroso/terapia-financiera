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
          ? "bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm"
          : "bg-white"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
        <a href="#inicio" className="flex items-center gap-2.5 shrink-0">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
            style={{ background: "linear-gradient(135deg, #0066FF, #00C9A7)" }}
          >
            <TrendingUp size={15} className="text-white" />
          </span>
          <span className="text-sm font-black tracking-tight text-slate-900">
            Terapia Financiera
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/agenda"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-[#0066FF] hover:bg-[#0052CC] px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Agenda tu diagnóstico
        </a>

        <button
          className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 pb-6">
          <ul className="flex flex-col pt-3 pb-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="/agenda"
            className="flex w-full items-center justify-center rounded-full bg-[#0066FF] hover:bg-[#0052CC] py-3 text-sm font-semibold text-white transition-colors"
            onClick={() => setOpen(false)}
          >
            Agenda tu diagnóstico
          </a>
        </div>
      )}
    </header>
  );
}
