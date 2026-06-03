import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { getFreeRooms } from "../../services/bookingService";
import { useUser } from "../../UserContext";

// --- 1. THE BMSCE EXACT TIME SLOTS ---
const BMSCE_SLOTS = [
  {
    id: "slot1",
    label: "08:00 AM - 08:55 AM",
    dbStart: "08:00:00",
    dbEnd: "08:55:00",
  },
  {
    id: "slot2",
    label: "08:55 AM - 09:50 AM",
    dbStart: "08:55:00",
    dbEnd: "09:50:00",
  },
  {
    id: "slot3",
    label: "09:50 AM - 10:45 AM",
    dbStart: "09:50:00",
    dbEnd: "10:45:00",
  },
  {
    id: "slot4",
    label: "11:15 AM - 12:10 PM",
    dbStart: "11:15:00",
    dbEnd: "12:10:00",
  },
  {
    id: "slot5",
    label: "12:10 PM - 01:05 PM",
    dbStart: "12:10:00",
    dbEnd: "13:05:00",
  },
  {
    id: "slot6",
    label: "02:00 PM - 02:55 PM",
    dbStart: "14:00:00",
    dbEnd: "14:55:00",
  },
  {
    id: "slot7",
    label: "02:55 PM - 03:50 PM",
    dbStart: "14:55:00",
    dbEnd: "15:50:00",
  },
  {
    id: "slot8",
    label: "03:50 PM - 04:45 PM",
    dbStart: "15:50:00",
    dbEnd: "16:45:00",
  },
];

// --- 2. DYNAMIC CALENDAR GENERATOR ---
const generateCalendar = (daysAhead = 14) => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < daysAhead; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };

    let display = nextDate.toLocaleDateString("en-US", options);

    if (i === 0) display = "Today";
    if (i === 1) display = "Tomorrow";

    dates.push({
      display,
      dbDate: nextDate.toISOString().split("T")[0],
    });
  }

  return dates;
};

const BLOCKS = ["All", "APS Block", "Science Block", "Mechanical Block"];

