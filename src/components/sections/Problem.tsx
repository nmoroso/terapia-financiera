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
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          label="El problema"
          title="No siempre falta dinero. A veces falta claridad."
          subtitle="Muchas personas tienen ingresos, tarjetas, deudas, gastos y metas, pero no tienen un sistema claro para tomar decisiones. El resultado es estrés, sensación de no avanzar y decisiones en piloto automático."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((problem, i) => {
            const Icon = iconMap[problem.icon];
            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  {Icon && <Icon size={18} className="text-red-500" />}
                </span>
                <p className="text-sm font-semibold leading-relaxed text-slate-800">
                  {problem.text}
                </p>
              </motion.div>
            );
          })}

          {/* Resolution card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: problems.length * 0.07 }}
            className="flex flex-col justify-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-6"
          >
            <p className="font-bold text-emerald-900">Hay una salida.</p>
            <p className="text-sm leading-relaxed text-emerald-800">
              Con claridad, estructura y un plan concreto, recuperar el control es posible sin
              sacrificar tu calidad de vida.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
