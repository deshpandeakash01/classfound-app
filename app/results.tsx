import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
// We import useLocalSearchParams to catch the filters sent from the search button
import { useLocalSearchParams, useRouter } from "expo-router";

// --- OUR FAKE HIERARCHICAL DATABASE ---
const searchData = [
  {
    blockName: "Block 1",
    floors: [
      {
        floorName: "Ground Floor",
        rooms: [
          {
            id: "101A",
            type: "Classroom",
            capacity: 40,
            facilities: ["Projector", "Wi-Fi", "AC"],
          },
          {
            id: "102",
            type: "Classroom",
            capacity: 35,
            facilities: ["Wi-Fi", "AC"],
          },
          {
            id: "Lab G01",
            type: "Computer Lab",
            capacity: 30,
            facilities: ["Computers", "Projector", "Wi-Fi", "AC"],
          },
        ],
      },
      {
        floorName: "First Floor",
        rooms: [
          {
            id: "201",
            type: "Classroom",
            capacity: 45,
            facilities: ["Projector", "Wi-Fi", "AC", "Whiteboard"],
          },
        ],
      },
    ],
  },
];

export default function ResultsScreen() {
  const router = useRouter();

  // --- CATCH THE FILTERS ---
  const { date, time, types } = useLocalSearchParams();
  // Turn the text array back into a real JavaScript list
  const requestedTypes = types ? JSON.parse(types) : [];

  // --- BOOKING STATE ---
  const [bookedRooms, setBookedRooms] = useState([]);

  const handleBookRoom = (roomId) => {
    Alert.alert(
      "Confirm Your Booking?",
      `Are you sure you want to book Room ${roomId} for ${date || "Today"} at ${time || "Now"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => setBookedRooms([...bookedRooms, roomId]),
        },
      ],
    );
  };

  // --- SMART FILTERING LOGIC ---
  const filteredData = searchData
    .map((block) => {
      return {
        ...block,
        floors: block.floors
          .map((floor) => {
            return {
              ...floor,
              rooms: floor.rooms.filter((room) => {
                // If the user didn't tap any pills, show all rooms
                if (requestedTypes.length === 0) return true;
                // Otherwise, only show the room if its type matches the tapped pills
                return requestedTypes.includes(room.type);
              }),
            };
          })
          .filter((floor) => floor.rooms.length > 0),
      };
    })
    .filter((block) => block.floors.length > 0);

  // Count how many rooms survived the filter
  let totalRoomsFound = 0;
  filteredData.forEach((block) => {
    block.floors.forEach((floor) => {
      totalRoomsFound += floor.rooms.length;
    });
  });

  // --- RENDER UI ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View>
            {/* Dynamic Header Text */}
            <Text style={styles.headerTitle}>
              {totalRoomsFound} Rooms Available
            </Text>
            <Text style={styles.subTitle}>
              {date || "Today"} at {time || "Now"}
            </Text>
          </View>
        </View>
        <Feather
          name="moon"
          size={24}
          color="#1E3A8A"
          style={styles.moonIcon}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map over our filtered list instead of the raw data */}
        {filteredData.map((block, blockIndex) => (
          <View key={blockIndex}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockHeaderText}>{block.blockName}</Text>
            </View>

            {block.floors.map((floor, floorIndex) => (
              <View key={floorIndex}>
                <View style={styles.floorHeader}>
                  <Text style={styles.floorHeaderText}>{floor.floorName}</Text>
                </View>

                {floor.rooms.map((room, roomIndex) => {
                  const isBooked = bookedRooms.includes(room.id);

                  return (
                    <View key={roomIndex} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.roomName}>Room {room.id}</Text>
                        <View style={styles.capacityBadge}>
                          <Ionicons
                            name="people-outline"
                            size={16}
                            color="#4B5563"
                          />
                          <Text style={styles.capacityText}>
                            {room.capacity}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.roomTypeBadge}>
                        <Text style={styles.roomTypeText}>{room.type}</Text>
                      </View>

                      <View style={styles.facilitiesRow}>
                        {room.facilities.map((fac, i) => (
                          <View key={i} style={styles.facilityTag}>
                            {fac === "Projector" && (
                              <Feather
                                name="video"
                                size={12}
                                color="#6B7280"
                                style={styles.facIcon}
                              />
                            )}
                            {fac === "Wi-Fi" && (
                              <Feather
                                name="wifi"
                                size={12}
                                color="#6B7280"
                                style={styles.facIcon}
                              />
                            )}
                            {fac === "AC" && (
                              <MaterialCommunityIcons
                                name="air-conditioner"
                                size={12}
                                color="#6B7280"
                                style={styles.facIcon}
                              />
                            )}
                            {fac === "Computers" && (
                              <Feather
                                name="monitor"
                                size={12}
                                color="#6B7280"
                                style={styles.facIcon}
                              />
                            )}
                            <Text style={styles.facilityText}>{fac}</Text>
                          </View>
                        ))}
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.bookButton,
                          isBooked
                            ? styles.bookedButton
                            : styles.availableButton,
                        ]}
                        onPress={() => handleBookRoom(room.id)}
                        disabled={isBooked}
                      >
                        <Text style={styles.bookButtonText}>
                          {isBooked ? "Booked ✓" : "Instant Book"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ))}

        {/* Show a message if no rooms match the selected filters */}
        {totalRoomsFound === 0 && (
          <Text style={styles.noRoomsText}>
            No rooms found matching your filters.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLING RULES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  subTitle: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  moonIcon: { backgroundColor: "#F3F4F6", padding: 8, borderRadius: 8 },
  blockHeader: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  blockHeaderText: { color: "white", fontWeight: "bold", fontSize: 16 },
  floorHeader: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  floorHeaderText: { color: "#4B5563", fontSize: 14, fontWeight: "500" },
  card: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomName: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  capacityBadge: { flexDirection: "row", alignItems: "center" },
  capacityText: {
    marginLeft: 5,
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 14,
  },
  roomTypeBadge: {
    backgroundColor: "#E6FFFA",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  roomTypeText: { color: "#0D9488", fontSize: 12, fontWeight: "600" },
  facilitiesRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 15 },
  facilityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  facIcon: { marginRight: 4 },
  facilityText: { color: "#4B5563", fontSize: 12, fontWeight: "500" },
  bookButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  availableButton: { backgroundColor: "#1E3A8A" },
  bookedButton: { backgroundColor: "#059669" },
  bookButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  noRoomsText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#6B7280",
  },
});
