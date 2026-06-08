import { motion } from "framer-motion";
import { Search, Eye, Target, ListChecks, BarChart2 } from "lucide-react";
import { methodSteps } from "../../data/method";
import { SectionHeader } from "../ui/SectionHeader";

const iconMap: Record<string, React.ElementType> = {
  Search,
  Eye,
  Target,
  ListChecks,
  BarChart2,
};

export function Method() {
  return (
    <section
      id="metodo"
      className="bg-white"
      style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)" }}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          label="El método"
          title="Un proceso guiado, no una lista genérica"
          subtitle="Terapia Financiera sigue un proceso estructurado de 5 pasos que convierte confusión en claridad y claridad en acción."
        />
        <div className="max-w-2xl">
          {methodSteps.map((step, i) => {
            const Icon = iconMap[step.icon];
            const isLast = i === methodSteps.length - 1;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-5"
              >
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm"
                    style={{ background: "linear-gradient(135deg, var(--c-primary), var(--c-accent))" }}
                  >
                    {Icon && <Icon size={16} className="text-white" />}
                  </div>
                  {!isLast && (
                    <div
                      className="mt-1 w-px flex-1 min-h-[40px]"
                      style={{ background: "var(--c-border)" }}
                    />
                  )}
                </div>
                <div className="pb-10">
                  <span className="section-label" style={{ marginBottom: "4px" }}>Paso {step.step}</span>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600" style={{ lineHeight: 1.65 }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
