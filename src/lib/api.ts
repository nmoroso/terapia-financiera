import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import type { SessionType, Booking, DayAvailability } from "../types/booking";

async function call<T>(name: string, data?: unknown): Promise<{ data: T }> {
  const res = await fetch(`/api/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data ?? {}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return { data: json as T };
}

async function callAdmin<T>(name: string, data?: unknown): Promise<{ data: T }> {
  const auth = getAuth(app);
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`/api/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data ?? {}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return { data: json as T };
}

export const api = {
  getSessionTypes: () =>
    call<{ sessionTypes: SessionType[] }>("getSessionTypes"),

  getAvailableSlots: (date: string, sessionTypeId: string) =>
    call<{ slots: string[] }>("getAvailableSlots", { date, sessionTypeId }),

  createBooking: (data: {
    sessionTypeId: string;
    clientName: string;
    clientEmail: string;
    startTime: string;
    notes?: string;
  }) => call<{ bookingId: string }>("createBooking", data),

  adminGetBookings: (filters?: { status?: string; from?: string; to?: string }) =>
    callAdmin<{ bookings: Booking[] }>("adminGetBookings", filters ?? {}),

  adminCancelBooking: (bookingId: string) =>
    callAdmin<{ success: boolean }>("adminCancelBooking", { bookingId }),

  adminGetAvailability: () =>
    callAdmin<{ availability: Record<string, DayAvailability> }>("adminGetAvailability"),

  adminUpdateAvailability: (availability: Record<string, DayAvailability>) =>
    callAdmin<{ success: boolean }>("adminUpdateAvailability", { availability }),

  adminGetSessionTypes: () =>
    callAdmin<{ sessionTypes: SessionType[] }>("adminGetSessionTypes"),

  adminCreateSessionType: (data: Omit<SessionType, "id">) =>
    callAdmin<{ id: string }>("adminCreateSessionType", data),

  adminUpdateSessionType: (data: SessionType) =>
    callAdmin<{ success: boolean }>("adminUpdateSessionType", data),

  adminDeleteSessionType: (id: string) =>
    callAdmin<{ success: boolean }>("adminDeleteSessionType", { id }),
};
