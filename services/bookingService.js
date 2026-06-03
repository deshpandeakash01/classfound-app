// services/bookingService.js

import { supabase } from "../supabase";

/**
 * Fetch the currently authenticated user's profile.
 *
 * @returns {Promise<{ user: Object, profile: Object }>}
 */
export async function getCurrentUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return { user, profile };
}

/**
 * Create a new room booking.
 *
 * Faculty:
 *  - Can create approved or pending bookings
 *  - Automatically inserted as approved
 *
 * CR:
 *  - Can create only pending bookings
 *
 * Students:
 *  - Cannot create bookings
 *
 * @param {Object} params
 * @param {number} params.roomId
 * @param {string} params.bookingDate - YYYY-MM-DD
 * @param {string} params.startTime - HH:mm:ss
 * @param {string} params.endTime - HH:mm:ss
 * @param {string} params.purpose
 * @param {string|null} params.sectionName
 *
 * @returns {Promise<Object>}
 */
export async function createBooking({
  roomId,
  bookingDate,
  startTime,
  endTime,
  purpose,
  sectionName,
  assignedFaculty,
}) {
  try {
    const { user, profile } = await getCurrentUserProfile();

    let bookingStatus;

    if (profile.role === "faculty") {
      bookingStatus = "approved";
    } else if (profile.role === "cr") {
      bookingStatus = "pending";
    } else {
      throw new Error("You do not have permission to create bookings");
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          room_id: roomId,
          booked_by: user.id,
          assigned_faculty: assignedFaculty,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          purpose,
          status: bookingStatus,
          section_name: sectionName ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Get all bookings created by the current user.
 *
 * Includes room details.
 *
 * @returns {Promise<Array>}
 */
export async function getMyBookings() {
  try {
    const { user, profile } = await getCurrentUserProfile();

    let query = supabase.from("bookings").select(`
      id,
      booking_date,
      start_time,
      end_time,
      purpose,
      status,
      section_name,
      created_at,
      booked_by,
      assigned_faculty,

      rooms (
        room_name,
        block_name,
        room_type
      ),

      booker:profiles!bookings_booked_by_fkey (
        full_name,
        email,
        role
      )
    `);

    // --------------------------------------------
    // Student / CR
    // --------------------------------------------

    if (profile.role === "student" || profile.role === "cr") {
      query = query.eq("booked_by", user.id);
    }

    // --------------------------------------------
    // Faculty
    // --------------------------------------------
    else if (profile.role === "faculty") {
      query = query.or(
        `booked_by.eq.${user.id},assigned_faculty.eq.${user.id}`,
      );
    }

    // --------------------------------------------
    // Admin
    // --------------------------------------------
    else if (profile.role === "admin") {
      // No filter
    }

    const { data, error } = await query
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetch all pending booking requests.
 *
 * Only faculty and admin can access.
 *
 * Includes:
 * - room details
 * - requester profile details
 *
 * @returns {Promise<Array>}
 */
export async function getPendingBookings() {
  try {
    const { user, profile } = await getCurrentUserProfile();

    if (
      profile.role !== "faculty" &&
      profile.role !== "admin" &&
      profile.role !== "cr"
    ) {
      throw new Error("Access denied");
    }

    let query = supabase
      .from("bookings")
      .select(
        `
    id,
    booking_date,
    start_time,
    end_time,
    purpose,
    status,
    section_name,
    created_at,

    rooms (
      room_name,
      block_name
    ),

    booker:profiles!bookings_booked_by_fkey (
      full_name,
      email,
      role
    ),

    assigned:profiles!bookings_assigned_faculty_fkey (
      full_name,
      email
    )
  `,
      )
      .eq("status", "pending");

    if (profile.role === "faculty") {
      query = query.eq("assigned_faculty", user.id);
    } else if (profile.role === "cr") {
      query = query.eq("booked_by", user.id);
    } else if (profile.role !== "admin") {
      throw new Error("Access denied");
    }
    const { data, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Update booking status.
 *
 * Rules:
 * - cancelled:
 *      only booking owner can cancel
 *
 * - approved/rejected:
 *      only faculty/admin can update
 *
 * @param {string} bookingId
 * @param {'approved'|'rejected'|'cancelled'} newStatus
 *
 * @returns {Promise<Object>}
 */
export async function updateBookingStatus(bookingId, newStatus) {
  try {
    const { user, profile } = await getCurrentUserProfile();

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      throw new Error(bookingError.message);
    }

    if (!booking) {
      throw new Error("Booking not found");
    }

    // ---------------------------------------------------
    // Cancel booking
    // ---------------------------------------------------

    if (newStatus === "cancelled") {
      if (booking.booked_by !== user.id) {
        throw new Error("You can only cancel your own bookings");
      }
    }

    // ---------------------------------------------------
    // Approve / Reject booking
    // ---------------------------------------------------

    if (newStatus === "approved" || newStatus === "rejected") {
      if (profile.role !== "faculty" && profile.role !== "admin") {
        throw new Error("Access denied");
      }
      if (profile.role === "faculty" && booking.assigned_faculty !== user.id) {
        throw new Error("This request is assigned to another faculty");
      }
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: newStatus,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetch available/free rooms for a given time slot.
 *
 * Uses PostgreSQL RPC:
 * get_free_rooms(
 *   p_date,
 *   p_start,
 *   p_end,
 *   p_block
 * )
 *
 * @param {Object} params
 * @param {string} params.date - YYYY-MM-DD
 * @param {string} params.startTime - HH:mm:ss
 * @param {string} params.endTime - HH:mm:ss
 * @param {string|null} params.block
 *
 * @returns {Promise<Array>}
 */
export async function getFreeRooms({ date, startTime, endTime, block }) {
  try {
    const { data, error } = await supabase.rpc("get_free_rooms", {
      p_date: date,
      p_start: startTime,
      p_end: endTime,
      p_block: block ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function assignCRRole(studentEmail) {
  try {
    const { profile } = await getCurrentUserProfile();

    if (profile.role !== "faculty" && profile.role !== "admin") {
      throw new Error("Access denied");
    }

    const { data: student, error: findError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("email", studentEmail.trim().toLowerCase())
      .single();

    if (findError || !student) {
      throw new Error("Student account not found");
    }

    if (student.role === "cr") {
      throw new Error("Student is already a CR");
    }

    if (student.role !== "student") {
      throw new Error("Only students can be promoted to CR");
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role: "cr",
      })
      .eq("id", student.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return {
      success: true,
      studentName: student.full_name,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
