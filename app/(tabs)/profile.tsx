import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { supabase } from "../../supabase";
import { useUser } from "../../UserContext";
import { assignCRRole, assignTeacherRole } from "../../services/bookingService";

export default function ProfileScreen() {
  const { user } = useUser();
  const [studentEmail, setStudentEmail] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const router = useRouter();

  // --- NEW: Dynamic Dashboard State ---
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [bookedCount, setBookedCount] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  // --- NEW: Fetch Dynamic Stats ---
  useEffect(() => {
    const fetchManagementStats = async () => {
      try {
        setStatsLoading(true);
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Get Pending Approvals count
        const { count: pending, error: pendingError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // 2. Get Total Booked Rooms for today count
        const { count: booked, error: bookedError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .eq('booking_date', todayStr);

        if (pendingError) throw pendingError;
        if (bookedError) throw bookedError;

        setPendingCount(pending || 0);
        setBookedCount(booked || 0);
      } catch (error: any) {
        console.error("Error fetching management stats:", error.message);
      } finally {
        setStatsLoading(false);
      }
    };

    // Only fetch if the user is faculty or admin
    if (user && ['faculty', 'admin'].includes(user.role as string)) {
      fetchManagementStats();
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#005A9C" />
      </View>
    );
  }

  const handleAssignCR = async () => {
    try {
      if (!studentEmail.trim()) {
        Alert.alert("Error", "Enter student email");
        return;
      }
      await assignCRRole(studentEmail);
      Alert.alert("Success", `${studentEmail} has been promoted to CR`);
      setStudentEmail("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };
  const handleAssignTeacher = async () => {
    try {
      if (!teacherEmail.trim()) {
        Alert.alert("Error", "Enter teacher email");
        return;
      }
      // Make sure this function exists in your supabase/bookingService file!
      await assignTeacherRole(teacherEmail); 
      Alert.alert("Success", `${teacherEmail} has been promoted to Faculty`);
      setTeacherEmail("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Failed", error.message);
    } else {
      router.replace("/auth");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={[
            styles.roleBadge,
            user.role === "faculty" ? styles.roleBadgeFaculty : 
            user.role === "admin" ? styles.roleBadgeAdmin : 
            user.role === "cr" ? styles.roleBadgeCR :
            styles.roleBadgeStudent
          ]}>
            <Text style={[
              styles.roleText,
              user.role === "faculty" ? styles.roleTextFaculty : 
              user.role === "admin" ? styles.roleTextAdmin : 
              user.role === "cr" ? styles.roleTextCR :
              styles.roleTextStudent
            ]}>
              {user.role === "admin" ? "Admin" : 
               user.role === "faculty" ? "Faculty" : 
               user.role === "cr" ? "CR" : "Student"}
            </Text>
          </View>
        </View>

        {/* Faculty Controls */}
        {user.role === "faculty" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Faculty Controls</Text>
            <Text style={styles.cardDescription}>Assign Class Representative (CR) privileges to a student.</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="student@bmsce.ac.in" placeholderTextColor="#999" value={studentEmail} onChangeText={setStudentEmail} autoCapitalize="none" />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAssignCR}>
              <Text style={styles.primaryButtonText}>Assign CR Role</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Admin Controls (Assign Teacher) */}
        {user.role === "admin" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Admin Controls</Text>
            <Text style={styles.cardDescription}>Assign Faculty (Teacher) privileges to an account.</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="faculty@bmsce.ac.in" 
                placeholderTextColor="#999" 
                value={teacherEmail} 
                onChangeText={setTeacherEmail} 
                autoCapitalize="none" 
              />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAssignTeacher}>
              <Text style={styles.primaryButtonText}>Assign Faculty Role</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Only show these sections for Students and CRs */}
        {(user.role === 'student' || user.role === 'cr') && (
          <>
            {/* Flagship Clubs */}
            <Text style={styles.sectionTitle}>Tech Clubs</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.clubRow} onPress={() => Linking.openURL('https://protocolbmsce.in/')}>
                <Ionicons name="code-slash-outline" size={20} color="#005A9C" />
                <Text style={styles.clubName}>Protocol</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clubRow} onPress={() => Linking.openURL('https://bmsce.acm.org/')}>
                <Ionicons name="laptop-outline" size={20} color="#005A9C" />
                <Text style={styles.clubName}>BMSCE ACM</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clubRow} onPress={() => Linking.openURL('https://gdg.community.dev/gdg-on-campus-bms-college-of-engineering-bengaluru-india/')}>
                <Ionicons name="logo-google" size={20} color="#005A9C" />
                <Text style={styles.clubName}>Google Developers Group</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clubRow} onPress={() => Linking.openURL('https://bmsce.ac.in/home/IEEE-Chapters')}>
                <Ionicons name="earth-outline" size={20} color="#005A9C" />
                <Text style={styles.clubName}>IEEE Chapters</Text>
              </TouchableOpacity>
            </View>

            {/* Campus Resources */}
            <Text style={styles.sectionTitle}>Campus Resources</Text>
            <View style={styles.card}>
              <View style={styles.linksGrid}>
                <View style={styles.row}>
                  <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL('https://notego.in/')}>
                    <Ionicons name="document-text-outline" size={24} color="#005A9C" />
                    <Text style={styles.linkButtonText}>NoteGo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL('https://students.bmsce.ac.in/parents/index.php')}>
                    <Ionicons name="school-outline" size={24} color="#005A9C" />
                    <Text style={styles.linkButtonText}>Contineo</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.row, { marginTop: 20 }]}>
                  <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL('https://bmsce.ac.in/home/Life-at-BMSCE')}>
                    <Ionicons name="people-outline" size={24} color="#005A9C" />
                    <Text style={styles.linkButtonText}>BMSCE Clubs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL('https://www.instagram.com/bmsce.official/')}>
                    <Ionicons name="logo-instagram" size={24} color="#005A9C" />
                    <Text style={styles.linkButtonText}>Social Media</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
          {/*faculty*/}
          {/* Force TypeScript to treat user.role as a generic string for this comparison */}
          {['faculty', 'admin'].includes(user.role as string) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Management Dashboard</Text>
            
            {/* Quick Stats Row */}
            <View style={styles.row}>
              <View style={styles.statBox}>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#005A9C" />
                ) : (
                  <Text style={styles.statValue}>{pendingCount}</Text>
                )}
                <Text style={styles.statLabel}>Pending Approvals</Text>
              </View>
              <View style={styles.statBox}>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#005A9C" />
                ) : (
                  <Text style={styles.statValue}>{bookedCount}</Text>
                )}
                <Text style={styles.statLabel}>Rooms Booked</Text>
              </View>
            </View>

            {/* Maintenance Shortcut */}
            <TouchableOpacity 
              style={styles.maintenanceButton} 
              onPress={() => Linking.openURL('mailto:facility@bmsce.ac.in?subject=Room Maintenance Issue')}>
              <Ionicons name="build-outline" size={20} color="#005A9C" />
              <Text style={styles.maintenanceText}>Report Room Maintenance</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerContainer: { alignItems: "center", marginBottom: 24, marginTop: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#005A9C", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  avatarText: { fontSize: 36, fontWeight: "bold", color: "#FFF" },
  userName: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A" },
  userEmail: { fontSize: 14, color: "#666", marginBottom: 12 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  roleBadgeFaculty: { backgroundColor: "#E3F2FD" },
  roleBadgeStudent: { backgroundColor: "#EEEEEE" },
  roleBadgeAdmin: { backgroundColor: "#FFECB3" },
  roleBadgeCR: { backgroundColor: "#E1F5FE" },
  roleText: { fontSize: 12, fontWeight: "700" },
  roleTextFaculty: { color: "#005A9C" },
  roleTextStudent: { color: "#666666" },
  roleTextAdmin: { color: "#FF8F00" },
  roleTextCR: { color: "#0288D1" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  cardDescription: { fontSize: 14, color: "#4A4A4A", marginBottom: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FA", borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 10, paddingHorizontal: 12, marginBottom: 16 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  primaryButton: { backgroundColor: "#005A9C", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A", marginBottom: 12 },
  linksGrid: { paddingVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  linkButton: { alignItems: 'center', width: 100 },
  linkButtonText: { fontSize: 12, marginTop: 8, color: '#333', fontWeight: '500', textAlign: 'center' },
  logoutButton: { flexDirection: "row", backgroundColor: "#FFF0F0", borderRadius: 12, paddingVertical: 16, justifyContent: "center", alignItems: "center", marginTop: 10 },
  logoutText: { color: "#D32F2F", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  clubName: {
    fontSize: 15,
    color: '#1A1A1A',
    marginLeft: 12,
    fontWeight: '500',
  },
  //faculy
  
  statBox: { 
    backgroundColor: '#F8F9FA', 
    flex: 0.48, 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  statValue: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#005A9C' 
  },
  statLabel: { 
    fontSize: 11, 
    color: '#666', 
    marginTop: 4 
  },
  maintenanceButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 15, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#005A9C', 
    borderRadius: 10 
  },
  maintenanceText: { 
    color: '#005A9C', 
    marginLeft: 8, 
    fontWeight: '600' 
  },
});