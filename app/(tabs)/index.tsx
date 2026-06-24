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
import { supabase } from "../../supabase"; 

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();

  // --- LIVE QUICK STATS LOGIC (Production) ---
  const [quickStats, setQuickStats] = useState({ pjaFree: 0, apsFree: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

   useEffect(() => {
      const fetchQuickStats = async () => {
        try {
          setLoadingStats(true);

          const now = new Date();
          const currentDate = now.toISOString().split('T')[0];
          const currentHour = now.getHours();
          const startTime = `${currentHour.toString().padStart(2, '0')}:00:00`;
          const endTime = `${(currentHour + 1).toString().padStart(2, '0')}:00:00`;

          const { data: freeRooms, error } = await supabase.rpc('get_free_rooms', {
            p_block: null,      // Passing null to get rooms for ALL blocks
            p_date: currentDate,
            p_end: endTime,
            p_start: startTime
            });
        if (error) throw error;

        let pjaCount = 0;
        let apsCount = 0;

        // TypeScript safe iteration
        if (freeRooms) {
          freeRooms.forEach((room: { block_name: string }) => {
            // Check if it includes the word 'APS' to be safe
            if (room.block_name.includes('APS')) apsCount++; 
            if (room.block_name.includes('PJA')) pjaCount++;
          });
        }

        setQuickStats({ pjaFree: pjaCount, apsFree: apsCount });

      } catch (error) {
        console.error("Error fetching live availability:", error);
        setQuickStats({ pjaFree: 0, apsFree: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchQuickStats();
    
    // Auto-refresh every 5 minutes
    const intervalId = setInterval(fetchQuickStats, 300000);
    return () => clearInterval(intervalId);
  }, []);
  // --- END QUICK STATS LOGIC ---

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#005A9C" />
      </View>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,';

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

        {/* --- ROLE-BASED HERO CARDS --- */}
        {(user.role === 'student' || user.role === 'cr') && (
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
        )}

        {(user.role === 'faculty' || user.role === 'admin') && (
          <View style={[styles.heroCard, { backgroundColor: '#2E8B57' }]}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Faculty Dashboard</Text>
              <Text style={styles.heroSubtitle}>
                Manage your instant room bookings and review pending CR requests.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[styles.heroButton, { flex: 1 }]}
                onPress={() => router.push("/search")}>
                <Text style={[styles.heroButtonText, { color: '#2E8B57' }]}>Quick Book</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroButton, { flex: 1 }]}
                onPress={() => router.push("/approvals")}>
                <Text style={[styles.heroButtonText, { color: '#2E8B57' }]}>Requests</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* --- LIVE QUICK STATS SECTION --- */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Live Availability</Text>
            <View style={styles.liveDot} />
          </View>
          <Text style={styles.sectionSubtitle}>Rooms free for the current hour</Text>
        </View>

        {loadingStats ? (
          <ActivityIndicator size="large" color="#005A9C" style={{ marginVertical: 40 }} />
        ) : (
          <View style={styles.statsRow}>
            {/* PJA Stat Card */}
            <View style={[styles.statCard, styles.pjaCard]}>
              <Text style={styles.statNumber}>{quickStats.pjaFree}</Text>
              <Text style={styles.statLabel}>PJA Block</Text>
              <Text style={styles.statSubText}>Rooms Available</Text>
            </View>

            {/* APS Stat Card */}
            <View style={[styles.statCard, styles.apsCard]}>
              <Text style={styles.statNumber}>{quickStats.apsFree}</Text>
              <Text style={styles.statLabel}>APS Block</Text>
              <Text style={styles.statSubText}>Rooms Available</Text>
            </View>
          </View>
        )}
        {/* --- END QUICK STATS SECTION --- */}

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroTextContainer: { marginBottom: 20 },
  heroTitle: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  heroSubtitle: { color: "#E3F2FD", fontSize: 14, lineHeight: 20 },
  heroButton: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  heroButtonText: { color: "#005A9C", fontWeight: "bold", marginRight: 8 },

  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
  sectionSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#FFF',
    width: '48%', 
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderTopWidth: 4, 
  },
  pjaCard: {
    borderTopColor: '#005A9C', 
  },
  apsCard: {
    borderTopColor: '#34C759', 
  },
  statNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statSubText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginLeft: 8,
  }
});