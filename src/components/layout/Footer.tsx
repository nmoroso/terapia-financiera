import { TrendingUp, ExternalLink } from "lucide-react";

const footerLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Método", href: "#metodo" },
  { label: "Servicios", href: "#servicios" },
  { label: "Recursos", href: "#recursos" },
  { label: "Sobre mí", href: "#sobre-mi" },
];

const socials = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "X / Twitter", href: "#" },
];

export function Footer() {
  return (
    <footer id="contacto" className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <a href="#inicio" className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600">
                <TrendingUp size={16} className="text-white" />
              </span>
              <span className="text-sm font-black tracking-tight text-slate-900">
                Terapia Financiera
              </span>
            </a>
            <p className="text-sm leading-relaxed text-slate-500">
              Educación, asesoría y acompañamiento financiero para que uses el dinero como
              herramienta para vivir mejor.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Navegación
            </p>
            <ul className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Contacto
            </p>
            <p className="text-sm text-slate-600 mb-4">
              <a
                href="mailto:hola@terapiafinanciera.cl"
                className="hover:text-slate-900 transition"
              >
                hola@terapiafinanciera.cl
              </a>
            </p>
            <div className="flex gap-3">
              {socials.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900 gap-1"
                >
                  <ExternalLink size={12} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-400 leading-relaxed">
            La información entregada tiene fines educativos y no constituye recomendación de
            inversión personalizada sin evaluación previa. &copy; {new Date().getFullYear()} Terapia
            Financiera.
          </p>
        </div>
      </div>
    </footer>
  );
}
