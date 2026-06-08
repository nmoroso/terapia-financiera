import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Users, Award } from "lucide-react";

const credentials = [
  { icon: GraduationCap, label: "Ingeniero comercial y magíster en finanzas" },
  { icon: Briefcase, label: "Experiencia en banca privada y corporativa" },
  { icon: Users, label: "Asesoría a personas, pymes y empresas" },
  { icon: Award, label: "Especialización en créditos e inversiones" },
];

export function About() {
  return (
    <section id="sobre-mi" className="bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Sobre mí
            </p>
            <h2 className="mb-5 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
              El dinero es una herramienta. Mi trabajo es ayudarte a usarla bien.
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              Soy Nicolás Moroso, ingeniero comercial y magíster en finanzas, con experiencia en
              banca, productos financieros, banca privada y empresas. He trabajado asesorando
              personas, clientes de alto patrimonio, pymes y empresas en decisiones financieras,
              créditos, inversiones y planificación.
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              A través de Terapia Financiera busco traducir el mundo financiero a decisiones
              simples, prácticas y conectadas con la vida real de cada persona.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-3"
          >
            {credentials.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600">
                  <Icon size={16} className="text-white" />
                </span>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