export default function SearchScreen() {
  const { user } = useUser();

  const [activeBlock, setActiveBlock] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Real Database State
  const [roomsData, setRoomsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calendar Data
  const [calendarDates, setCalendarDates] = useState<
    { display: string; dbDate: string }[]
  >([]);

  // Modal Visibility
  const [modalVisible, setModalVisible] = useState(false);

  // Temporary State
  const [tempDate, setTempDate] = useState<{
    display: string;
    dbDate: string;
  } | null>(null);

  const [tempSlot, setTempSlot] = useState(BMSCE_SLOTS[1]);

  // Confirmed State
  const [confirmedDate, setConfirmedDate] = useState<{
    display: string;
    dbDate: string;
  } | null>(null);

  const [confirmedSlot, setConfirmedSlot] = useState(BMSCE_SLOTS[1]);

  // ====================================================
  // Initial Setup
  // ====================================================

  useEffect(() => {
    const dates = generateCalendar(14);

    setCalendarDates(dates);
    setTempDate(dates[0]);
    setConfirmedDate(dates[0]);

    loadRoomsFromDB(dates[0], BMSCE_SLOTS[1], activeBlock);
  }, []);

  // ====================================================
  // Re-fetch when block changes
  // ====================================================

  useEffect(() => {
    if (confirmedDate && confirmedSlot) {
      loadRoomsFromDB(confirmedDate, confirmedSlot, activeBlock);
    }
  }, [activeBlock]);

  // ====================================================
  // DATABASE FETCH FUNCTION
  // ====================================================

  const loadRoomsFromDB = async (
    dateObj: any,
    slotObj: any,
    blockValue: string,
  ) => {
    setIsLoading(true);

    try {
      const dbRooms = await getFreeRooms({
        date: dateObj.dbDate,
        startTime: slotObj.dbStart,
        endTime: slotObj.dbEnd,
        block: blockValue === "All" ? null : blockValue,
      });

      setRoomsData(dbRooms || []);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================================
  // Confirm slot/date
  // ====================================================

  const handleConfirmSlot = () => {
    setConfirmedDate(tempDate);
    setConfirmedSlot(tempSlot);

    setModalVisible(false);

    loadRoomsFromDB(tempDate, tempSlot, activeBlock);
  };

  // ====================================================
  // Search filtering only
  // ====================================================

  const filteredRooms = roomsData.filter((room) => {
    return room.room_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!confirmedDate) return <SafeAreaView style={styles.container} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Room</Text>

        <TouchableOpacity
          style={styles.activeTimeDisplay}
          onPress={() => setModalVisible(true)}>
          <Ionicons name="calendar-outline" size={18} color="#C9A84C" />

          <View style={styles.activeTimeTextContainer}>
            <Text style={styles.activeTimeLabel}>
              Searching availability for:
            </Text>

            <Text style={styles.activeTimeValue}>
              {confirmedDate.display} • {confirmedSlot.label}
            </Text>
          </View>

          <Ionicons name="chevron-down" size={18} color="#C9A84C" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#C5C5C5" />

          <TextInput
            style={styles.input}
            placeholder="Search by room name..."
            placeholderTextColor="#8A8A8A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C9A84C" />

          <Text style={styles.loadingText}>Scanning campus...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              keyboardShouldPersistTaps="handled">
              {BLOCKS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterChip,
                    activeBlock === item && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveBlock(item)}>
                  <Text
                    style={[
                      styles.filterChipText,
                      activeBlock === item && styles.filterChipTextActive,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={48} color="#C5C5C5" />

              <Text style={styles.emptyText}>
                No rooms available for this block/time.
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isLab = item.room_type === "lab";

            return (
              <View style={styles.card}>
                <View style={styles.cardInfo}>
                  <View style={styles.roomHeaderRow}>
                    <Text style={styles.roomName}>{item.room_name}</Text>

                    <View
                      style={[
                        styles.roomTypeBadge,
                        isLab ? styles.labBadge : styles.classroomBadge,
                      ]}>
                      <Text style={styles.roomTypeText}>{item.room_type}</Text>
                    </View>
                  </View>

                  <Text style={styles.details}>
                    {item.block_name} • {item.capacity} Seats
                  </Text>
                </View>

                {user?.role !== "student" && (
                  <TouchableOpacity
                    style={[
                      styles.bookBtn,
                      user?.role === "faculty"
                        ? styles.facultyBtn
                        : styles.crBtn,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/book",
                        params: {
                          roomId: item.id,
                          roomName: item.room_name,
                          blockName: item.block_name,
                          bookingDate: confirmedDate.dbDate,
                          startTime: confirmedSlot.dbStart,
                          endTime: confirmedSlot.dbEnd,
                        },
                      })
                    }>
                    <Text
                      style={[
                        styles.bookBtnText,
                        user?.role === "faculty" && styles.facultyBtnText,
                      ]}>
                      {user?.role === "faculty"
                        ? "Book Instantly"
                        : "Request Booking"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}

      {/* BOTTOM SHEET MODAL */}

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.closeArea}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.bottomSheet}>
            <View style={styles.sheetDragHandle} />

            <Text style={styles.sheetTitle}>Adjust Time & Date</Text>

            <Text style={styles.sectionLabel}>Select Date</Text>

            <View style={styles.scrollContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {calendarDates.map((dateObj) => (
                  <TouchableOpacity
                    key={dateObj.dbDate}
                    activeOpacity={0.7}
                    onPress={() => setTempDate(dateObj)}
                    style={[
                      styles.slotChip,
                      tempDate?.dbDate === dateObj.dbDate &&
                        styles.slotChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.slotText,
                        tempDate?.dbDate === dateObj.dbDate &&
                          styles.slotTextActive,
                      ]}>
                      {dateObj.display}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionLabel}>Select Class Slot</Text>

            <View style={styles.scrollContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {BMSCE_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    activeOpacity={0.7}
                    onPress={() => setTempSlot(slot)}
                    style={[
                      styles.slotChip,
                      tempSlot?.id === slot.id && styles.slotChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.slotText,
                        tempSlot?.id === slot.id && styles.slotTextActive,
                      ]}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmSlot}>
              <Text style={styles.confirmBtnText}>Confirm Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  header: {
    padding: 20,
    backgroundColor: "#F7F7F7",
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#111111",
  },

  activeTimeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E7E7",
    padding: 18,
    borderRadius: 22,
    marginTop: 18,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  activeTimeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  activeTimeLabel: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 2,
  },

  activeTimeValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#E7E7E7",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#111111",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#666666",
    fontSize: 16,
  },

  filterList: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },

  filterChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#E4E4E4",
  },

  filterChipActive: {
    backgroundColor: "#0D5C9F",
    borderColor: "#0D5C9F",
  },

  filterChipText: {
    color: "#333333",
    fontWeight: "600",
  },

  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  listContainer: {
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardInfo: {
    marginBottom: 18,
  },

  roomHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  roomName: {
    color: "#111111",
    fontSize: 24,
    fontWeight: "700",
  },

  details: {
    color: "#666666",
    fontSize: 14,
  },

  roomTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  classroomBadge: {
    backgroundColor: "#E8F1FA",
  },

  labBadge: {
    backgroundColor: "#EEE8FF",
  },

  roomTypeText: {
    color: "#0D5C9F",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  facultyBtn: {
    backgroundColor: "#0D5C9F",
  },

  crBtn: {
    backgroundColor: "#0D5C9F",
  },

  bookBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },

  bookBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  facultyBtnText: {
    color: "#FFFFFF",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },

  emptyText: {
    color: "#666666",
    marginTop: 14,
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },

  closeArea: {
    flex: 1,
  },

  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 34,
  },

  sheetDragHandle: {
    width: 45,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DADADA",
    alignSelf: "center",
    marginBottom: 18,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 20,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
    marginTop: 8,
  },

  scrollContainer: {
    marginBottom: 16,
  },

  slotChip: {
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },

  slotChipActive: {
    backgroundColor: "#0D5C9F",
    borderColor: "#0D5C9F",
  },

  slotText: {
    color: "#333333",
    fontWeight: "600",
  },

  slotTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  confirmBtn: {
    backgroundColor: "#0D5C9F",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },

  confirmBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
