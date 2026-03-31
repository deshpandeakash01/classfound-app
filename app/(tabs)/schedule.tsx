import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ScheduleScreen() {
  // --- STATE: DARK MODE ---
  // Starts as false (Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- FAKE DATABASE & STATE ---
  const [dailyClasses, setDailyClasses] = useState([
    {
      id: "1",
      time: "09:00 AM - 10:30 AM",
      subject: "Data Structures & Algorithms",
      room: "Lab 2",
    },
    {
      id: "2",
      time: "11:00 AM - 12:30 PM",
      subject: "Database Management Systems",
      room: "Room 304",
    },
    {
      id: "3",
      time: "02:00 PM - 04:00 PM",
      subject: "Web Development Workshop",
      room: "Lab 5",
    },
    {
      id: "4",
      time: "04:30 PM - 06:00 PM",
      subject: "Computer Networks",
      room: "Room 205",
    },
  ]);

  // --- LOGIC FUNCTION ---
  const handleReleaseRoom = (classId, subjectName, roomName) => {
    Alert.alert(
      "Release Room?",
      `Are you sure you want to release ${roomName} for ${subjectName}? This will make it available for other teachers to book.`,
      [
        { text: "Keep Room", style: "cancel" },
        {
          text: "Confirm Release",
          style: "destructive",
          onPress: () => {
            setDailyClasses((prevClasses) =>
              prevClasses.filter((c) => c.id !== classId),
            );
          },
        },
      ],
    );
  };

  return (
    // Dynamic background color for the whole screen
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>My Daily Schedule</Text>

          {/* The Moon/Sun Toggle Button */}
          <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
            <Feather
              name={isDarkMode ? "sun" : "moon"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.dateRow}>
          <Feather name="calendar" size={16} color="#E0E7FF" />
          <Text style={styles.dateText}>Wednesday, March 25, 2026</Text>
        </View>
      </View>

      {/* --- SCHEDULE CARDS --- */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {dailyClasses.length === 0 ? (
          <Text
            style={[styles.emptyText, isDarkMode && styles.darkTextSecondary]}
          >
            You have no more classes today. Great job!
          </Text>
        ) : (
          dailyClasses.map((item) => (
            // Dynamic styling for the individual cards
            <View
              key={item.id}
              style={[styles.card, isDarkMode && styles.darkCard]}
            >
              {/* Card Top: Teal Time Bar (Stays the same color in both modes) */}
              <View style={styles.cardTimeBar}>
                <Feather name="clock" size={16} color="white" />
                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              {/* Card Body: Details & Button */}
              <View style={styles.cardBody}>
                <Text
                  style={[
                    styles.subjectText,
                    isDarkMode && styles.darkTextPrimary,
                  ]}
                >
                  {item.subject}
                </Text>

                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.roomText,
                      isDarkMode && styles.darkTextSecondary,
                    ]}
                  >
                    {item.room}
                  </Text>
                </View>

                {/* The Release Button */}
                <TouchableOpacity
                  style={[
                    styles.releaseButton,
                    isDarkMode && styles.darkReleaseButton,
                  ]}
                  onPress={() =>
                    handleReleaseRoom(item.id, item.subject, item.room)
                  }
                >
                  <Text style={styles.releaseButtonText}>Release Room</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLING RULES ---
const styles = StyleSheet.create({
  // Light Mode Styles (Default)
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    backgroundColor: "#1E3A8A",
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  dateRow: { flexDirection: "row", alignItems: "center", marginTop: 15 },
  dateText: { color: "#E0E7FF", marginLeft: 8, fontSize: 16 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#6B7280",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTimeBar: {
    backgroundColor: "#05D6A0",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 15,
  },
  timeText: { color: "white", fontWeight: "600", marginLeft: 8, fontSize: 14 },
  cardBody: { padding: 15 },
  subjectText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  roomText: { color: "#4B5563", fontSize: 15, marginLeft: 6 },

  releaseButton: {
    borderWidth: 1.5,
    borderColor: "#F97316",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  releaseButtonText: { color: "#F97316", fontWeight: "bold", fontSize: 16 },

  // --- DARK MODE OVERRIDES ---
  darkContainer: { backgroundColor: "#111827" }, // Deep slate background
  darkCard: { backgroundColor: "#1F2937" }, // Darker grey card background
  darkTextPrimary: { color: "#F9FAFB" }, // White text
  darkTextSecondary: { color: "#9CA3AF" }, // Light grey text
  darkReleaseButton: { backgroundColor: "rgba(249, 115, 22, 0.1)" }, // Subtle orange tint behind the button text
});
