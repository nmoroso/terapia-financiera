import { motion } from "framer-motion";
import { Search, Map, TrendingUp, BookOpen, ArrowRight } from "lucide-react";
import { services } from "../../data/services";
import { SectionHeader } from "../ui/SectionHeader";
import { Button } from "../ui/Button";

const iconMap: Record<string, React.ElementType> = {
  Search,
  Map,
  TrendingUp,
  BookOpen,
};

export function Services() {
  return (
    <section id="servicios" className="bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader
          label="Servicios"
          title="Acompañamiento a tu medida"
          subtitle="Desde el diagnóstico inicial hasta el seguimiento continuo, con el nivel de profundidad que necesitas."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600">
                    {Icon && <Icon size={18} className="text-white" />}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{service.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{service.description}</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Button variant="secondary">
                    {service.cta}
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
