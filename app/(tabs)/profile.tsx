import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../UserContext';

export default function ProfileScreen() {
  const { user, setUserRole } = useUser();
  const [studentEmail, setStudentEmail] = useState('');

  const toggleRole = () => {
    const newRole = user.role === 'faculty' ? 'student' : 'faculty';
    setUserRole(newRole);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dev Toggle sits at the very top */}
      <TouchableOpacity style={styles.devToggle} onPress={toggleRole}>
        <Text style={styles.devToggleText}>
          Dev Mode: Switch to {user.role === 'faculty' ? 'Student' : 'Faculty'} View
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={[styles.roleBadge, user.role === 'faculty' ? styles.roleBadgeFaculty : styles.roleBadgeStudent]}>
            <Text style={[styles.roleText, user.role === 'faculty' ? styles.roleTextFaculty : styles.roleTextStudent]}>
              {user.role === 'faculty' ? 'Faculty' : 'Student'}
            </Text>
          </View>
        </View>

        {/* FACULTY ONLY SECTION: Assign CR Role */}
        {user.role === 'faculty' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Faculty Controls</Text>
            <Text style={styles.cardDescription}>Assign Class Representative (CR) privileges to a student.</Text>
            <Text style={styles.inputLabel}>Student Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="student.cse24@bmsce.ac.in"
                placeholderTextColor="#999"
                value={studentEmail}
                onChangeText={setStudentEmail}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Assign CR Role</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* My Bookings Section - Always visible now */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Bookings</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={32} color="#666" />
            </View>
            <Text style={styles.emptyStateTitle}>No Upcoming Bookings</Text>
            <Text style={styles.emptyStateText}>Book lab slots or seminar halls for your next session.</Text>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Schedule Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F4F6F8' 
  },
  devToggle: { 
    backgroundColor: '#FFE0B2', 
    paddingVertical: 12, // Increased padding
    paddingTop: 45,      // NEW: This pushes the text below the phone's notch/clock
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFCC80',
  },
  devToggleText: { 
    fontSize: 12, 
    color: '#E65100', 
    fontWeight: 'bold' 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40 
  },
  headerContainer: { 
    alignItems: 'center', 
    marginBottom: 24, 
    marginTop: 20       // Added margin to separate from the dev bar
  },
  avatar: { 
    width: 90,          // Slightly larger for better visual hierarchy
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#005A9C', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarText: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: '#FFF' 
  },
  userName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1A1A1A' 
  },
  userEmail: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 4, 
    marginBottom: 12 
  },
  roleBadge: { 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  roleBadgeFaculty: { backgroundColor: '#E3F2FD' },
  roleBadgeStudent: { backgroundColor: '#EEEEEE' },
  roleText: { fontSize: 12, fontWeight: '700' },
  roleTextFaculty: { color: '#005A9C' },
  roleTextStudent: { color: '#666666' },
  
  // Card styles remain the same
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardDescription: { fontSize: 14, color: '#4A4A4A', marginBottom: 16, lineHeight: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 12, marginBottom: 16 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#333' },
  primaryButton: { backgroundColor: '#005A9C', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  linkText: { fontSize: 14, color: '#005A9C', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 15 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F4F6F8', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyStateTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  secondaryButton: { borderWidth: 1, borderColor: '#005A9C', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, marginTop: 16 },
  secondaryButtonText: { color: '#005A9C', fontSize: 14, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', backgroundColor: '#FFF0F0', borderRadius: 12, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#D32F2F', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});