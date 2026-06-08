import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

export function CTA() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 py-12 text-center md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Da el primer paso
          </p>
          <h2 className="mb-5 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
            Empieza ordenando tu situación actual
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-slate-600 md:text-base">
            El primer paso no es tomar una gran decisión financiera. Es entender dónde estás, qué
            quieres lograr y qué camino tiene más sentido para ti.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary">
              Agenda tu diagnóstico
              <ArrowRight size={16} />
            </Button>
            <Button variant="secondary">Ver recursos gratis</Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
