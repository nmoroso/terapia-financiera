import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import sgMail from "@sendgrid/mail";

admin.initializeApp();
const db = admin.firestore();

const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const GOOGLE_CALENDAR_CREDENTIALS = defineSecret("GOOGLE_CALENDAR_CREDENTIALS");
const GOOGLE_CALENDAR_ID = defineSecret("GOOGLE_CALENDAR_ID");
const OWNER_EMAIL = defineSecret("OWNER_EMAIL");

// ── Types ─────────────────────────────────────────────────────────────────────

interface TimeSlot {
  start: string; // "HH:MM"
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

interface SessionType {
  id?: string;
  name: string;
  description: string;
  duration: number; // minutes
  price?: number;
  active: boolean;
}

interface Booking {
  sessionTypeId: string;
  sessionTypeName: string;
  sessionTypeDuration: number;
  clientName: string;
  clientEmail: string;
  notes?: string;
  startTime: admin.firestore.Timestamp;
  endTime: admin.firestore.Timestamp;
  status: "confirmed" | "cancelled";
  googleEventId?: string;
  createdAt: admin.firestore.Timestamp;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCalendarClient(credentials: object) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

async function getExistingBookings(
  date: Date
): Promise<{ start: Date; end: Date }[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const snap = await db
    .collection("bookings")
    .where("startTime", ">=", admin.firestore.Timestamp.fromDate(startOfDay))
    .where("startTime", "<=", admin.firestore.Timestamp.fromDate(endOfDay))
    .where("status", "==", "confirmed")
    .get();

  return snap.docs.map((d) => {
    const data = d.data() as Booking;
    return {
      start: data.startTime.toDate(),
      end: data.endTime.toDate(),
    };
  });
}

function generateSlots(
  date: Date,
  availability: DayAvailability,
  durationMinutes: number,
  existingBookings: { start: Date; end: Date }[]
): string[] {
  const slots: string[] = [];
  const dateStr = date.toISOString().split("T")[0];

  for (const window of availability.slots) {
    const [startH, startM] = window.start.split(":").map(Number);
    const [endH, endM] = window.end.split(":").map(Number);

    let current = new Date(`${dateStr}T${window.start}:00`);
    const windowEnd = new Date(`${dateStr}T${window.end}:00`);

    // Adjust for timezone — keep simple, use local interpretation
    current.setHours(startH, startM, 0, 0);
    windowEnd.setHours(endH, endM, 0, 0);

    while (current.getTime() + durationMinutes * 60000 <= windowEnd.getTime()) {
      const slotEnd = new Date(current.getTime() + durationMinutes * 60000);

      const overlaps = existingBookings.some(
        (b) => current < b.end && slotEnd > b.start
      );

      // Also skip past slots
      const now = new Date();
      const isPast = current <= now;

      if (!overlaps && !isPast) {
        slots.push(current.toISOString());
      }

      current = new Date(current.getTime() + durationMinutes * 60000);
    }
  }

  return slots;
}

// ── Public: Get Available Slots ───────────────────────────────────────────────

export const getAvailableSlots = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    const { date, sessionTypeId } = request.data as {
      date: string;
      sessionTypeId: string;
    };

    if (!date || !sessionTypeId) {
      throw new HttpsError("invalid-argument", "date and sessionTypeId required");
    }

    const sessionTypeDoc = await db
      .collection("sessionTypes")
      .doc(sessionTypeId)
      .get();
    if (!sessionTypeDoc.exists) {
      throw new HttpsError("not-found", "Session type not found");
    }
    const sessionType = sessionTypeDoc.data() as SessionType;

    const targetDate = new Date(date + "T12:00:00"); // noon to avoid DST issues
    const dayOfWeek = targetDate.getDay().toString(); // 0=Sun

    const configDoc = await db.collection("config").doc("availability").get();
    if (!configDoc.exists) {
      return { slots: [] };
    }

    const availability = configDoc.data() as Record<string, DayAvailability>;
    const dayAvailability = availability[dayOfWeek];

    if (!dayAvailability?.enabled) {
      return { slots: [] };
    }

    const existingBookings = await getExistingBookings(targetDate);
    const slots = generateSlots(
      targetDate,
      dayAvailability,
      sessionType.duration,
      existingBookings
    );

