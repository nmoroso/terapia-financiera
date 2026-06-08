import { motion } from "framer-motion";
import {
  Calculator,
  TrendingUp,
  FileText,
  Landmark,
  Download,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import { resources, type ResourceStatus } from "../../data/resources";
import { SectionHeader } from "../ui/SectionHeader";
import { Badge } from "../ui/Badge";

const iconMap: Record<string, React.ElementType> = {
  Calculator,
  TrendingUp,
  FileText,
  Landmark,
  Download,
  PlayCircle,
};

const statusConfig: Record<ResourceStatus, { label: string; variant: "active" | "warning" | "default" }> = {
  free: { label: "Gratis", variant: "active" },
  available: { label: "Disponible", variant: "default" },
  "coming-soon": { label: "Próximamente", variant: "warning" },
};

export function Resources() {
  return (
    <section id="recursos" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          label="Recursos"
          title="Herramientas y contenido gratuito"
          subtitle="Recursos prácticos para entender tu situación financiera y tomar mejores decisiones, sin costo."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource, i) => {
            const Icon = iconMap[resource.icon];
            const status = statusConfig[resource.status];
            const isComingSoon = resource.status === "coming-soon";
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${
                  isComingSoon ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    {Icon && <Icon size={18} className="text-[#0066FF]" />}
                  </span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{resource.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{resource.description}</p>
                </div>
                {!isComingSoon && (
                  <a
                    href={resource.href}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066FF] hover:text-[#0052CC] transition-colors"
                  >
                    Acceder <ArrowRight size={12} />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
