export interface Problem {
  id: string;
  icon: string;
  text: string;
}

export const problems: Problem[] = [
  {
    id: "gastos",
    icon: "HelpCircle",
    text: "No sabes exactamente en qué se va tu plata cada mes.",
  },
  {
    id: "deudas",
    icon: "RefreshCw",
    text: "Pagas deudas, pero no sientes que estás avanzando.",
  },
  {
    id: "ahorro",
    icon: "PiggyBank",
    text: "Ahorras sin un objetivo claro ni una estrategia.",
  },
  {
    id: "estres",
    icon: "Zap",
    text: "Tomas decisiones financieras bajo estrés o sin información.",
  },
  {
    id: "metas",
    icon: "Compass",
    text: "Tienes metas, pero no una ruta concreta para llegar a ellas.",
  },
];
