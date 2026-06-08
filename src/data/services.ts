export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  cta: string;
}

export const services: Service[] = [
  {
    id: "diagnostico",
    icon: "Search",
    title: "Diagnóstico financiero",
    description:
      "Sesión inicial para entender tu situación actual, detectar problemas y definir prioridades concretas.",
    cta: "Agendar diagnóstico",
  },
  {
    id: "plan",
    icon: "Map",
    title: "Plan financiero personal",
    description:
      "Construcción de una ruta práctica para ordenar gastos, deudas, ahorro, inversión y objetivos.",
    cta: "Ver más",
  },
  {
    id: "acompanamiento",
    icon: "TrendingUp",
    title: "Acompañamiento financiero",
    description:
      "Seguimiento periódico para implementar el plan, corregir desviaciones y consolidar hábitos sostenibles.",
    cta: "Ver más",
  },
  {
    id: "educacion",
    icon: "BookOpen",
    title: "Educación financiera aplicada",
    description:
      "Contenido, recursos y herramientas para entender productos financieros y tomar mejores decisiones.",
    cta: "Ver más",
  },
];