    return { slots };
  }
);

// ── Public: Create Booking ────────────────────────────────────────────────────

export const createBooking = onCall(
  {
    region: "southamerica-east1",
    secrets: [SENDGRID_API_KEY, GOOGLE_CALENDAR_CREDENTIALS, GOOGLE_CALENDAR_ID, OWNER_EMAIL],
  },
  async (request) => {
    const { sessionTypeId, clientName, clientEmail, startTime, notes } =
      request.data as {
        sessionTypeId: string;
        clientName: string;
        clientEmail: string;
        startTime: string;
        notes?: string;
      };

    if (!sessionTypeId || !clientName || !clientEmail || !startTime) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const sessionTypeDoc = await db
      .collection("sessionTypes")
      .doc(sessionTypeId)
      .get();
    if (!sessionTypeDoc.exists) {
      throw new HttpsError("not-found", "Session type not found");
    }
    const sessionType = sessionTypeDoc.data() as SessionType;

    const start = new Date(startTime);
    const end = new Date(start.getTime() + sessionType.duration * 60000);

    // Check slot still available
    const dayBookings = await getExistingBookings(start);
    const conflict = dayBookings.some(
      (b) => start < b.end && end > b.start
    );
    if (conflict) {
      throw new HttpsError("already-exists", "Slot no longer available");
    }

    // Create Google Calendar event
    let googleEventId: string | undefined;
    try {
      const creds = JSON.parse(GOOGLE_CALENDAR_CREDENTIALS.value());
      const calendar = getCalendarClient(creds);
      const event = await calendar.events.insert({
        calendarId: GOOGLE_CALENDAR_ID.value(),
        requestBody: {
          summary: `${sessionType.name} — ${clientName}`,
          description: `Cliente: ${clientName}\nEmail: ${clientEmail}${notes ? `\nNotas: ${notes}` : ""}`,
          start: { dateTime: start.toISOString(), timeZone: "America/Santiago" },
          end: { dateTime: end.toISOString(), timeZone: "America/Santiago" },
          attendees: [{ email: clientEmail }],
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 1440 },
              { method: "popup", minutes: 30 },
            ],
          },
        },
      });
      googleEventId = event.data.id ?? undefined;
    } catch (err) {
      console.error("Google Calendar error:", err);
    }

    // Save booking
    const bookingRef = await db.collection("bookings").add({
      sessionTypeId,
      sessionTypeName: sessionType.name,
      sessionTypeDuration: sessionType.duration,
      clientName,
      clientEmail,
      notes: notes ?? "",
      startTime: admin.firestore.Timestamp.fromDate(start),
      endTime: admin.firestore.Timestamp.fromDate(end),
      status: "confirmed",
      googleEventId: googleEventId ?? null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send confirmation emails
    try {
      sgMail.setApiKey(SENDGRID_API_KEY.value());
      const dateStr = start.toLocaleString("es-CL", {
        timeZone: "America/Santiago",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      await sgMail.send({
        to: clientEmail,
        from: { email: OWNER_EMAIL.value(), name: "Terapia Financiera" },
        subject: `Reserva confirmada: ${sessionType.name}`,
        html: `
          <h2>¡Tu sesión está confirmada!</h2>
          <p>Hola <strong>${clientName}</strong>,</p>
          <p>Tu sesión de <strong>${sessionType.name}</strong> ha sido agendada para el <strong>${dateStr}</strong>.</p>
          <p>Duración: ${sessionType.duration} minutos.</p>
          ${notes ? `<p>Notas: ${notes}</p>` : ""}
          <p>Si necesitas cancelar o reagendar, contáctanos a <a href="mailto:hola@terapiafinanciera.cl">hola@terapiafinanciera.cl</a>.</p>
          <br/>
          <p>¡Nos vemos pronto!</p>
          <p><strong>Terapia Financiera</strong></p>
        `,
      });

      // Notify owner
      await sgMail.send({
        to: OWNER_EMAIL.value(),
        from: { email: OWNER_EMAIL.value(), name: "Terapia Financiera" },
        subject: `Nueva reserva: ${sessionType.name} — ${clientName}`,
        html: `
          <h2>Nueva reserva recibida</h2>
          <p><strong>Servicio:</strong> ${sessionType.name}</p>
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>Email:</strong> ${clientEmail}</p>
          <p><strong>Fecha:</strong> ${dateStr}</p>
          ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ""}
        `,
      });
    } catch (err) {
      console.error("SendGrid error:", err);
    }

    return { bookingId: bookingRef.id };
  }
);

// ── Admin: List Bookings ──────────────────────────────────────────────────────

export const adminGetBookings = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    const { status, from, to } = (request.data ?? {}) as {
      status?: string;
      from?: string;
      to?: string;
    };

    let query: admin.firestore.Query = db
      .collection("bookings")
      .orderBy("startTime", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }
    if (from) {
      query = query.where(
        "startTime",
        ">=",
        admin.firestore.Timestamp.fromDate(new Date(from))
      );
    }
    if (to) {
      query = query.where(
        "startTime",
        "<=",
        admin.firestore.Timestamp.fromDate(new Date(to))
      );
    }

    const snap = await query.limit(200).get();
    const bookings = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      startTime: (d.data().startTime as admin.firestore.Timestamp).toDate().toISOString(),
      endTime: (d.data().endTime as admin.firestore.Timestamp).toDate().toISOString(),
      createdAt: (d.data().createdAt as admin.firestore.Timestamp)?.toDate().toISOString(),
    }));

    return { bookings };
  }
);

