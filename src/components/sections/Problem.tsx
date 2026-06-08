import { motion } from "framer-motion";
import { HelpCircle, RefreshCw, PiggyBank, Zap, Compass } from "lucide-react";
import { problems } from "../../data/problems";
import { SectionHeader } from "../ui/SectionHeader";

const iconMap: Record<string, React.ElementType> = {
  HelpCircle,
  RefreshCw,
  PiggyBank,
  Zap,
  Compass,
};

export function Problem() {
  return (
    <section className="bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader
          label="El problema"
          title="No siempre falta dinero. A veces falta claridad."
          subtitle="Muchas personas tienen ingresos, tarjetas, deudas, gastos y metas, pero no tienen un sistema claro para tomar decisiones. El resultado es estrés, sensación de no avanzar y decisiones tomadas en piloto automático."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, i) => {
            const Icon = iconMap[problem.icon];
            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                  {Icon && <Icon size={17} className="text-red-500" />}
                </span>
                <p className="text-sm font-semibold leading-snug text-slate-800">{problem.text}</p>
              </motion.div>
            );
          })}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: problems.length * 0.06 }}
            className="rounded-2xl border border-teal-200 bg-teal-50 p-5 flex flex-col justify-center"
          >
            <p className="text-sm font-bold text-teal-800 mb-1">Hay una salida.</p>
            <p className="text-sm leading-relaxed text-teal-700">
              Con claridad, estructura y un plan concreto, recuperar el control es posible sin
              sacrificar tu calidad de vida.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
