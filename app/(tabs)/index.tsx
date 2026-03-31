import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const roomTypes = [
  "Classroom",
  "Computer Lab",
  "Science Lab",
  "Auditorium",
  "Seminar Hall",
];

export default function App() {
  const teacherName = "Dr. Patterson";
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // 1. New State for Dark Mode! Starts as false (Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- LOGIC FUNCTIONS ---
  const toggleRoomType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setCurrentDate(selectedDate);
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) setCurrentDate(selectedTime);
  };

  const formattedDate = currentDate
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");
  const formattedTime = currentDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // --- RENDER UI ---
  // We dynamically select styles based on the isDarkMode variable
  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header - Always stays blue to match your brand */}
        <View style={styles.headerContainer}>
          <View style={styles.topRow}>
            <Text style={styles.logoText}>ClassFound</Text>
            <View style={styles.headerIconsRow}>
              {/* 2. The Interactive Moon/Sun Button! */}
              <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
                <Feather
                  name={isDarkMode ? "sun" : "moon"} // Changes icon
                  size={24}
                  color="white"
                  style={styles.headerIcon}
                />
              </TouchableOpacity>

              <Ionicons name="person-outline" size={26} color="white" />
            </View>
          </View>
          <Text style={styles.greetingText}>Good Morning,</Text>
          <Text style={styles.nameText}>{teacherName}</Text>
        </View>

        {/* Main Body */}
        <View style={styles.bodyContainer}>
          {/* Dynamic Text Color */}
          <Text
            style={[styles.sectionTitle, isDarkMode && styles.darkTextPrimary]}
          >
            Find Available Rooms
          </Text>

          {/* DATE INPUT */}
          <Text
            style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}
          >
            Date
          </Text>
          <TouchableOpacity
            style={[styles.inputBox, isDarkMode && styles.darkInputBox]}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather
              name="calendar"
              size={20}
              color={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
            <Text
              style={[styles.inputText, isDarkMode && styles.darkTextPrimary]}
            >
              {formattedDate}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={currentDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
            />
          )}

          {/* TIME SLOT INPUT */}
          <Text
            style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}
          >
            Time Slot
          </Text>
          <TouchableOpacity
            style={[styles.inputBox, isDarkMode && styles.darkInputBox]}
            onPress={() => setShowTimePicker(true)}
          >
            <Feather
              name="clock"
              size={20}
              color={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
            <Text
              style={[styles.inputText, isDarkMode && styles.darkTextPrimary]}
            >
              {formattedTime}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={currentDate}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeTime}
            />
          )}

          {/* ROOM TYPE FILTERS */}
          <Text
            style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}
          >
            Room Type (Optional)
          </Text>
          <View style={styles.pillsContainer}>
            {roomTypes.map((type) => {
              const isSelected = selectedTypes.includes(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pillBox,
                    isSelected
                      ? styles.pillBoxSelected
                      : isDarkMode
                        ? styles.darkPillBoxUnselected
                        : styles.pillBoxUnselected,
                  ]}
                  onPress={() => toggleRoomType(type)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected
                        ? styles.pillTextSelected
                        : isDarkMode
                          ? styles.darkPillTextUnselected
                          : styles.pillTextUnselected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Find Rooms Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            router.push({
              pathname: "/results",
              params: {
                date: formattedDate,
                time: formattedTime,
                types: JSON.stringify(selectedTypes),
              },
            });
          }}
        >
          <Feather
            name="search"
            size={20}
            color="white"
            style={styles.searchIcon}
          />
          <Text style={styles.primaryButtonText}>Find Available Rooms</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- STYLING RULES ---
const styles = StyleSheet.create({
  // Light Mode Styles (Default)
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { paddingBottom: 100 },
  headerContainer: {
    backgroundColor: "#1E3A8A",
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold" },
  headerIconsRow: { flexDirection: "row", alignItems: "center" },
  headerIcon: { marginRight: 20 },
  greetingText: { color: "#E0E7FF", fontSize: 14, marginTop: 10 },
  nameText: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  bodyContainer: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 20,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  inputText: { marginLeft: 10, fontSize: 16, color: "#111827" },
  pillsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  pillBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  pillBoxUnselected: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
  pillBoxSelected: { backgroundColor: "#D1E0FF", borderColor: "#1E3A8A" },
  pillText: { fontSize: 14, fontWeight: "500" },
  pillTextUnselected: { color: "#4B5563" },
  pillTextSelected: { color: "#1E3A8A" },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  primaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E3A8A",
    padding: 18,
    borderRadius: 12,
    elevation: 4,
  },
  searchIcon: { marginRight: 10 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  // --- DARK MODE OVERRIDES ---
  darkContainer: { backgroundColor: "#111827" }, // Deep slate background
  darkTextPrimary: { color: "#F9FAFB" }, // White text
  darkTextSecondary: { color: "#9CA3AF" }, // Light grey text
  darkInputBox: { backgroundColor: "#1F2937" }, // Darker grey for input boxes
  darkPillBoxUnselected: { backgroundColor: "#1F2937", borderColor: "#374151" },
  darkPillTextUnselected: { color: "#D1D5DB" },
});