// ── Admin: Cancel Booking ─────────────────────────────────────────────────────

export const adminCancelBooking = onCall(
  {
    region: "southamerica-east1",
    secrets: [GOOGLE_CALENDAR_CREDENTIALS, GOOGLE_CALENDAR_ID],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    const { bookingId } = request.data as { bookingId: string };
    if (!bookingId) throw new HttpsError("invalid-argument", "bookingId required");

    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) throw new HttpsError("not-found", "Booking not found");

    const booking = bookingDoc.data() as Booking;

    await bookingRef.update({ status: "cancelled" });

    if (booking.googleEventId) {
      try {
        const creds = JSON.parse(GOOGLE_CALENDAR_CREDENTIALS.value());
        const calendar = getCalendarClient(creds);
        await calendar.events.delete({
          calendarId: GOOGLE_CALENDAR_ID.value(),
          eventId: booking.googleEventId,
        });
      } catch (err) {
        console.error("Failed to delete calendar event:", err);
      }
    }

    return { success: true };
  }
);

// ── Admin: Availability ───────────────────────────────────────────────────────

export const adminGetAvailability = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

    const doc = await db.collection("config").doc("availability").get();
    if (!doc.exists) {
      // Return default: Mon–Fri 9–18
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
  }
);

export const adminUpdateAvailability = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

    const { availability } = request.data as {
      availability: Record<string, DayAvailability>;
    };
    if (!availability) throw new HttpsError("invalid-argument", "availability required");

    await db.collection("config").doc("availability").set(availability);
    return { success: true };
  }
);

// ── Admin: Session Types ──────────────────────────────────────────────────────

export const adminGetSessionTypes = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

    const snap = await db.collection("sessionTypes").orderBy("name").get();
    const types = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { sessionTypes: types };
  }
);

export const getSessionTypes = onCall(
  { region: "southamerica-east1" },
  async () => {
    const snap = await db
      .collection("sessionTypes")
      .where("active", "==", true)
      .orderBy("name")
      .get();
    const types = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { sessionTypes: types };
  }
);

export const adminCreateSessionType = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

    const data = request.data as Omit<SessionType, "id">;
    if (!data.name || !data.duration) {
      throw new HttpsError("invalid-argument", "name and duration required");
    }

    const ref = await db.collection("sessionTypes").add({
      name: data.name,
      description: data.description ?? "",
      duration: data.duration,
      price: data.price ?? null,
      active: data.active ?? true,
    });
    return { id: ref.id };
  }
);

export const adminUpdateSessionType = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

    const { id, ...data } = request.data as SessionType;
    if (!id) throw new HttpsError("invalid-argument", "id required");

    await db.collection("sessionTypes").doc(id).update(data);
    return { success: true };
  }
);

export const adminDeleteSessionType = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Must be authenticated");

    const { id } = request.data as { id: string };
    if (!id) throw new HttpsError("invalid-argument", "id required");

    await db.collection("sessionTypes").doc(id).delete();
    return { success: true };
  }
);
