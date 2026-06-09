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

function getCalendarClient(credentials: object) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
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
  const dateStr = date.toISOString().split("T")[0];
  for (const window of availability.slots) {
    const [endH, endM] = window.end.split(":").map(Number);
    let current = new Date(`${dateStr}T${window.start}:00`);
    const windowEnd = new Date(`${dateStr}T${window.end}:00`);
    windowEnd.setHours(endH, endM, 0, 0);
    while (current.getTime() + durationMinutes * 60000 <= windowEnd.getTime()) {
      const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
      const overlaps = existingBookings.some((b) => current < b.end && slotEnd > b.start);
      const isPast = current <= new Date();
      if (!overlaps && !isPast) slots.push(current.toISOString());
      current = new Date(current.getTime() + durationMinutes * 60000);
    }
  }
  return slots;
}

export const getSessionTypes = functions
  .region(REGION)
  .https.onCall(async () => {
    const snap = await db.collection("sessionTypes")
      .where("active", "==", true).orderBy("name").get();
    return { sessionTypes: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  });

export const getAvailableSlots = functions
  .region(REGION)
  .https.onCall(async (data: { date: string; sessionTypeId: string }) => {
    const { date, sessionTypeId } = data;
    if (!date || !sessionTypeId)
      throw new functions.https.HttpsError("invalid-argument", "date and sessionTypeId required");
    const sessionTypeDoc = await db.collection("sessionTypes").doc(sessionTypeId).get();
    if (!sessionTypeDoc.exists)
      throw new functions.https.HttpsError("not-found", "Session type not found");
    const sessionType = sessionTypeDoc.data() as SessionType;
    const targetDate = new Date(date + "T12:00:00");
    const dayOfWeek = targetDate.getDay().toString();
    const configDoc = await db.collection("config").doc("availability").get();
    if (!configDoc.exists) return { slots: [] };
    const availability = configDoc.data() as Record<string, DayAvailability>;
    const dayAvailability = availability[dayOfWeek];
    if (!dayAvailability?.enabled) return { slots: [] };
    const existingBookings = await getExistingBookings(targetDate);
    return { slots: generateSlots(targetDate, dayAvailability, sessionType.duration, existingBookings) };
  });

export const createBooking = functions
  .region(REGION)
  .runWith({ secrets: ["SENDGRID_API_KEY", "GOOGLE_CALENDAR_CREDENTIALS", "GOOGLE_CALENDAR_ID", "OWNER_EMAIL"] })
  .https.onCall(async (data: {
    sessionTypeId: string; clientName: string; clientEmail: string;
    startTime: string; notes?: string;
  }) => {
    const { sessionTypeId, clientName, clientEmail, startTime, notes } = data;
    if (!sessionTypeId || !clientName || !clientEmail || !startTime)
      throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    const sessionTypeDoc = await db.collection("sessionTypes").doc(sessionTypeId).get();
    if (!sessionTypeDoc.exists)
      throw new functions.https.HttpsError("not-found", "Session type not found");
    const sessionType = sessionTypeDoc.data() as SessionType;
    const start = new Date(startTime);
    const end = new Date(start.getTime() + sessionType.duration * 60000);
    const dayBookings = await getExistingBookings(start);
    if (dayBookings.some((b) => start < b.end && end > b.start))
      throw new functions.https.HttpsError("already-exists", "Slot no longer available");

    let googleEventId: string | undefined;
    try {
      const creds = JSON.parse(process.env.GOOGLE_CALENDAR_CREDENTIALS!);
      const calendar = getCalendarClient(creds);
      const event = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        requestBody: {
          summary: `${sessionType.name} — ${clientName}`,
          description: `Cliente: ${clientName}\nEmail: ${clientEmail}${notes ? `\nNotas: ${notes}` : ""}`,
          start: { dateTime: start.toISOString(), timeZone: "America/Santiago" },
          end: { dateTime: end.toISOString(), timeZone: "America/Santiago" },
          attendees: [{ email: clientEmail }],
          reminders: { useDefault: false, overrides: [{ method: "email", minutes: 1440 }, { method: "popup", minutes: 30 }] },
        },
      });
      googleEventId = event.data.id ?? undefined;
    } catch (err) { console.error("Google Calendar error:", err); }

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
  });

