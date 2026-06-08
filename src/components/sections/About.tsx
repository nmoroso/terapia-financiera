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
    <section id="sobre-mi" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-20">

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <span className="inline-block text-[11px] font-bold tracking-[0.14em] uppercase text-[#0066FF] mb-4">
              Sobre mí
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-[2.4rem] leading-[1.15] mb-6">
              El dinero es una herramienta. Mi trabajo es ayudarte a usarla bien.
            </h2>
            <p className="text-base text-slate-500 leading-relaxed mb-4">
              Soy Nicolás Moroso, ingeniero comercial y magíster en finanzas, con experiencia en
              banca, productos financieros, banca privada y empresas. He trabajado asesorando
              personas, clientes de alto patrimonio, pymes y empresas en decisiones financieras,
              créditos, inversiones y planificación.
            </p>
            <p className="text-base text-slate-500 leading-relaxed">
              A través de Terapia Financiera busco traducir el mundo financiero a decisiones
              simples, prácticas y conectadas con la vida real de cada persona.
            </p>
          </motion.div>

          {/* Credentials */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {credentials.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #0066FF, #00C9A7)" }}
                >
                  <Icon size={17} className="text-white" />
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
