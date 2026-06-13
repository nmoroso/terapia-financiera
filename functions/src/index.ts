import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import sgMail from "@sendgrid/mail";

admin.initializeApp();
const db = admin.firestore();
const REGION = "southamerica-east1";

interface TimeSlot { start: string; end: string; }
interface DayAvailability { enabled: boolean; slots: TimeSlot[]; }
interface SessionType {
  id?: string; name: string; description: string;
  duration: number; price?: number; active: boolean;
}
interface Booking {
  sessionTypeId: string; sessionTypeName: string; sessionTypeDuration: number;
  clientName: string; clientEmail: string; notes?: string;
  startTime: admin.firestore.Timestamp; endTime: admin.firestore.Timestamp;
  status: "confirmed" | "cancelled"; googleEventId?: string;
  createdAt: admin.firestore.Timestamp;
}

function setCors(res: functions.Response) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

async function getUid(req: functions.https.Request): Promise<string | undefined> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  try {
    const decoded = await admin.auth().verifyIdToken(header.split("Bearer ")[1]);
    return decoded.uid;
  } catch { return undefined; }
}

function handle(
  req: functions.https.Request,
  res: functions.Response,
  requireAuth: boolean,
  handler: (data: unknown, uid?: string) => Promise<unknown>
) {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  getUid(req).then(async (uid) => {
    if (requireAuth && !uid) { res.status(401).json({ error: "Unauthenticated" }); return; }
    try {
      const result = await handler(req.body, uid);
      res.json(result);
    } catch (err: unknown) {
      console.error("Handler error:", err);
      const msg = err instanceof Error ? err.message : "Internal error";
      res.status(400).json({ error: msg });
    }
  });
}

function getCalendarClient(credentials: object) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

