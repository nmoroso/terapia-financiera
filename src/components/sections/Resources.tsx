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
    <section
      id="recursos"
      className="bg-white"
      style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)" }}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          label="Recursos"
          title="Herramientas y contenido gratuito"
          subtitle="Recursos prácticos para entender tu situación financiera y tomar mejores decisiones, sin costo."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, i) => {
            const Icon = iconMap[resource.icon];
            const status = statusConfig[resource.status];
            const isComingSoon = resource.status === "coming-soon";
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`card p-5 flex flex-col gap-3 ${
                  isComingSoon ? "opacity-55" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: "var(--c-primary-light)" }}
                  >
                    {Icon && <Icon size={17} style={{ color: "var(--c-primary)" }} />}
                  </span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{resource.title}</h3>
                  <p className="text-sm text-slate-600" style={{ lineHeight: 1.65 }}>
                    {resource.description}
                  </p>
                </div>
                {!isComingSoon && (
                  <a
                    href={resource.href}
                    className="mt-auto flex items-center gap-1 text-xs font-semibold transition"
                    style={{ color: "var(--c-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-primary-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-primary)")}>
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
