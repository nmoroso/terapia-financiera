export interface MethodStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export const methodSteps: MethodStep[] = [
  {
    step: 1,
    title: "Diagnóstico",
    description:
      "Entender ingresos, gastos, deudas, hábitos y objetivos. Ver el panorama completo sin juicios.",
    icon: "Search",
  },
  {
    step: 2,
    title: "Claridad",
    description:
      "Identificar qué está funcionando, qué no y dónde están los principales puntos de fuga de dinero.",
    icon: "Eye",
  },
  {
    step: 3,
    title: "Propósito",
    description:
      "Conectar las decisiones financieras con objetivos personales reales. El dinero al servicio de tu vida.",
    icon: "Target",
  },
  {
    step: 4,
    title: "Plan de acción",
    description:
      "Definir pasos concretos, prioridades, presupuesto, manejo de deuda, ahorro e inversión.",
    icon: "ListChecks",
  },
  {
    step: 5,
    title: "Seguimiento",
    description:
      "Medir avances, ajustar el plan y crear hábitos sostenibles que funcionen en tu vida cotidiana.",
    icon: "BarChart2",
  },
];