// Converts a date+time string ("HH:MM") interpreted as America/Santiago into a UTC Date
function santiagoToUtc(dateStr: string, timeStr: string): Date {
  const naive = new Date(`${dateStr}T${timeStr}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago",
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric",
    hour12: false,
  }).formatToParts(naive);
  const p: Record<string, string> = {};
  parts.forEach(({ type, value }) => { p[type] = value; });
  const santiagoNaive = new Date(
    `${p.year}-${p.month.padStart(2, "0")}-${p.day.padStart(2, "0")}T` +
    `${p.hour.padStart(2, "0")}:${p.minute.padStart(2, "0")}:${p.second.padStart(2, "0")}Z`
  );
  return new Date(naive.getTime() + (naive.getTime() - santiagoNaive.getTime()));
}

async function getExistingBookings(date: Date): Promise<{ start: Date; end: Date }[]> {
  const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);
  const snap = await db.collection("bookings")
    .where("startTime", ">=", admin.firestore.Timestamp.fromDate(startOfDay))
    .where("startTime", "<=", admin.firestore.Timestamp.fromDate(endOfDay))
    .where("status", "==", "confirmed").get();
  return snap.docs.map((d) => {
    const data = d.data() as Booking;
    return { start: data.startTime.toDate(), end: data.endTime.toDate() };
  });
}

function generateSlots(
  date: Date, availability: DayAvailability,
  durationMinutes: number, existingBookings: { start: Date; end: Date }[]
): string[] {
  const slots: string[] = [];
  const dateStr = date.toLocaleString("en-CA", { timeZone: "America/Santiago" }).split(",")[0].trim();
  for (const window of availability.slots) {
    let current = santiagoToUtc(dateStr, window.start);
    const windowEnd = santiagoToUtc(dateStr, window.end);
    while (current.getTime() + durationMinutes * 60000 <= windowEnd.getTime()) {
      const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
      const overlaps = existingBookings.some((b) => current < b.end && slotEnd > b.start);
      if (!overlaps && current > new Date()) slots.push(current.toISOString());
      current = new Date(current.getTime() + durationMinutes * 60000);
    }
  }
  return slots;
}

export const getSessionTypes = functions.region(REGION).https.onRequest((req, res) =>
  handle(req, res, false, async () => {
    const snap = await db.collection("sessionTypes").get();
    const sessionTypes = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as SessionType) }))
      .filter((d) => d.active)
      .sort((a, b) => a.name.localeCompare(b.name));
    return { sessionTypes };
  })
);

export const getAvailableSlots = functions.region(REGION).https.onRequest((req, res) =>
  handle(req, res, false, async (data) => {
    const { date, sessionTypeId } = data as { date: string; sessionTypeId: string };
    if (!date || !sessionTypeId) throw new Error("date and sessionTypeId required");
    const sessionTypeDoc = await db.collection("sessionTypes").doc(sessionTypeId).get();
    if (!sessionTypeDoc.exists) throw new Error("Session type not found");
    const sessionType = sessionTypeDoc.data() as SessionType;
    const targetDate = santiagoToUtc(date, "12:00");
    const dayOfWeek = new Date(targetDate.toLocaleString("en-US", { timeZone: "America/Santiago" })).getDay().toString();
    const configDoc = await db.collection("config").doc("availability").get();
    if (!configDoc.exists) return { slots: [] };
    const availability = configDoc.data() as Record<string, DayAvailability>;
    const dayAvailability = availability[dayOfWeek];
    if (!dayAvailability?.enabled) return { slots: [] };
    const existingBookings = await getExistingBookings(targetDate);
    return { slots: generateSlots(targetDate, dayAvailability, sessionType.duration, existingBookings) };
  })
);

export const createBooking = functions.region(REGION)
  .runWith({ secrets: ["SENDGRID_API_KEY", "GOOGLE_CALENDAR_CREDENTIALS", "GOOGLE_CALENDAR_ID", "OWNER_EMAIL"] })
  .https.onRequest((req, res) =>
    handle(req, res, false, async (data) => {
      const { sessionTypeId, clientName, clientEmail, startTime, notes } = data as {
        sessionTypeId: string; clientName: string; clientEmail: string;
        startTime: string; notes?: string;
      };
      if (!sessionTypeId || !clientName || !clientEmail || !startTime)
        throw new Error("Missing required fields");
      const sessionTypeDoc = await db.collection("sessionTypes").doc(sessionTypeId).get();
      if (!sessionTypeDoc.exists) throw new Error("Session type not found");
      const sessionType = sessionTypeDoc.data() as SessionType;
      const start = new Date(startTime);
      const end = new Date(start.getTime() + sessionType.duration * 60000);
      const dayBookings = await getExistingBookings(start);
      if (dayBookings.some((b) => start < b.end && end > b.start))
        throw new Error("Slot no longer available");

      let googleEventId: string | undefined;
      try {
        const creds = JSON.parse(process.env.GOOGLE_CALENDAR_CREDENTIALS!);
        const event = await getCalendarClient(creds).events.insert({
          calendarId: process.env.GOOGLE_CALENDAR_ID!,
          requestBody: {
            summary: `${sessionType.name} — ${clientName}`,
            description: `Cliente: ${clientName}\nEmail: ${clientEmail}${notes ? `\nNotas: ${notes}` : ""}`,
            start: { dateTime: start.toISOString(), timeZone: "America/Santiago" },
            end: { dateTime: end.toISOString(), timeZone: "America/Santiago" },
          },
        });
        googleEventId = event.data.id ?? undefined;
        console.log("Calendar: event created", googleEventId);
      } catch (err) { console.error("Calendar error:", err); }

      const bookingRef = await db.collection("bookings").add({
        sessionTypeId, sessionTypeName: sessionType.name,
        sessionTypeDuration: sessionType.duration,
        clientName, clientEmail, notes: notes ?? "",
        startTime: admin.firestore.Timestamp.fromDate(start),
        endTime: admin.firestore.Timestamp.fromDate(end),
        status: "confirmed", googleEventId: googleEventId ?? null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
        const ownerEmail = process.env.OWNER_EMAIL!;
        const dateStr = start.toLocaleString("es-CL", {
          timeZone: "America/Santiago", weekday: "long", year: "numeric",
          month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
        await sgMail.send({
          to: clientEmail,
          from: { email: ownerEmail, name: "Terapia Financiera" },
          subject: `Reserva confirmada: ${sessionType.name}`,
          html: `<h2>¡Tu sesión está confirmada!</h2><p>Hola <strong>${clientName}</strong>,</p><p>Tu sesión de <strong>${sessionType.name}</strong> ha sido agendada para el <strong>${dateStr}</strong>.</p><p>Duración: ${sessionType.duration} minutos.</p>${notes ? `<p>Notas: ${notes}</p>` : ""}<p>Si necesitas cancelar o reagendar, contáctanos.</p><p><strong>Terapia Financiera</strong></p>`,
        });
        await sgMail.send({
          to: ownerEmail,
          from: { email: ownerEmail, name: "Terapia Financiera" },
          subject: `Nueva reserva: ${sessionType.name} — ${clientName}`,
          html: `<h2>Nueva reserva recibida</h2><p><strong>Servicio:</strong> ${sessionType.name}</p><p><strong>Cliente:</strong> ${clientName}</p><p><strong>Email:</strong> ${clientEmail}</p><p><strong>Fecha:</strong> ${dateStr}</p>${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ""}`,
        });
      } catch (err) { console.error("SendGrid error:", err); }

      return { bookingId: bookingRef.id };
    })
  );

export const adminGetBookings = functions.region(REGION).https.onRequest((req, res) =>
  handle(req, res, true, async (data) => {
    const { status, from, to } = (data ?? {}) as { status?: string; from?: string; to?: string };
    let query: admin.firestore.Query = db.collection("bookings").orderBy("startTime", "desc");
    if (from) query = query.where("startTime", ">=", admin.firestore.Timestamp.fromDate(new Date(from)));
    if (to) query = query.where("startTime", "<=", admin.firestore.Timestamp.fromDate(new Date(to)));
    const snap = await query.limit(200).get();
    const bookings = snap.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as Booking),
        startTime: (d.data().startTime as admin.firestore.Timestamp).toDate().toISOString(),
        endTime: (d.data().endTime as admin.firestore.Timestamp).toDate().toISOString(),
        createdAt: (d.data().createdAt as admin.firestore.Timestamp)?.toDate().toISOString(),
      }))
      .filter((b) => !status || b.status === status);
    return { bookings };
  })
);

export const adminCancelBooking = functions.region(REGION)
  .runWith({ secrets: ["GOOGLE_CALENDAR_CREDENTIALS", "GOOGLE_CALENDAR_ID", "SENDGRID_API_KEY", "OWNER_EMAIL"] })
  .https.onRequest((req, res) =>
    handle(req, res, true, async (data) => {
      const { bookingId } = data as { bookingId: string };
      if (!bookingId) throw new Error("bookingId required");
      const bookingRef = db.collection("bookings").doc(bookingId);
      const bookingDoc = await bookingRef.get();
      if (!bookingDoc.exists) throw new Error("Booking not found");
      const booking = bookingDoc.data() as Booking;
      await bookingRef.update({ status: "cancelled" });

      if (booking.googleEventId) {
        try {
          const creds = JSON.parse(process.env.GOOGLE_CALENDAR_CREDENTIALS!);
          await getCalendarClient(creds).events.delete({
            calendarId: process.env.GOOGLE_CALENDAR_ID!, eventId: booking.googleEventId,
          });
        } catch (err) { console.error("Calendar delete error:", err); }
      }

      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
        const ownerEmail = process.env.OWNER_EMAIL!;
        const dateStr = booking.startTime.toDate().toLocaleString("es-CL", {
          timeZone: "America/Santiago", weekday: "long", year: "numeric",
          month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
        await sgMail.send({
          to: booking.clientEmail,
          from: { email: ownerEmail, name: "Terapia Financiera" },
          subject: `Sesión cancelada: ${booking.sessionTypeName}`,
          html: `<h2>Tu sesión ha sido cancelada</h2><p>Hola <strong>${booking.clientName}</strong>,</p><p>Tu sesión de <strong>${booking.sessionTypeName}</strong> del <strong>${dateStr}</strong> ha sido cancelada.</p><p>Si deseas reagendar, puedes hacerlo en nuestra página.</p><p><strong>Terapia Financiera</strong></p>`,
        });
      } catch (err) { console.error("SendGrid cancellation email error:", err); }

      return { success: true };
    })
  );

export const adminGetAvailability = functions.region(REGION).https.onRequest((req, res) =>
  handle(req, res, true, async () => {
    const doc = await db.collection("config").doc("availability").get();
    if (!doc.exists) {
      const def: Record<string, DayAvailability> = {};
      for (let i = 0; i <= 6; i++) {
        def[i.toString()] = { enabled: i >= 1 && i <= 5, slots: i >= 1 && i <= 5 ? [{ start: "09:00", end: "18:00" }] : [] };
      }
      return { availability: def };
    }
    return { availability: doc.data() };
  })
);

export const adminUpdateAvailability = functions.region(REGION).https.onRequest((req, res) =>
  handle(req, res, true, async (data) => {
    const { availability } = data as { availability: Record<string, DayAvailability> };
    if (!availability) throw new Error("availability required");
    await db.collection("config").doc("availability").set(availability);
    return { success: true };
  })
);

export const adminGetSessionTypes = functions.region(REGION).https.onRequest((req, res) =>
  handle(req, res, true, async () => {
    const snap = await db.collection("sessionTypes").get();
    const sessionTypes = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as SessionType) }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { sessionTypes };
  })
);

export const adminCreateSessionType = functions.region(REGION).https.onRequest((req, res) =>
  handle(req, res, true, async (data) => {
    const d = data as Omit<SessionType, "id">;
    if (!d.name || !d.duration) throw new Error("name and duration required");
    const ref = await db.collection("sessionTypes").add({
      name: d.name, description: d.description ?? "",
      duration: d.duration, price: d.price ?? null, active: d.active ?? true,
    });
    return { id: ref.id };
  })
);

export const adminUpdateSessionType = functions.region(REGION).https.onRequest((req, res) =>
  handle(req, res, true, async (data) => {
    const { id, ...rest } = data as SessionType;
    if (!id) throw new Error("id required");
    await db.collection("sessionTypes").doc(id).update(rest);
    return { success: true };
  })
);

export const adminDeleteSessionType = functions.region(REGION).https.onRequest((req, res) =>
  handle(req, res, true, async (data) => {
    const { id } = data as { id: string };
    if (!id) throw new Error("id required");
    await db.collection("sessionTypes").doc(id).delete();
    return { success: true };
  })
);
