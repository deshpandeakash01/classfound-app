import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Import our global "brain"
import { useUser } from '../../UserContext';

export default function ProfileScreen() {
  // 1. Connect to the Global State
  const { user, setUserRole } = useUser();
  const [studentEmail, setStudentEmail] = useState('');

  // 2. Logic to toggle roles globally
  const toggleRole = () => {
    const newRole = user.role === 'faculty' ? 'student' : 'faculty';
    setUserRole(newRole);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dev Toggle - Updates Home & Profile instantly */}
      <TouchableOpacity style={styles.devToggle} onPress={toggleRole}>
        <Text style={styles.devToggleText}>
          Dev Mode: Switch to {user.role === 'faculty' ? 'Student' : 'Faculty'} View
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.headerContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={[
            styles.roleBadge, 
            user.role === 'faculty' ? styles.roleBadgeFaculty : styles.roleBadgeStudent
          ]}>
            <Text style={[
              styles.roleText, 
              user.role === 'faculty' ? styles.roleTextFaculty : styles.roleTextStudent
            ]}>
              {user.role === 'faculty' ? 'Faculty' : 'Student'}
            </Text>
          </View>
        </View>

        {/* 3. FACULTY ONLY SECTION: Assign CR Role */}
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

        {/* 4. CONDITIONAL RENDER: Hide Bookings for Students */}
        {user.role !== 'student' && (
          <>
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
                <Text style={styles.emptyStateText}>
                  You haven't reserved any labs or halls yet.
                </Text>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Schedule Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Generic Profile Settings */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  devToggle: { backgroundColor: '#FFE0B2', padding: 10, alignItems: 'center' },
  devToggleText: { fontSize: 12, color: '#E65100', fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatar: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#005A9C', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 4 
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 12 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleBadgeFaculty: { backgroundColor: '#E3F2FD' },
  roleBadgeStudent: { backgroundColor: '#F5F5F5' },
  roleText: { fontSize: 13, fontWeight: '700' },
  roleTextFaculty: { color: '#005A9C' },
  roleTextStudent: { color: '#757575' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 25, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', 
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, marginBottom: 16 
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#333' },
  primaryButton: { backgroundColor: '#005A9C', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  linkText: { color: '#005A9C', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', paddingVertical: 15 },
  iconCircle: { 
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3F4F6', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 12 
  },
  emptyStateTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  emptyStateText: { color: '#666', textAlign: 'center', marginTop: 4 },
  secondaryButton: { marginTop: 15, borderWidth: 1, borderColor: '#005A9C', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
  secondaryButtonText: { color: '#005A9C', fontWeight: 'bold' },
  logoutButton: { 
    flexDirection: 'row', backgroundColor: '#FEF2F2', borderRadius: 12, 
    paddingVertical: 16, justifyContent: 'center', alignItems: 'center' 
  },
  logoutText: { color: '#DC2626', fontWeight: 'bold', marginLeft: 8 },
});