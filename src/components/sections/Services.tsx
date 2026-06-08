import { motion } from "framer-motion";
import { Search, Map, TrendingUp, BookOpen, ArrowRight } from "lucide-react";
import { services } from "../../data/services";
import { SectionHeader } from "../ui/SectionHeader";

const iconMap: Record<string, React.ElementType> = {
  Search,
  Map,
  TrendingUp,
  BookOpen,
};

export function Services() {
  return (
    <section id="servicios" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          label="Servicios"
          title="Acompañamiento a tu medida"
          subtitle="Desde el diagnóstico inicial hasta el seguimiento continuo, con el nivel de profundidad que necesitas."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="flex items-start gap-5">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "linear-gradient(135deg, #0066FF, #00C9A7)" }}
                  >
                    {Icon && <Icon size={19} className="text-white" />}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{service.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
                  </div>
                </div>
                <div className="mt-auto pt-2 border-t border-slate-100">
                  <a
                    href="#contacto"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066FF] hover:text-[#0052CC] transition-colors"
                  >
                    {service.cta}
                    <ArrowRight size={14} />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
