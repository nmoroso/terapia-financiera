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
    <section id="metodo" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader
          label="El método"
          title="Un proceso guiado, no una lista genérica"
          subtitle="Terapia Financiera sigue un proceso estructurado de 5 pasos que convierte confusión en claridad y claridad en acción."
        />
        <div className="relative flex flex-col gap-0">
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 shadow-sm">
                    {Icon && <Icon size={16} className="text-white" />}
                  </div>
                  {!isLast && <div className="mt-1 w-px flex-1 bg-slate-200 min-h-[40px]" />}
                </div>
                <div className="pb-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Paso {step.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
