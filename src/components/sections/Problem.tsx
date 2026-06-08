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
    <section
      className="bg-slate-50"
      style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)" }}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          label="El problema"
          title="No siempre falta dinero. A veces falta claridad."
          subtitle="Muchas personas tienen ingresos, tarjetas, deudas, gastos y metas, pero no tienen un sistema claro para tomar decisiones. El resultado es estrés, sensación de no avanzar y decisiones tomadas en piloto automático."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" style={{ alignItems: "stretch" }}>
          {problems.map((problem, i) => {
            const Icon = iconMap[problem.icon];
            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card p-5 flex flex-col gap-3 h-full"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: "#FEF2F2" }}
                >
                  {Icon && <Icon size={17} style={{ color: "#EF4444" }} />}
                </span>
                <p className="text-sm font-semibold leading-relaxed text-slate-800 flex-1">
                  {problem.text}
                </p>
              </motion.div>
            );
          })}

          {/* Resolution card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: problems.length * 0.06 }}
            className="rounded-xl p-5 flex flex-col justify-center h-full"
            style={{
              background: "var(--c-accent-light)",
              border: "1.5px solid #99EAD9",
              borderRadius: "var(--radius-card)",
            }}
          >
            <p className="text-sm font-bold mb-2" style={{ color: "#065F46" }}>Hay una salida.</p>
            <p className="text-sm leading-relaxed" style={{ color: "#047857" }}>
              Con claridad, estructura y un plan concreto, recuperar el control es posible sin
              sacrificar tu calidad de vida.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
