import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Search, Map, TrendingUp, Smile } from "lucide-react";
import { Button } from "../ui/Button";

const highlights = [
  { icon: Search, label: "Diagnóstico financiero" },
  { icon: Map, label: "Plan de acción personalizado" },
  { icon: TrendingUp, label: "Seguimiento y hábitos" },
  { icon: Smile, label: "Menos estrés financiero" },
];

export function Hero() {
  return (
    <section id="inicio" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="mb-4 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Finanzas personales con propósito
            </span>
            <h1 className="mb-5 text-4xl font-black leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
              Ordena tu dinero para vivir con más claridad
            </h1>
            <p className="mb-8 text-base leading-relaxed text-slate-600 md:text-lg">
              Terapia Financiera te ayuda a entender tu situación financiera, tomar mejores
              decisiones y construir un plan realista para usar tu dinero en función de tus
              objetivos personales.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">
                Agenda tu diagnóstico
                <ArrowRight size={16} />
              </Button>
              <Button variant="secondary">Ver recursos gratis</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Lo que obtienes
              </p>
              <div className="flex flex-col gap-3">
                {highlights.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600">
                      <Icon size={15} className="text-white" />
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{label}</span>
                    <CheckCircle2 size={15} className="ml-auto text-teal-500" />
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-semibold text-emerald-700">
                  Primera sesión de diagnóstico sin compromiso
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
