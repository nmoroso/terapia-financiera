import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section
      className="py-24 md:py-32"
      style={{ background: "linear-gradient(135deg, #0052CC 0%, #0066FF 50%, #0080FF 100%)" }}
    >
      <div className="mx-auto max-w-2xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-block text-[11px] font-bold tracking-[0.14em] uppercase text-blue-200 mb-5">
            Da el primer paso
          </span>
          <h2 className="text-3xl md:text-[2.6rem] font-black tracking-tight text-white leading-[1.15] mb-6">
            Empieza ordenando tu situación actual
          </h2>
          <p className="text-lg text-blue-100 leading-relaxed mb-10">
            El primer paso no es tomar una gran decisión financiera. Es entender dónde estás, qué
            quieres lograr y qué camino tiene más sentido para ti.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 mb-10">
            <span className="text-sm font-semibold text-white">
              ✨ Primera sesión de diagnóstico sin compromiso
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/agenda"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#0066FF] shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Agenda tu diagnóstico
              <ArrowRight size={16} />
            </a>
            <a
              href="#recursos"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-white/10 hover:bg-white/20 px-7 py-[14px] text-sm font-semibold text-white transition-colors"
            >
              Ver recursos gratis
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
