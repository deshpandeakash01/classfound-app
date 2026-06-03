// hooks/useConflictCheck.js

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

/**
 * Convert YYYY-MM-DD into PostgreSQL-compatible ISODOW
 * PostgreSQL EXTRACT(ISODOW):
 * Monday = 1
 * ...
 * Saturday = 6
 * Sunday = 7
 *
 * @param {string} dateString
 * @returns {number}
 */
function getDayOfWeek(dateString) {
  const day = new Date(dateString).getDay();
  return day === 0 ? 7 : day;
}

/**
 * Hook to check room booking conflicts.
 *
 * Checks:
 * 1. Fixed schedules
 * 2. Approved bookings
 *
 * Debounced by 500ms.
 *
 * @param {Object} params
 * @param {string|number} params.roomId
 * @param {string} params.bookingDate - YYYY-MM-DD
 * @param {string} params.startTime - HH:MM
 * @param {string} params.endTime - HH:MM
 *
 * @returns {{
 *   isChecking: boolean,
 *   hasConflict: boolean,
 *   conflictDetail: string | null
 * }}
 */
export default function useConflictCheck({
  roomId,
  bookingDate,
  startTime,
  endTime,
}) {
  const [isChecking, setIsChecking] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictDetail, setConflictDetail] = useState(null);

  useEffect(() => {
    // ---------------------------------------------------
    // Reset immediately when inputs change
    // ---------------------------------------------------

    setHasConflict(false);
    setConflictDetail(null);

    // ---------------------------------------------------
    // Only run when all inputs exist
    // ---------------------------------------------------

    if (!roomId || !bookingDate || !startTime || !endTime) {
      setIsChecking(false);
      return;
    }

    let cancelled = false;

    // ---------------------------------------------------
    // Debounce
    // ---------------------------------------------------

    const timeoutId = setTimeout(async () => {
      try {
        if (cancelled) return;

        setIsChecking(true);

        const dayOfWeek = getDayOfWeek(bookingDate);

        // ===============================================
        // QUERY 1: schedules conflict
        // ===============================================

        const { data: scheduleConflicts, error: scheduleError } = await supabase
          .from("schedules")
          .select(
            `
            subject_name,
            section_name,
            start_time,
            end_time
          `,
          )
          .eq("room_id", roomId)
          .eq("day_of_week", dayOfWeek)
          .lt("start_time", endTime)
          .gt("end_time", startTime);

        if (cancelled) return;

        if (scheduleError) {
          throw new Error(scheduleError.message);
        }

        // ===============================================
        // Scheduled class conflict
        // ===============================================

        if (scheduleConflicts && scheduleConflicts.length > 0) {
          const conflict = scheduleConflicts[0];

          setHasConflict(true);

          setConflictDetail(
            `Scheduled class: ${conflict.subject_name} (${conflict.section_name}) ${conflict.start_time}–${conflict.end_time}`,
          );

          setIsChecking(false);
          return;
        }

        // ===============================================
        // QUERY 2: approved bookings conflict
        // ===============================================

        const { data: bookingConflicts, error: bookingError } = await supabase
          .from("bookings")
          .select(
            `
            start_time,
            end_time,
            profiles!bookings_booked_by_fkey (
              email
            )
          `,
          )
          .eq("room_id", roomId)
          .eq("booking_date", bookingDate)
          .eq("status", "approved")
          .lt("start_time", endTime)
          .gt("end_time", startTime);

        if (cancelled) return;

        if (bookingError) {
          throw new Error(bookingError.message);
        }

        // ===============================================
        // Approved booking conflict
        // ===============================================

        if (bookingConflicts && bookingConflicts.length > 0) {
          const conflict = bookingConflicts[0];

          setHasConflict(true);

          setConflictDetail(
            `Already booked by ${conflict.profiles?.email ?? "Unknown"} ${conflict.start_time}–${conflict.end_time}`,
          );

          setIsChecking(false);
          return;
        }

        // ===============================================
        // No conflict
        // ===============================================

        setHasConflict(false);
        setConflictDetail(null);
      } catch (error) {
        console.error("Conflict check error:", error.message);

        if (!cancelled) {
          setHasConflict(false);
          setConflictDetail(null);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }, 500);

    // ---------------------------------------------------
    // Cleanup
    // ---------------------------------------------------

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [roomId, bookingDate, startTime, endTime]);

  return {
    isChecking,
    hasConflict,
    conflictDetail,
  };
}
