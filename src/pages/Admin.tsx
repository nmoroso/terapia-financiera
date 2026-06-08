import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LogOut, Calendar, Settings, BookOpen, Trash2, XCircle, Plus, Check, X } from "lucide-react";
import { auth } from "../firebase";
import { api } from "../lib/api";
import type { SessionType, DayAvailability } from "../types/booking";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

type Tab = "bookings" | "availability" | "services";

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
