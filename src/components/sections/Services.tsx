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
    <section
      id="servicios"
      className="bg-slate-50"
      style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)" }}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          label="Servicios"
          title="Acompañamiento a tu medida"
          subtitle="Desde el diagnóstico inicial hasta el seguimiento continuo, con el nivel de profundidad que necesitas."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card p-6 flex flex-col gap-5"
              >
                <div className="flex items-start gap-4">
                  <span className="icon-box">
                    {Icon && <Icon size={18} className="text-white" />}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5">{service.title}</h3>
                    <p className="text-sm text-slate-600" style={{ lineHeight: 1.65 }}>
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <a href="#contacto" className="btn-secondary" style={{ width: "fit-content" }}>
                    {service.cta}
                    <ArrowRight size={13} />
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
