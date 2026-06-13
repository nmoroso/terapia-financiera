import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LogOut, Calendar, Settings, BookOpen, Trash2, XCircle, Plus, Check, X, BarChart2 } from "lucide-react";
import { auth } from "../firebase";
import { api } from "../lib/api";
import type { SessionType, DayAvailability } from "../types/booking";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

type Tab = "bookings" | "availability" | "services" | "evaluador";

export function Admin() {
  const [tab, setTab] = useState<Tab>("bookings");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setAuthed(true);
      else { setAuthed(false); navigate("/admin/login"); }
    });
    return unsub;
  }, [navigate]);

  if (authed === null) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const handleLogout = () => signOut(auth).then(() => navigate("/admin/login"));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Admin — Terapia Financiera</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </header>

      <nav className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-0 max-w-5xl mx-auto">
          {([
            { id: "bookings", label: "Reservas", icon: BookOpen },
            { id: "availability", label: "Disponibilidad", icon: Calendar },
            { id: "services", label: "Servicios", icon: Settings },
            { id: "evaluador", label: "Evaluador", icon: BarChart2 },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {tab === "bookings" && <BookingsTab qc={qc} />}
        {tab === "availability" && <AvailabilityTab />}
        {tab === "services" && <ServicesTab qc={qc} />}
        {tab === "evaluador" && <EvaluadorTab />}
      </main>
    </div>
  );
}

// ── Bookings Tab ───────────────────────────────────────────────────────────

function BookingsTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [filter, setFilter] = useState<"all" | "confirmed" | "cancelled">("confirmed");

  const { data, isLoading } = useQuery({
    queryKey: ["adminBookings", filter],
    queryFn: () =>
      api.adminGetBookings(filter === "all" ? {} : { status: filter }).then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.adminCancelBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminBookings"] }),
  });

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(["confirmed", "all", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              filter === f ? "bg-teal-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "confirmed" ? "Confirmadas" : f === "cancelled" ? "Canceladas" : "Todas"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : !data?.bookings.length ? (
        <p className="text-gray-500 text-center py-12">No hay reservas.</p>
      ) : (
        <div className="space-y-3">
          {data.bookings.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-white rounded-xl border p-4 flex items-start justify-between gap-4 ${
                b.status === "cancelled" ? "border-gray-200 opacity-60" : "border-gray-200"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    b.status === "confirmed" ? "bg-emerald-500" : "bg-gray-400"
                  }`} />
                  <span className="font-semibold text-gray-900">{b.clientName}</span>
                  <span className="text-sm text-gray-500">— {b.sessionTypeName}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(b.startTime).toLocaleString("es-CL", {
                    timeZone: "America/Santiago",
                    weekday: "short", day: "numeric", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-gray-500">{b.clientEmail}</p>
                {b.notes && <p className="text-xs text-gray-400 mt-1 italic">{b.notes}</p>}
              </div>
              {b.status === "confirmed" && (
                <button
                  onClick={() => cancelMutation.mutate(b.id)}
                  disabled={cancelMutation.isPending}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 whitespace-nowrap"
                >
                  <XCircle className="w-4 h-4" /> Cancelar
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Availability Tab ────────────────────────────────────────────────────────

function AvailabilityTab() {
  const [localAvail, setLocalAvail] = useState<Record<string, DayAvailability> | null>(null);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["adminAvailability"],
    queryFn: () => api.adminGetAvailability().then((r) => r.data),
  });

  useEffect(() => {
    if (data?.availability && !localAvail) {
      setLocalAvail(data.availability);
    }
  }, [data, localAvail]);

  const saveMutation = useMutation({
    mutationFn: () => api.adminUpdateAvailability(localAvail!),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  if (isLoading || !localAvail) {
    return <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>;
  }

  const toggleDay = (day: string) =>
    setLocalAvail((prev) => ({
      ...prev!,
      [day]: { ...prev![day], enabled: !prev![day].enabled },
    }));

  const updateSlot = (day: string, field: "start" | "end", value: string) =>
    setLocalAvail((prev) => ({
      ...prev!,
      [day]: {
        ...prev![day],
        slots: [{ ...prev![day].slots[0], [field]: value }],
      },
    }));

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Horarios de atención</h2>
      <div className="space-y-3">
        {Object.entries(localAvail).sort(([a], [b]) => Number(a) - Number(b)).map(([day, avail]) => (
          <div key={day} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => toggleDay(day)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                avail.enabled ? "bg-teal-600" : "bg-gray-300"
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                avail.enabled ? "translate-x-5" : "translate-x-1"
              }`} />
            </button>
            <span className={`w-24 text-sm font-medium ${
              avail.enabled ? "text-gray-800" : "text-gray-400"
            }`}>{DAY_NAMES[Number(day)]}</span>
            {avail.enabled && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={avail.slots[0]?.start ?? "09:00"}
                  onChange={(e) => updateSlot(day, "start", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="time"
                  value={avail.slots[0]?.end ?? "18:00"}
                  onChange={(e) => updateSlot(day, "end", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="mt-6 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
      >
        {saved ? <><Check className="w-4 h-4" /> Guardado</> : "Guardar cambios"}
      </button>
    </div>
  );
}

// ── Evaluador Tab ───────────────────────────────────────────────────────────

type EvalLabel = "Sano" | "Medio" | "Riesgo" | "Sólida" | "N/D";

interface EvalSection {
  label: EvalLabel;
  score: number;
  items: { name: string; value: string }[];
}

interface EvalResult {
  empresa: string;
  periodo: string;
  global: string;
  globalColor: string;
  liquidez: EvalSection;
  endeudamiento: EvalSection;
  cobertura: EvalSection;
  rentabilidad: EvalSection;
  operacion: EvalSection;
}

function safeDiv(a: number | null, b: number | null): number | null {
  if (a === null || b === null || b === 0) return null;
  return a / b;
}

function fmtRatio(v: number | null, decimals = 2): string {
  if (v === null) return "N/D";
  return v.toFixed(decimals) + "x";
}

function fmtPct(v: number | null): string {
  if (v === null) return "N/D";
  return (v * 100).toFixed(1) + "%";
}

function fmtDays(v: number | null): string {
  if (v === null) return "N/D";
  return Math.round(v) + " días";
}

function fmtMoney(v: number | null, magnitud: string): string {
  if (v === null) return "N/D";
  return v.toLocaleString("es-CL", { maximumFractionDigits: 0 }) + (magnitud ? ` ${magnitud}` : "");
}

function labelColor(label: EvalLabel): string {
  if (label === "Sano" || label === "Sólida") return "bg-emerald-100 text-emerald-800";
  if (label === "Medio") return "bg-amber-100 text-amber-800";
  if (label === "Riesgo") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-500";
}

function scoreOf(label: EvalLabel): number {
  if (label === "Sano" || label === "Sólida") return 2;
  if (label === "Medio") return 1;
  if (label === "Riesgo") return 0;
  return 1;
}

function globalFromScore(avg: number): { label: string; color: string } {
  if (avg >= 1.5) return { label: "Salud Sana", color: "text-emerald-700" };
  if (avg >= 0.75) return { label: "Riesgo Medio", color: "text-amber-700" };
  return { label: "Riesgo Alto", color: "text-red-700" };
}

const emptyEval = {
  empresa: "", periodo: "", moneda: "CLP", magnitud: "M$",
  activoCorriente: "", activoNoCorriente: "",
  pasivoCorriente: "", pasivoNoCorriente: "", patrimonio: "",
  ventas: "", costoVentas: "", gastosAdmin: "", depAmort: "",
  ebitSlot: "", gastosFinancieros: "", utilidadNeta: "",
  cxc: "", inventarios: "", cxp: "",
};

type EvalForm = typeof emptyEval;

function computeEval(f: EvalForm): EvalResult | null {
  const n = (s: string) => s.trim() === "" ? null : Number(s.replace(/,/g, "."));

  const ac = n(f.activoCorriente);
  const anc = n(f.activoNoCorriente);
  const pc = n(f.pasivoCorriente);
  const pnc = n(f.pasivoNoCorriente);
  const pat = n(f.patrimonio);
  const ventas = n(f.ventas);
  const costo = n(f.costoVentas);
  const gasAdmin = n(f.gastosAdmin);
  const dep = n(f.depAmort);
  const ebitSlot = n(f.ebitSlot);
  const gastFin = n(f.gastosFinancieros);
  const utilNeta = n(f.utilidadNeta);
  const cxc = n(f.cxc);
  const inv = n(f.inventarios);
  const cxp = n(f.cxp);

  const actTotal = ac !== null && anc !== null ? ac + anc : null;
  const pasTotal = pc !== null && pnc !== null ? pc + pnc : null;

  // EBIT: prefer slot if provided, else compute
  let ebit: number | null = null;
  if (ebitSlot !== null && ebitSlot !== 0) {
    ebit = ebitSlot;
  } else if (ventas !== null && costo !== null && gasAdmin !== null && dep !== null) {
    ebit = ventas - costo - gasAdmin - dep;
  } else if (ventas !== null && costo !== null && gasAdmin !== null) {
    ebit = ventas - costo - gasAdmin;
  }

  // Liquidez
  const rc = safeDiv(ac, pc);
  const pa = (ac !== null && inv !== null && pc !== null) ? safeDiv(ac - inv, pc) : safeDiv(ac, pc);
  const fm = ac !== null && pc !== null ? ac - pc : null;
  const nof = (cxc !== null && inv !== null && cxp !== null) ? cxc + inv - cxp : null;
  const brecha = fm !== null && nof !== null ? fm - nof : null;

  let liqLabel: EvalLabel = "N/D";
  if (rc !== null) {
    liqLabel = rc < 1 ? "Riesgo" : rc < 1.5 ? "Medio" : "Sano";
  }

  // Endeudamiento
  const pasPatRatio = safeDiv(pasTotal, pat);
  let endLabel: EvalLabel = "N/D";
  if (pasPatRatio !== null) {
    endLabel = pasPatRatio < 1 ? "Sano" : pasPatRatio <= 2.5 ? "Medio" : "Riesgo";
  }

  // Cobertura
  let cobLabel: EvalLabel = "N/D";
  let cobTexto = "N/D";
  if (ebit !== null && gastFin !== null) {
    if (ebit <= 0) { cobLabel = "Riesgo"; cobTexto = "Negativa"; }
    else if (gastFin === 0) { cobLabel = "Sólida"; cobTexto = "N/A (sin gastos fin.)"; }
    else {
      const cob = ebit / gastFin;
      cobTexto = fmtRatio(cob);
      cobLabel = cob < 2 ? "Riesgo" : cob <= 5 ? "Medio" : "Sólida";
    }
  }

  // Rentabilidad
  const margenBruto = (ventas !== null && costo !== null) ? safeDiv(ventas - costo, ventas) : null;
  const margenOper = safeDiv(ebit, ventas);
  const margenNeto = safeDiv(utilNeta, ventas);
  const roa = safeDiv(utilNeta, actTotal);
  const roe = safeDiv(utilNeta, pat);

  const base = roe ?? roa ?? margenNeto;
  let rentLabel: EvalLabel = "N/D";
  if (base !== null) {
    rentLabel = base < 0.08 ? "Riesgo" : base < 0.15 ? "Medio" : "Sano";
  }

  // Operación
  const dso = (cxc !== null && ventas !== null) ? safeDiv(365 * cxc, ventas) : null;
  const dio = (inv !== null && costo !== null) ? safeDiv(365 * inv, costo) : null;
  const dpo = (cxp !== null && costo !== null) ? safeDiv(365 * cxp, costo) : null;
  const cce = (dso !== null && dio !== null && dpo !== null) ? dso + dio - dpo : null;

  let opLabel: EvalLabel = "N/D";
  if (cce !== null) {
    opLabel = cce <= 45 ? "Sano" : cce <= 75 ? "Medio" : "Riesgo";
  }

  const scores = [liqLabel, endLabel, cobLabel, rentLabel, opLabel].map(scoreOf);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const { label: globalLabel, color: globalColor } = globalFromScore(avg);

  const mag = f.magnitud;

  return {
    empresa: f.empresa || "Empresa",
    periodo: f.periodo || "",
    global: globalLabel,
    globalColor,
    liquidez: {
      label: liqLabel, score: scoreOf(liqLabel),
      items: [
        { name: "Razón corriente", value: fmtRatio(rc) },
        { name: "Prueba ácida", value: fmtRatio(pa) },
        { name: "Fondo de maniobra", value: fmtMoney(fm, mag) },
        { name: "NOF", value: fmtMoney(nof, mag) },
        { name: "Brecha FM–NOF", value: fmtMoney(brecha, mag) },
      ],
    },
    endeudamiento: {
      label: endLabel, score: scoreOf(endLabel),
      items: [
        { name: "Pasivo / Patrimonio", value: fmtRatio(pasPatRatio) },
        { name: "Pasivo total", value: fmtMoney(pasTotal, mag) },
        { name: "Patrimonio", value: fmtMoney(pat, mag) },
      ],
    },
    cobertura: {
      label: cobLabel, score: scoreOf(cobLabel),
      items: [
        { name: "Cobertura de intereses", value: cobTexto },
        { name: "EBIT", value: fmtMoney(ebit, mag) },
        { name: "Gastos financieros", value: fmtMoney(gastFin, mag) },
      ],
    },
    rentabilidad: {
      label: rentLabel, score: scoreOf(rentLabel),
      items: [
        { name: "Margen bruto", value: fmtPct(margenBruto) },
        { name: "Margen operacional", value: fmtPct(margenOper) },
        { name: "Margen neto", value: fmtPct(margenNeto) },
        { name: "ROA", value: fmtPct(roa) },
        { name: "ROE", value: fmtPct(roe) },
      ],
    },
    operacion: {
      label: opLabel, score: scoreOf(opLabel),
      items: [
        { name: "DSO (días cobranza)", value: fmtDays(dso) },
        { name: "DIO (días inventario)", value: fmtDays(dio) },
        { name: "DPO (días pago prov.)", value: fmtDays(dpo) },
        { name: "CCE (ciclo de caja)", value: fmtDays(cce) },
      ],
    },
  };
}

function Field({
  label, value, onChange, placeholder, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder ?? "0"}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}

function SectionCard({ title, section }: { title: string; section: EvalSection }) {
  const barWidth = section.score === 2 ? "100%" : section.score === 1 ? "55%" : "20%";
  const barColor = section.score === 2 ? "bg-emerald-500" : section.score === 1 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${labelColor(section.label)}`}>
          {section.label}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: barWidth }} />
      </div>
      <div className="space-y-1.5">
        {section.items.map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span className="text-gray-500">{item.name}</span>
            <span className="font-medium text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvaluadorTab() {
  const [form, setForm] = useState<EvalForm>(emptyEval);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof EvalForm) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleEvaluar = () => {
    setError(null);
    if (!form.activoCorriente || !form.pasivoCorriente) {
      setError("Ingresa al menos Activo Corriente y Pasivo Corriente para calcular.");
      return;
    }
    setResult(computeEval(form));
  };

  const handleReset = () => { setForm(emptyEval); setResult(null); setError(null); };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Evaluador de Salud Financiera</h2>
        <p className="text-sm text-gray-500">Ingresa los datos del balance e estado de resultados para generar el diagnóstico.</p>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Identificación</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Empresa" value={form.empresa} onChange={set("empresa")} placeholder="Nombre empresa" />
          <Field label="Período" value={form.periodo} onChange={set("periodo")} placeholder="Ej: 2024" />
          <Field label="Moneda" value={form.moneda} onChange={set("moneda")} placeholder="CLP" />
          <Field label="Magnitud" value={form.magnitud} onChange={set("magnitud")} placeholder="M$" />
        </div>
      </div>

      {/* Balance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Balance General</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Activo Corriente *" value={form.activoCorriente} onChange={set("activoCorriente")} />
          <Field label="Activo No Corriente" value={form.activoNoCorriente} onChange={set("activoNoCorriente")} />
          <Field label="Pasivo Corriente *" value={form.pasivoCorriente} onChange={set("pasivoCorriente")} />
          <Field label="Pasivo No Corriente" value={form.pasivoNoCorriente} onChange={set("pasivoNoCorriente")} />
          <Field label="Patrimonio" value={form.patrimonio} onChange={set("patrimonio")} />
          <Field label="Cuentas por Cobrar" value={form.cxc} onChange={set("cxc")} />
          <Field label="Inventarios" value={form.inventarios} onChange={set("inventarios")} />
          <Field label="Cuentas por Pagar" value={form.cxp} onChange={set("cxp")} />
        </div>
      </div>

      {/* Estado de Resultados */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Estado de Resultados</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Ingresos / Ventas" value={form.ventas} onChange={set("ventas")} />
          <Field label="Costo de Ventas" value={form.costoVentas} onChange={set("costoVentas")} />
          <Field label="Gastos Admin. y Ventas" value={form.gastosAdmin} onChange={set("gastosAdmin")} />
          <Field label="Depreciación y Amort." value={form.depAmort} onChange={set("depAmort")} />
          <Field
            label="EBIT (si lo tienes directo)"
            value={form.ebitSlot}
            onChange={set("ebitSlot")}
            hint="Si se ingresa, tiene prioridad sobre el calculado"
          />
          <Field label="Gastos Financieros" value={form.gastosFinancieros} onChange={set("gastosFinancieros")} />
          <Field label="Utilidad Neta" value={form.utilidadNeta} onChange={set("utilidadNeta")} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleEvaluar}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Evaluar
        </button>
        {result && (
          <button
            onClick={handleReset}
            className="border border-gray-300 text-gray-600 text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50"
          >
            Limpiar
          </button>
        )}
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Global badge */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{result.empresa}{result.periodo ? ` — ${result.periodo}` : ""}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">Evaluación global</p>
            </div>
            <span className={`text-xl font-bold ${result.globalColor}`}>{result.global}</span>
          </div>

          {/* Section cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <SectionCard title="Liquidez" section={result.liquidez} />
            <SectionCard title="Endeudamiento" section={result.endeudamiento} />
            <SectionCard title="Cobertura de Intereses" section={result.cobertura} />
            <SectionCard title="Rentabilidad" section={result.rentabilidad} />
            <SectionCard title="Operación / Ciclo de Caja" section={result.operacion} />
          </div>

          {/* Score bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Resumen visual</h3>
            <div className="space-y-3">
              {[
                { label: "Liquidez", section: result.liquidez },
                { label: "Endeudamiento", section: result.endeudamiento },
                { label: "Cobertura", section: result.cobertura },
                { label: "Rentabilidad", section: result.rentabilidad },
                { label: "Operación", section: result.operacion },
              ].map(({ label, section }) => {
                const pct = section.score === 2 ? 95 : section.score === 1 ? 55 : 20;
                const color = section.score === 2 ? "bg-emerald-500" : section.score === 1 ? "bg-amber-400" : "bg-red-400";
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-28 text-sm text-gray-600 shrink-0">{label}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-16 text-center ${labelColor(section.label)}`}>
                      {section.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Services Tab ────────────────────────────────────────────────────────────

const emptyForm: Omit<SessionType, "id"> = {
  name: "", description: "", duration: 60, price: undefined, active: true,
};

function ServicesTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SessionType | null>(null);
  const [form, setForm] = useState<Omit<SessionType, "id">>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["adminSessionTypes"],
    queryFn: () => api.adminGetSessionTypes().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.adminCreateSessionType(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminSessionTypes"] }); setShowForm(false); setForm(emptyForm); },
  });

  const updateMutation = useMutation({
    mutationFn: () => api.adminUpdateSessionType({ ...form, id: editing!.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminSessionTypes"] }); setEditing(null); setForm(emptyForm); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.adminDeleteSessionType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminSessionTypes"] }),
  });

  const openEdit = (st: SessionType) => {
    setEditing(st);
    setForm({ name: st.name, description: st.description, duration: st.duration, price: st.price, active: st.active });
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Tipos de sesión</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-teal-200 p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-800">{editing ? "Editar servicio" : "Nuevo servicio"}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min) *</label>
              <input
                type="number" required min={15} step={15} value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (CLP, opcional)</label>
              <input
                type="number" min={0} value={form.price ?? ""}
                onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox" id="active" checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 rounded text-teal-600"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">Activo (visible en agenda pública)</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" /> {editing ? "Actualizar" : "Crear"}
            </button>
            <button onClick={cancelForm} className="flex items-center gap-1 border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : !data?.sessionTypes.length ? (
        <p className="text-gray-500 text-center py-12">No hay servicios creados aún.</p>
      ) : (
        <div className="space-y-3">
          {data.sessionTypes.map((st) => (
            <div key={st.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${st.active ? "bg-emerald-500" : "bg-gray-300"}`} />
                  <span className="font-semibold text-gray-900">{st.name}</span>
                  <span className="text-sm text-gray-500">{st.duration} min</span>
                  {st.price != null && <span className="text-sm text-teal-700 font-medium">${st.price.toLocaleString("es-CL")}</span>}
                </div>
                {st.description && <p className="text-sm text-gray-600 mt-1">{st.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(st)} className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded">Editar</button>
                <button
                  onClick={() => deleteMutation.mutate(st.id)}
                  disabled={deleteMutation.isPending}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