export const adminGetBookings = functions
  .region(REGION)
  .https.onCall(async (data: { status?: string; from?: string; to?: string }, context) => {
    if (!context.auth)
      throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    const { status, from, to } = data ?? {};
    let query: admin.firestore.Query = db.collection("bookings").orderBy("startTime", "desc");
    if (status) query = query.where("status", "==", status);
    if (from) query = query.where("startTime", ">=", admin.firestore.Timestamp.fromDate(new Date(from)));
    if (to) query = query.where("startTime", "<=", admin.firestore.Timestamp.fromDate(new Date(to)));
    const snap = await query.limit(200).get();
    return { bookings: snap.docs.map((d) => ({
      id: d.id, ...d.data(),
      startTime: (d.data().startTime as admin.firestore.Timestamp).toDate().toISOString(),
      endTime: (d.data().endTime as admin.firestore.Timestamp).toDate().toISOString(),
      createdAt: (d.data().createdAt as admin.firestore.Timestamp)?.toDate().toISOString(),
    })) };
  });

export const adminCancelBooking = functions
  .region(REGION)
  .runWith({ secrets: ["GOOGLE_CALENDAR_CREDENTIALS", "GOOGLE_CALENDAR_ID"] })
  .https.onCall(async (data: { bookingId: string }, context) => {
    if (!context.auth)
      throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    const { bookingId } = data;
    if (!bookingId)
      throw new functions.https.HttpsError("invalid-argument", "bookingId required");
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists)
      throw new functions.https.HttpsError("not-found", "Booking not found");
    const booking = bookingDoc.data() as Booking;
    await bookingRef.update({ status: "cancelled" });
    if (booking.googleEventId) {
      try {
        const creds = JSON.parse(process.env.GOOGLE_CALENDAR_CREDENTIALS!);
        await getCalendarClient(creds).events.delete({
          calendarId: process.env.GOOGLE_CALENDAR_ID!, eventId: booking.googleEventId,
        });
      } catch (err) { console.error("Failed to delete calendar event:", err); }
    }
    return { success: true };
  });

export const adminGetAvailability = functions
  .region(REGION)
  .https.onCall(async (_data, context) => {
    if (!context.auth)
      throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    const doc = await db.collection("config").doc("availability").get();
    if (!doc.exists) {
      const defaultAvailability: Record<string, DayAvailability> = {};
      for (let i = 0; i <= 6; i++) {
        defaultAvailability[i.toString()] = {
          enabled: i >= 1 && i <= 5,
          slots: i >= 1 && i <= 5 ? [{ start: "09:00", end: "18:00" }] : [],
        };
      }
      return { availability: defaultAvailability };
    }
    return { availability: doc.data() };
  });

export const adminUpdateAvailability = functions
  .region(REGION)
  .https.onCall(async (data: { availability: Record<string, DayAvailability> }, context) => {
    if (!context.auth)
      throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    const { availability } = data;
    if (!availability)
      throw new functions.https.HttpsError("invalid-argument", "availability required");
    await db.collection("config").doc("availability").set(availability);
    return { success: true };
  });

export const adminGetSessionTypes = functions
  .region(REGION)
  .https.onCall(async (_data, context) => {
    if (!context.auth)
      throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    const snap = await db.collection("sessionTypes").orderBy("name").get();
    return { sessionTypes: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  });

export const adminCreateSessionType = functions
  .region(REGION)
  .https.onCall(async (data: Omit<SessionType, "id">, context) => {
    if (!context.auth)
      throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    if (!data.name || !data.duration)
      throw new functions.https.HttpsError("invalid-argument", "name and duration required");
    const ref = await db.collection("sessionTypes").add({
      name: data.name, description: data.description ?? "",
      duration: data.duration, price: data.price ?? null, active: data.active ?? true,
    });
    return { id: ref.id };
  });

export const adminUpdateSessionType = functions
  .region(REGION)
  .https.onCall(async (data: SessionType, context) => {
    if (!context.auth)
      throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    const { id, ...rest } = data;
    if (!id)
      throw new functions.https.HttpsError("invalid-argument", "id required");
    await db.collection("sessionTypes").doc(id).update(rest);
    return { success: true };
  });

export const adminDeleteSessionType = functions
  .region(REGION)
  .https.onCall(async (data: { id: string }, context) => {
    if (!context.auth)
      throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    const { id } = data;
    if (!id)
      throw new functions.https.HttpsError("invalid-argument", "id required");
    await db.collection("sessionTypes").doc(id).delete();
    return { success: true };
  });
