import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import type { SessionType, Booking, DayAvailability } from "../types/booking";

export const api = {
  getSessionTypes: () =>
    httpsCallable<void, { sessionTypes: SessionType[] }>(functions, "getSessionTypes")(),

  getAvailableSlots: (date: string, sessionTypeId: string) =>
    httpsCallable<unknown, { slots: string[] }>(functions, "getAvailableSlots")({
      date,
      sessionTypeId,
    }),

  createBooking: (data: {
    sessionTypeId: string;
    clientName: string;
    clientEmail: string;
    startTime: string;
    notes?: string;
  }) => httpsCallable<unknown, { bookingId: string }>(functions, "createBooking")(data),

  // Admin
  adminGetBookings: (filters?: { status?: string; from?: string; to?: string }) =>
    httpsCallable<unknown, { bookings: Booking[] }>(functions, "adminGetBookings")(filters ?? {}),

  adminCancelBooking: (bookingId: string) =>
    httpsCallable<unknown, { success: boolean }>(functions, "adminCancelBooking")({ bookingId }),

  adminGetAvailability: () =>
    httpsCallable<void, { availability: Record<string, DayAvailability> }>(
      functions,
      "adminGetAvailability"
    )(),

  adminUpdateAvailability: (availability: Record<string, DayAvailability>) =>
    httpsCallable<unknown, { success: boolean }>(functions, "adminUpdateAvailability")({
      availability,
    }),

  adminGetSessionTypes: () =>
    httpsCallable<void, { sessionTypes: SessionType[] }>(functions, "adminGetSessionTypes")(),

  adminCreateSessionType: (data: Omit<SessionType, "id">) =>
    httpsCallable<unknown, { id: string }>(functions, "adminCreateSessionType")(data),

  adminUpdateSessionType: (data: SessionType) =>
    httpsCallable<unknown, { success: boolean }>(functions, "adminUpdateSessionType")(data),

  adminDeleteSessionType: (id: string) =>
    httpsCallable<unknown, { success: boolean }>(functions, "adminDeleteSessionType")({ id }),
};
