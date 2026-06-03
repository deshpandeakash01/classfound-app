// app/(tabs)/book.jsx

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";

import { supabase } from "../../supabase";
import { useUser } from "../../UserContext";

import useConflictCheck from "../../hooks/useConflictCheck";

import { createBooking } from "../../services/bookingService";

// ======================================================
// Helpers
// ======================================================

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

// ======================================================
// Screen
// ======================================================

export default function BookScreen() {
  const { user } = useUser();
  const {
    roomId,
    roomName,
    blockName,
    bookingDate: paramDate,
    startTime: paramStartTime,
    endTime: paramEndTime,
  } = useLocalSearchParams();

  // const [rooms, setRooms] = useState([]);
  // const [loadingRooms, setLoadingRooms] = useState(true);

  const [selectedRoomId, setSelectedRoomId] = useState(
    roomId ? Number(roomId) : null,
  );

  const [bookingDateObj, setBookingDateObj] = useState(new Date());

  const [startTimeObj, setStartTimeObj] = useState(new Date());

  const [endTimeObj, setEndTimeObj] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000),
  );

  const [purpose, setPurpose] = useState("");

  const [sectionName, setSectionName] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);

  const [showEndPicker, setShowEndPicker] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [facultySearch, setFacultySearch] = useState("");
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);

  // ====================================================
  // Faculty Filter
  // ====================================================
  const filteredFaculty = facultyList.filter((faculty) =>
    faculty.full_name?.toLowerCase().includes(facultySearch.toLowerCase()),
  );

  // ====================================================
  // Derived values
  // ====================================================

  const bookingDate = useMemo(
    () => formatDate(bookingDateObj),
    [bookingDateObj],
  );

  const startTime = useMemo(() => formatTime(startTimeObj), [startTimeObj]);

  const endTime = useMemo(() => formatTime(endTimeObj), [endTimeObj]);

  // ====================================================
  // Conflict check
  // ====================================================

  const { isChecking, hasConflict, conflictDetail } = useConflictCheck({
    roomId: selectedRoomId,
    bookingDate,
    startTime,
    endTime,
  });

  async function fetchFacultyList() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "faculty")
        .order("full_name");

      if (error) {
        throw error;
      }

      setFacultyList(data || []);
    } catch (error) {
      console.log("Faculty fetch error:", error.message);
    }
  }

  useEffect(() => {
    setPurpose("");
    setSectionName("");
    setSelectedFaculty("");

    fetchFacultyList();

    if (roomId) {
      setSelectedRoomId(Number(roomId));
    }

    if (paramDate) {
      setBookingDateObj(new Date(paramDate));
    }

    if (paramStartTime) {
      const [h, m] = paramStartTime.split(":");

      const d = new Date();
      d.setHours(Number(h));
      d.setMinutes(Number(m));
      d.setSeconds(0);

      setStartTimeObj(d);
    }

    if (paramEndTime) {
      const [h, m] = paramEndTime.split(":");

      const d = new Date();
      d.setHours(Number(h));
      d.setMinutes(Number(m));
      d.setSeconds(0);

      setEndTimeObj(d);
    }
  }, [roomId, paramDate, paramStartTime, paramEndTime]);

  // ====================================================
  // Load rooms
  // ====================================================

  // useEffect(() => {
  //   fetchRooms();
  // }, []);

  // async function fetchRooms() {
  //   try {
  //     setLoadingRooms(true);

  //     const { data, error } = await supabase
  //       .from("rooms")
  //       .select("*")
  //       .order("block_name")
  //       .order("room_name");

  //     if (error) {
  //       throw error;
  //     }

  //     setRooms(data || []);
  //   } catch (error) {
  //     Alert.alert("Error", error.message);
  //   } finally {
  //     setLoadingRooms(false);
  //   }
  // }

  // ====================================================
  // Validation
  // ====================================================

  const isFormComplete =
    selectedRoomId &&
    bookingDate &&
    startTime &&
    endTime &&
    purpose.trim().length >= 3 &&
    (user?.role !== "cr" || selectedFaculty);

  const canSubmit =
    isFormComplete && !hasConflict && !isChecking && !submitting;

  // ====================================================
  // Submit
  // ====================================================

  async function handleSubmit() {
    try {
      setSubmitting(true);

      await createBooking({
        roomId: selectedRoomId,
        bookingDate,
        startTime,
        endTime,
        purpose: purpose.trim(),
        sectionName: user?.role === "cr" ? sectionName : null,
        assignedFaculty: user?.role === "cr" ? selectedFaculty : null,
      });

      Alert.alert(
        "Booked!",
        user?.role === "faculty"
          ? "Room booked successfully."
          : "Booking request submitted for approval.",
      );

      router.replace("/(tabs)/my-bookings");
    } catch (error) {
      Alert.alert("Booking Failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ====================================================
  // Access denied
  // ====================================================

  if (user?.role === "student") {
    return (
      <View style={styles.deniedContainer}>
        <Text style={styles.deniedTitle}>Access Denied</Text>

        <Text style={styles.deniedText}>
          Students are not allowed to create room bookings.
        </Text>
      </View>
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Book a Room</Text>

      {/* =========================================== */}
      {/* Role note */}
      {/* =========================================== */}

      {user?.role === "faculty" && (
        <View style={[styles.noteCard, styles.facultyCard]}>
          <Text style={styles.noteText}>
            Your booking will be instantly confirmed
          </Text>
        </View>
      )}

      {user?.role === "cr" && (
        <View style={[styles.noteCard, styles.crCard]}>
          <Text style={styles.noteText}>
            Your request will be sent for faculty approval
          </Text>
        </View>
      )}

      {/* =========================================== */}
      {/* Room picker */}
      {/* =========================================== */}

      <Text style={styles.label}>Selected Room</Text>

      <View style={styles.preFillRow}>
        <View style={[styles.roomChip, styles.roomChipSelected]}>
          <Text style={[styles.roomChipText, styles.roomChipTextSelected]}>
            {roomName} • {blockName}
          </Text>
        </View>
      </View>
      {/* =========================================== */}
      {/* Date picker */}
      {/* =========================================== */}

      <Text style={styles.label}>Date</Text>

      <Pressable
        style={styles.inputButton}
        onPress={() => setShowDatePicker(true)}>
        <Text style={styles.inputButtonText}>{bookingDate}</Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={bookingDateObj}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);

            if (selectedDate) {
              setBookingDateObj(selectedDate);
            }
          }}
        />
      )}

      {/* =========================================== */}
      {/* Start time */}
      {/* =========================================== */}

      <Text style={styles.label}>Start Time</Text>

      <Pressable
        style={styles.inputButton}
        onPress={() => setShowStartPicker(true)}>
        <Text style={styles.inputButtonText}>{startTime}</Text>
      </Pressable>

      {showStartPicker && (
        <DateTimePicker
          value={startTimeObj}
          mode="time"
          is24Hour
          onChange={(event, selectedTime) => {
            setShowStartPicker(false);

            if (selectedTime) {
              setStartTimeObj(selectedTime);
            }
          }}
        />
      )}

      {/* =========================================== */}
      {/* End time */}
      {/* =========================================== */}

      <Text style={styles.label}>End Time</Text>

      <Pressable
        style={styles.inputButton}
        onPress={() => setShowEndPicker(true)}>
        <Text style={styles.inputButtonText}>{endTime}</Text>
      </Pressable>

      {showEndPicker && (
        <DateTimePicker
          value={endTimeObj}
          mode="time"
          is24Hour
          onChange={(event, selectedTime) => {
            setShowEndPicker(false);

            if (selectedTime) {
              setEndTimeObj(selectedTime);
            }
          }}
        />
      )}

      {/* =========================================== */}
      {/* Conflict status */}
      {/* =========================================== */}

      {selectedRoomId && bookingDate && startTime && endTime && (
        <View
          style={[
            styles.conflictBox,
            isChecking
              ? styles.checkingBox
              : hasConflict
                ? styles.conflictErrorBox
                : styles.conflictSuccessBox,
          ]}>
          {isChecking ? (
            <View style={styles.row}>
              <ActivityIndicator size="small" color="#FFFFFF" />

              <Text style={styles.conflictText}> Checking…</Text>
            </View>
          ) : hasConflict ? (
            <Text style={styles.conflictText}>✗ {conflictDetail}</Text>
          ) : (
            <Text style={styles.conflictText}>✓ Room is available</Text>
          )}
        </View>
      )}

      {/* =========================================== */}
      {/* Purpose */}
      {/* =========================================== */}

      <Text style={styles.label}>Purpose</Text>

      <TextInput
        value={purpose}
        onChangeText={setPurpose}
        placeholder="Enter booking purpose..."
        placeholderTextColor="#8A8A8A"
        multiline
        style={styles.textArea}
      />

      {/* =========================================== */}
      {/* Section name */}
      {/* =========================================== */}

      {user?.role === "cr" && (
        <>
          <Text style={styles.label}>Section Name</Text>

          <TextInput
            value={sectionName}
            onChangeText={setSectionName}
            placeholder="Section"
            placeholderTextColor="#8A8A8A"
            style={styles.input}
          />
        </>
      )}

      {/* =========================================== */}
      {/* Faculty Dropdown*/}
      {/* =========================================== */}
      {user?.role === "cr" && (
        <>
          <Text style={styles.label}>Faculty Approval Required</Text>

          <TextInput
            style={styles.input}
            placeholder="Type faculty name..."
            placeholderTextColor="#888"
            value={facultySearch}
            onFocus={() => setShowFacultyDropdown(true)}
            onBlur={() =>
              setTimeout(() => {
                setShowFacultyDropdown(false);
              }, 200)
            }
            onChangeText={(text) => {
              setFacultySearch(text);
              setShowFacultyDropdown(true);
            }}
          />

          {showFacultyDropdown && facultySearch.trim().length > 0 && (
            <View style={styles.facultyDropdown}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {filteredFaculty.map((faculty) => (
                  <Pressable
                    key={faculty.id}
                    onPress={() => {
                      setSelectedFaculty(faculty.id);
                      setFacultySearch(faculty.full_name);
                      setShowFacultyDropdown(false);
                    }}
                    style={styles.facultyOption}>
                    <Text style={styles.facultyOptionText}>
                      {faculty.full_name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </>
      )}

      {/* =========================================== */}
      {/* Submit */}
      {/* =========================================== */}

      <Pressable
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        disabled={!canSubmit}
        onPress={handleSubmit}>
        {submitting ? (
          <ActivityIndicator color="#0A1628" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Booking</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

// ======================================================
// Styles
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  content: {
    padding: 20,
    paddingBottom: 60,
  },

  heading: {
    color: "#111111",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
  },

  label: {
    color: "#111111",
    marginBottom: 8,
    marginTop: 18,
    fontSize: 15,
    fontWeight: "600",
  },

  // ==========================================
  // Top Info Cards
  // ==========================================

  noteCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },

  preFillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  changeText: {
    color: "#0D5C9F",
    fontWeight: "600",
    fontSize: 14,
  },

  facultyCard: {
    backgroundColor: "#EAF2FB",
    borderWidth: 1,
    borderColor: "#CFE2F5",
  },

  crCard: {
    backgroundColor: "#FFF3D6",
    borderWidth: 1,
    borderColor: "#EACB6D",
  },

  noteText: {
    color: "#111111",
    fontWeight: "600",
  },

  // ==========================================
  // Room Chips
  // ==========================================

  pickerContainer: {
    marginBottom: 10,
  },

  roomChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
  },

  roomChipSelected: {
    backgroundColor: "#0D5C9F",
    borderColor: "#0D5C9F",
  },

  roomChipText: {
    color: "#333333",
    fontWeight: "600",
  },

  roomChipTextSelected: {
    color: "#FFFFFF",
  },

  // ==========================================
  // Faculty Chips
  // ==========================================

  ffacultyDropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginTop: 10,
    overflow: "hidden",
  },

  facultySearchInput: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    color: "#111111",
  },

  facultyOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  facultyOptionText: {
    color: "#111111",
    fontSize: 15,
  },

  // ==========================================
  // Inputs
  // ==========================================

  inputButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  inputButtonText: {
    color: "#111111",
    fontSize: 15,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    color: "#111111",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  textArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    color: "#111111",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    minHeight: 120,
    textAlignVertical: "top",
  },

  // ==========================================
  // Availability Status
  // ==========================================

  conflictBox: {
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
  },

  checkingBox: {
    backgroundColor: "#E5E7EB",
  },

  conflictErrorBox: {
    backgroundColor: "#FEE2E2",
  },

  conflictSuccessBox: {
    backgroundColor: "#DCFCE7",
  },

  conflictText: {
    color: "#111111",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  // ==========================================
  // Submit
  // ==========================================

  submitButton: {
    backgroundColor: "#0D5C9F",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 30,
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  // ==========================================
  // Access Denied
  // ==========================================

  deniedContainer: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  deniedTitle: {
    color: "#111111",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },

  deniedText: {
    color: "#666666",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
});
