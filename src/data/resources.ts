export type ResourceStatus = "available" | "coming-soon" | "free";

export interface Resource {
  id: string;
  icon: string;
  title: string;
  description: string;
  status: ResourceStatus;
  href: string;
}

export const resources: Resource[] = [
  {
    id: "simulador-creditos",
    icon: "Calculator",
    title: "Simulador de créditos",
    description:
      "Calcula cuotas, intereses y el costo real de cualquier crédito antes de contratarlo.",
    status: "free",
    href: "#",
  },
  {
    id: "simulador-inversiones",
    icon: "TrendingUp",
    title: "Simulador de inversiones",
    description:
      "Proyecta el crecimiento de tus ahorros con distintas tasas y horizontes de tiempo.",
    status: "free",
    href: "#",
  },
  {
    id: "articulos",
    icon: "FileText",
    title: "Artículos de educación financiera",
    description:
      "Contenido práctico sobre ahorro, inversión, deuda y planificación financiera personal.",
    status: "available",
    href: "#",
  },
  {
    id: "guia-bancos",
    icon: "Landmark",
    title: "Aprende de bancos",
    description:
      "Entiende cómo funcionan los bancos, sus productos y cómo usarlos a tu favor.",
    status: "available",
    href: "#",
  },
  {
    id: "guias-descargables",
    icon: "Download",
    title: "Guías descargables",
    description:
      "Plantillas y guías en PDF para presupuesto, control de deudas y planificación de objetivos.",
    status: "coming-soon",
    href: "#",
  },
  {
    id: "videos",
    icon: "PlayCircle",
    title: "Videos y contenido práctico",
    description:
      "Explicaciones visuales de conceptos financieros aplicados a situaciones reales.",
    status: "coming-soon",
    href: "#",
  },
];
