import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// Import the global user hook
import { useUser } from '../../UserContext'; 

export default function HomeScreen() {
  const router = useRouter();
  
  // 1. Hook into the Global State
  const { user } = useUser();

  // Dummy data tailored to BMSCE
  const availableNearYou = [
    { id: '1', room: 'UG-LAB 1', block: 'PJA Block', time: 'Available for 2 hrs' },
    { id: '2', room: 'APS-102', block: 'APS Block', time: 'Available all day' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            {/* 2. DYNAMIC NAME: Automatically shows Dr. Sharma or Rahul Kumar */}
            <Text style={styles.name}>{user.name}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarMini}>
            {/* 3. DYNAMIC INITIALS: Automatically shows DS or RK */}
            <Text style={styles.avatarText}>{user.initials}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Need a space?</Text>
            <Text style={styles.heroSubtitle}>Find an empty lab or classroom for your group study.</Text>
          </View>
          <TouchableOpacity 
            style={styles.heroButton}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.heroButtonText}>Find a Room Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#005A9C" />
          </TouchableOpacity>
        </View>

        {/* Quick Recommendations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Near You</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {availableNearYou.map((item) => (
            <View key={item.id} style={styles.roomCard}>
              <View style={styles.roomHeader}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.blockText}>{item.block}</Text>
              </View>
              <Text style={styles.roomName}>{item.room}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  scrollContent: { padding: 20 },
header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30, 
    marginTop: 50, // Give it plenty of room from the top of the screen
},
  greeting: { fontSize: 16, color: '#666' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  avatarMini: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#005A9C', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  heroCard: { 
    backgroundColor: '#005A9C', 
    borderRadius: 16, 
    padding: 24, 
    marginBottom: 30, 
    shadowColor: '#005A9C', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  heroTextContainer: { marginBottom: 20 },
  heroTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  heroSubtitle: { color: '#E3F2FD', fontSize: 14, lineHeight: 20 },
  heroButton: { 
    backgroundColor: '#FFF', 
    alignSelf: 'flex-start', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 24, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  heroButtonText: { color: '#005A9C', fontWeight: 'bold', marginRight: 8 },

  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  horizontalList: { overflow: 'visible' },
  roomCard: { 
    backgroundColor: '#FFF', 
    width: 200, 
    padding: 16, 
    borderRadius: 16, 
    marginRight: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  roomHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  blockText: { color: '#666', fontSize: 12, marginLeft: 4 },
  roomName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  badge: { backgroundColor: '#E8F5E9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { color: '#2E7D32', fontSize: 12, fontWeight: '600' },
});