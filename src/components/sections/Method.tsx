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
    <section id="metodo" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          label="El método"
          title="Un proceso guiado, no una lista genérica"
          subtitle="Terapia Financiera sigue un proceso estructurado de 5 pasos que convierte confusión en claridad y claridad en acción."
        />
        <div className="max-w-xl mx-auto">
          {methodSteps.map((step, i) => {
            const Icon = iconMap[step.icon];
            const isLast = i === methodSteps.length - 1;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09 }}
                className="flex gap-6"
              >
                {/* Vertical connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full shadow-sm shrink-0"
                    style={{ background: "linear-gradient(135deg, #0066FF, #00C9A7)" }}
                  >
                    {Icon && <Icon size={17} className="text-white" />}
                  </div>
                  {!isLast && (
                    <div className="mt-2 w-px flex-1 min-h-[32px] bg-slate-200" />
                  )}
                </div>

                {/* Content */}
                <div className={`${isLast ? "pb-0" : "pb-10"}`}>
                  <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0066FF]">
                    Paso {step.step}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
