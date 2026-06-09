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
    <section id="inicio" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-12 md:gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-[11px] font-bold tracking-[0.14em] uppercase text-[#0066FF] mb-4">
              Finanzas personales con propósito
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
              Ordena tu dinero para vivir con más claridad
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
              Terapia Financiera te ayuda a entender tu situación financiera, tomar mejores
              decisiones y construir un plan realista para usar tu dinero en función de tus
              objetivos personales.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/agenda"
                className="inline-flex items-center gap-2 rounded-full bg-[#0066FF] hover:bg-[#0052CC] px-7 py-3.5 text-sm font-semibold text-white transition-colors shadow-sm"
              >
                Agenda tu diagnóstico
                <ArrowRight size={15} />
              </a>
              <a
                href="#recursos"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors"
              >
                Ver recursos gratis
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#0066FF] mb-5">
                Lo que obtienes
              </p>
              <div className="flex flex-col gap-3">
                {highlights.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "linear-gradient(135deg, #0066FF, #00C9A7)" }}
                    >
                      <Icon size={14} className="text-white" />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-slate-800">{label}</span>
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                <p className="text-xs font-semibold text-[#0066FF]">
                  ✨ Primera sesión de diagnóstico sin compromiso
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
