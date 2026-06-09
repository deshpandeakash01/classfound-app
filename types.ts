// --- DATABASE TYPES ---

export interface Room {
  id: number;           // int4
  room_name: string;    // text
  block_name: string;   // text
  capacity: number;     // int4
  room_type: string;    // text (likely nullable in DB)
}

export interface Schedule {
  id: number;           // int4
  room_id: number;      // int4 (Foreign Key to rooms.id)
  day_of_week: number;  // int4
  start_time: string;   // time (Supabase returns time as a string "HH:MM:SS")
  end_time: string;     // time
  subject_name: string; // text
  section_name: string; // text
}

export interface Profile {
  id: string;           // uuid (Foreign Key to auth.users.id)
  email: string;        // text
  full_name: string;    // text
  role: string;         // text
  created_at: string;   // timestamptz
}

export interface Booking {
  id: string;               // uuid
  room_id: number;          // int8 (Wait! Your schema says int8 here, which TypeScript treats as a number, but Supabase sometimes returns int8 as a string to prevent precision loss. Using number is safe for now).
  booked_by: string;        // uuid (Foreign Key to profiles.id)
  booking_date: string;     // date (Returns as string "YYYY-MM-DD")
  start_time: string;       // time
  end_time: string;         // time
  purpose: string;          // text
  status: string;           // booking_status (Custom enum, handled as string)
  section_name: string;     // text
  created_at: string;       // timestamptz
  assigned_faculty: string; // uuid
}