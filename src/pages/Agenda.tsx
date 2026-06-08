import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import type { SessionType } from "../types/booking";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago" });
}

function formatDate(date: Date) {
  return `${DAYS[date.getDay()]} ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

function isoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

type Step = 1 | 2 | 3 | 4;

export function Agenda() {
  const [step, setStep] = useState<Step>(1);
  const [selectedType, setSelectedType] = useState<SessionType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  const { data: typesData, isLoading: loadingTypes } = useQuery({
    queryKey: ["sessionTypes"],
    queryFn: () => api.getSessionTypes().then((r) => r.data),
  });

  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ["slots", selectedDate, selectedType?.id],
    queryFn: () =>
      api.getAvailableSlots(isoDate(selectedDate!), selectedType!.id).then((r) => r.data),
    enabled: !!selectedDate && !!selectedType,
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      api.createBooking({
        sessionTypeId: selectedType!.id,
        clientName: form.name,
        clientEmail: form.email,
        startTime: selectedSlot!,
        notes: form.notes || undefined,
      }).then((r) => r.data),
    onSuccess: (data) => {
      setConfirmedBookingId(data.bookingId);
      setStep(4);
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
  const lastDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
  const paddingDays = firstDay.getDay();
  const totalCells = paddingDays + lastDay.getDate();
  const cells = Array.from({ length: Math.ceil(totalCells / 7) * 7 }, (_, i) => {
    const d = new Date(firstDay);
    d.setDate(d.getDate() + (i - paddingDays));
    return d;
  });

  const prevMonth = () =>
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));

  const stepVariants = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Agenda tu sesión</h1>
          <p className="text-gray-600 mt-2">Reserva un espacio para trabajar tu situación financiera.</p>
          {step < 4 && (
            <div className="flex items-center gap-2 mt-6">
              {(["Servicio", "Fecha y hora", "Tus datos"] as const).map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step > i + 1 ? "bg-emerald-500 text-white"
                      : step === i + 1 ? "bg-[#0066FF] text-white"
                      : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span className={`text-sm hidden sm:block ${step === i + 1 ? "font-medium text-gray-900" : "text-gray-500"}`}>
                    {label}
                  </span>
                  {i < 2 && <div className="w-8 h-px bg-gray-300" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">¿Qué servicio necesitas?</h2>
              {loadingTypes ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {typesData?.sessionTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedType(type); setStep(2); }}
                      className="text-left p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#0066FF] hover:shadow-md transition-all group"
                    >
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#0066FF]">{type.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{type.duration} min</span>
                        {type.price != null && <span className="font-medium text-[#0066FF]">${type.price.toLocaleString("es-CL")}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
                <ChevronLeft className="w-4 h-4" /> Volver
              </button>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="font-semibold text-gray-800">{MONTHS[calendarDate.getMonth()]} {calendarDate.getFullYear()}</span>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {DAYS.map((d) => <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>)}
                  {cells.map((cell, i) => {
                    const isCurrentMonth = cell.getMonth() === calendarDate.getMonth();
                    const isPast = cell < today;
                    const isSelected = selectedDate?.toDateString() === cell.toDateString();
                    return (
                      <button
                        key={i}
                        disabled={!isCurrentMonth || isPast}
                        onClick={() => { setSelectedDate(cell); setSelectedSlot(null); }}
                        className={`py-2 text-sm rounded-lg transition-colors ${
                          !isCurrentMonth ? "text-gray-200"
                          : isPast ? "text-gray-300 cursor-not-allowed"
                          : isSelected ? "bg-[#0066FF] text-white font-semibold"
                          : "hover:bg-blue-50 text-gray-700"
                        }`}
                      >
                        {cell.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
              {selectedDate && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Horarios disponibles — {formatDate(selectedDate)}</h3>
                  {loadingSlots ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />)}
                    </div>
                  ) : !slotsData?.slots.length ? (
                    <p className="text-gray-500 text-sm">No hay horarios disponibles para este día.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slotsData.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 text-sm rounded-lg border-2 transition-colors ${
                            selectedSlot === slot
                              ? "border-[#0066FF] bg-[#0066FF] text-white"
                              : "border-gray-200 hover:border-[#0066FF] text-gray-700"
                          }`}
                        >
                          {formatTime(slot)}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedSlot && (
                    <button
                      onClick={() => setStep(3)}
                      className="mt-6 w-full sm:w-auto bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                    >
                      Continuar
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
                <ChevronLeft className="w-4 h-4" /> Volver
              </button>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{selectedType?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700 text-sm mt-1">
                  <Clock className="w-4 h-4" />
                  {selectedDate && formatDate(selectedDate)} a las {selectedSlot && formatTime(selectedSlot)}
                </div>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); bookMutation.mutate(); }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                      placeholder="Tu nombre" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                    placeholder="tu@correo.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuéntame algo (opcional)</label>
                  <textarea rows={3} value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF] resize-none"
                    placeholder="¿Cuál es tu situación principal? ¿Qué esperas de la sesión?" />
                </div>
                {bookMutation.isError && (
                  <p className="text-red-600 text-sm">{(bookMutation.error as Error).message || "Ocurrió un error. Intenta nuevamente."}</p>
                )}
                <button type="submit" disabled={bookMutation.isPending}
                  className="w-full bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
                  {bookMutation.isPending ? "Confirmando..." : "Confirmar reserva"}
                </button>
              </form>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva confirmada!</h2>
              <p className="text-gray-600 mb-2">
                Tu sesión de <strong>{selectedType?.name}</strong> está agendada para el{" "}
                <strong>{selectedDate && formatDate(selectedDate)}</strong> a las{" "}
                <strong>{selectedSlot && formatTime(selectedSlot)}</strong>.
              </p>
              {confirmedBookingId && (
                <p className="text-xs text-gray-400 mb-2">Referencia: {confirmedBookingId}</p>
              )}
              <p className="text-gray-500 text-sm mb-8">Te enviaremos un correo de confirmación a <strong>{form.email}</strong>.</p>
              <a href="/" className="inline-block bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold px-8 py-3 rounded-xl transition-colors">
                Volver al inicio
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
