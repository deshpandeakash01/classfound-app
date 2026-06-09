import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "../../UserContext";
import { supabase } from "../../supabase"; // Correct root path for your setup
import { LineChart } from "react-native-chart-kit";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();

  // --- HOURLY GRAPH LOGIC ---
  const [graphData, setGraphData] = useState({
    pja: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    aps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  });
  const [loadingGraph, setLoadingGraph] = useState(true);

  const fetchHourlyGraphData = async () => {
    try {
      const currentDay = new Date().getDay();

      const { data: rooms, error } = await supabase
        .from('rooms')
        .select(`
          id, 
          block_name, 
          schedules (start_time, end_time)
        `)
        .eq('schedules.day_of_week', currentDay);

      if (error) throw error;

      // The hours we want to plot: 8, 9, 10, 11, 12, 13, 14, 15, 16, 17
      const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
      let pjaCounts = new Array(10).fill(0);
      let apsCounts = new Array(10).fill(0);

      // Loop through every room
      if (rooms) {
        rooms.forEach(room => {
          const schedules = room.schedules || [];
          
          // Loop through every class scheduled in this room today
          schedules.forEach(sched => {
            const startHour = parseInt(sched.start_time.split(':')[0]);
            const endHour = parseInt(sched.end_time.split(':')[0]);

            // For every hour on our graph, check if this class is happening
            hours.forEach((h, index) => {
              if (h >= startHour && h < endHour) {
                if (room.block_name === 'PJA') pjaCounts[index]++; /* <--- Updated */
                if (room.block_name === 'APS') apsCounts[index]++; /* <--- Updated */
              }
            });
          });
        });
      }

      setGraphData({ pja: pjaCounts, aps: apsCounts });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching graph data:", error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
    } finally {
      setLoadingGraph(false);
    }
  };

  useEffect(() => {
    fetchHourlyGraphData();
  }, []);
  // --- END LOGIC ---

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#005A9C" />
      </View>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,';

  // Get screen width for the chart to make it responsive
  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name}>{user.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={styles.avatarMini}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Need a space?</Text>
            <Text style={styles.heroSubtitle}>
              Find an empty lab or classroom for your group study.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push("/search")}>
            <Text style={styles.heroButtonText}>Find a Room Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#005A9C" />
          </TouchableOpacity>
        </View>

       {/* --- HOURLY GRAPH SECTION --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Campus Traffic 📈</Text>
          <Text style={styles.sectionSubtitle}>Hourly occupancy throughout the day</Text>
        </View>

        <View style={styles.graphCard}>
          {loadingGraph ? (
            <ActivityIndicator size="small" color="#005A9C" style={{ padding: 40 }} />
          ) : (
            <LineChart
              data={{
                labels: ["8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p"],
                datasets: [
                  {
                    data: graphData.pja,
                    color: (opacity = 1) => `rgba(0, 90, 156, ${opacity})`, // PJA - Brand Blue
                    strokeWidth: 3, 
                  },
                  {
                    data: graphData.aps,
                    color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, // APS - Green
                    strokeWidth: 3, 
                  }
                ],
                legend: ["PJA Block", "APS Block"]
              }}
              width={screenWidth - 72} 
              height={220}
              yAxisSuffix=" rm"
              fromZero={true}
              chartConfig={{
                backgroundColor: "#FFF",
                backgroundGradientFrom: "#FFF",
                backgroundGradientTo: "#FFF",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.1})`, 
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.5})`, 
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                }
              }}
              bezier 
              style={styles.chartStyle}
            />
          )}
        </View>
        {/* --- END GRAPH SECTION --- */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 50,
  },
  greeting: { fontSize: 16, color: "#666" },
  name: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A" },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#005A9C",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  heroCard: {
    backgroundColor: "#005A9C",
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: "#005A9C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  heroTextContainer: { marginBottom: 20 },
  heroTitle: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  heroSubtitle: { color: "#E3F2FD", fontSize: 14, lineHeight: 20 },
  heroButton: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  heroButtonText: { color: "#005A9C", fontWeight: "bold", marginRight: 8 },

  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  graphCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
    alignItems: "center", 
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  }
});