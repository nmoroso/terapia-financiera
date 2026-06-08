import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Search, Map, TrendingUp, Smile } from "lucide-react";

const highlights = [
  { icon: Search, label: "Diagnóstico financiero" },
  { icon: Map, label: "Plan de acción personalizado" },
  { icon: TrendingUp, label: "Seguimiento y hábitos" },
  { icon: Smile, label: "Menos estrés financiero" },
];

export function Hero() {
  return (
    <section
      id="inicio"
      className="bg-white"
      style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)" }}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        {/* 60/40 grid — single column on mobile (card below text) */}
        <div className="hero-grid">
          {/* Left 60%: headline + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="section-label">Finanzas personales con propósito</span>
            <h1
              className="font-black tracking-tight text-slate-900 mb-5"
              style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.1 }}
            >
              Ordena tu dinero para vivir con más claridad
            </h1>
            <p
              className="text-slate-600 mb-8 max-w-lg"
              style={{ fontSize: "1.0625rem", lineHeight: 1.65 }}
            >
              Terapia Financiera te ayuda a entender tu situación financiera, tomar mejores
              decisiones y construir un plan realista para usar tu dinero en función de tus
              objetivos personales.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#contacto" className="btn-primary">
                Agenda tu diagnóstico
                <ArrowRight size={15} />
              </a>
              <a href="#recursos" className="btn-secondary">
                Ver recursos gratis
              </a>
            </div>
          </motion.div>

          {/* Right 40%: benefits card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <div className="card p-6" style={{ borderRadius: "16px" }}>
              <p className="section-label" style={{ marginBottom: "16px" }}>Lo que obtienes</p>
              <div className="flex flex-col gap-2.5">
                {highlights.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: "var(--c-surface)",
                      border: "1.5px solid var(--c-border)",
                    }}
                  >
                    <span className="icon-box-sm">
                      <Icon size={15} className="text-white" />
                    </span>
                    <span className="text-sm font-semibold text-slate-800 flex-1">{label}</span>
                    <CheckCircle2
                      size={15}
                      style={{ color: "var(--c-accent)", flexShrink: 0 }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* CTA nudge */}
              <div
                className="mt-4 rounded-xl px-4 py-3"
                style={{
                  background: "var(--c-primary-light)",
                  border: "1.5px solid #BFDBFE",
                }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--c-primary)" }}
                >
                  ✦ Primera sesión de diagnóstico sin compromiso
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
