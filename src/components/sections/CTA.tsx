import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, var(--c-primary) 0%, #0047B3 50%, #003A99 100%)",
        paddingTop: "var(--section-gap)",
        paddingBottom: "var(--section-gap)",
      }}
    >
      <div className="mx-auto max-w-[720px] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Da el primer paso
          </span>
          <h2
            className="font-black tracking-tight text-white mb-5 leading-tight"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            Empieza ordenando tu situación actual
          </h2>
          <p
            className="mb-10"
            style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontSize: "1.0625rem" }}
          >
            El primer paso no es tomar una gran decisión financiera. Es entender dónde estás, qué
            quieres lograr y qué camino tiene más sentido para ti.
          </p>

          {/* Prominent badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            ✦ Primera sesión de diagnóstico sin compromiso
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#contacto"
              className="btn-primary"
              style={{
                background: "#fff",
                color: "var(--c-primary)",
                padding: "14px 28px",
                fontSize: "0.9375rem",
              }}
            >
              Agenda tu diagnóstico
              <ArrowRight size={16} />
            </a>
            <a
              href="#recursos"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "13px 24px",
                borderRadius: "9999px",
                border: "1.5px solid rgba(255,255,255,0.4)",
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "background 0.15s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Ver recursos gratis
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
