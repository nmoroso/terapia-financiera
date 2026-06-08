export interface TimeSlot {
  start: string;
  end: string;
}

export interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

export interface SessionType {
  id: string;
  name: string;
  description: string;
  duration: number;
  price?: number;
  active: boolean;
}

export interface Booking {
  id: string;
  sessionTypeId: string;
  sessionTypeName: string;
  sessionTypeDuration: number;
  clientName: string;
  clientEmail: string;
  notes?: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "cancelled";
  googleEventId?: string;
  createdAt?: string;
}
