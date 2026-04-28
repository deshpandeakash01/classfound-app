import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, Pressable, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchFreeRooms } from '../../services/roomService'; // <-- Make sure this path is correct!

// --- 1. THE BMSCE EXACT TIME SLOTS ---
const BMSCE_SLOTS = [
  { id: 'slot1', label: '08:00 AM - 08:55 AM', dbStart: '08:00:00', dbEnd: '08:55:00' },
  { id: 'slot2', label: '08:55 AM - 09:50 AM', dbStart: '08:55:00', dbEnd: '09:50:00' },
  { id: 'slot3', label: '09:50 AM - 10:45 AM', dbStart: '09:50:00', dbEnd: '10:45:00' },
  { id: 'slot4', label: '11:15 AM - 12:10 PM', dbStart: '11:15:00', dbEnd: '12:10:00' },
  { id: 'slot5', label: '12:10 PM - 01:05 PM', dbStart: '12:10:00', dbEnd: '13:05:00' },
  { id: 'slot6', label: '02:00 PM - 02:55 PM', dbStart: '14:00:00', dbEnd: '14:55:00' },
  { id: 'slot7', label: '02:55 PM - 03:50 PM', dbStart: '14:55:00', dbEnd: '15:50:00' },
  { id: 'slot8', label: '03:50 PM - 04:45 PM', dbStart: '15:50:00', dbEnd: '16:45:00' },
];

// --- 2. DYNAMIC CALENDAR GENERATOR ---
const generateCalendar = (daysAhead = 14) => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < daysAhead; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    let display = nextDate.toLocaleDateString('en-US', options);
    
    if (i === 0) display = 'Today';
    if (i === 1) display = 'Tomorrow';

    dates.push({
      display,
      dbDate: nextDate.toISOString().split('T')[0] 
    });
  }
  return dates;
};

const BLOCKS = ['All', 'APS Block', 'Science Block', 'Mechanical Block'];

export default function SearchScreen() {
  const [activeBlock, setActiveBlock] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // Real Database State
  const [roomsData, setRoomsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calendar Data (FIXED TYPE)
  const [calendarDates, setCalendarDates] = useState<{ display: string, dbDate: string }[]>([]);
  
  // Modal Visibility
  const [modalVisible, setModalVisible] = useState(false);
  
  // Temporary State (FIXED TYPE)
  const [tempDate, setTempDate] = useState<{ display: string, dbDate: string } | null>(null);
  const [tempSlot, setTempSlot] = useState(BMSCE_SLOTS[1]); 

  // Confirmed State (FIXED TYPE)
  const [confirmedDate, setConfirmedDate] = useState<{ display: string, dbDate: string } | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState(BMSCE_SLOTS[1]);

  // Initial Setup
  useEffect(() => {
    const dates = generateCalendar(14);
    setCalendarDates(dates);
    setTempDate(dates[0]);
    setConfirmedDate(dates[0]);
    
    // Fetch initial rooms for "Today" and "Slot 2"
    loadRoomsFromDB(dates[0], BMSCE_SLOTS[1]);
  }, []);

  // --- DATABASE FETCH FUNCTION ---
  const loadRoomsFromDB = async (dateObj: any, slotObj: any) => {
    setIsLoading(true);
    try {
      const dbRooms = await fetchFreeRooms(dateObj.dbDate, slotObj.dbStart, slotObj.dbEnd);
      
      // Map the Supabase SQL response to match our UI expectations
      const formattedRooms = dbRooms.map((r: any) => ({
        id: r.room_id.toString(),
        room: r.room_name,
        block: r.block_name,
        capacity: r.capacity || 80,
        status: 'Available' // Supabase only returns free rooms!
      }));
      
      setRoomsData(formattedRooms);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSlot = () => {
    setConfirmedDate(tempDate);
    setConfirmedSlot(tempSlot);
    setModalVisible(false);
    // Fetch fresh data based on the new selection!
    loadRoomsFromDB(tempDate, tempSlot);
  };

  const filteredRooms = roomsData.filter(room => {
    const matchesBlock = activeBlock === 'All' || room.block === activeBlock;
    const matchesSearch = room.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBlock && matchesSearch;
  });

  if (!confirmedDate) return <SafeAreaView style={styles.container} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Room</Text>
        
        <TouchableOpacity style={styles.activeTimeDisplay} onPress={() => setModalVisible(true)}>
          <Ionicons name="calendar-outline" size={18} color="#005A9C" />
          <View style={styles.activeTimeTextContainer}>
            <Text style={styles.activeTimeLabel}>Searching availability for:</Text>
            <Text style={styles.activeTimeValue}>
              {confirmedDate.display} • {confirmedSlot.label}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#005A9C" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput 
            style={styles.input} 
            placeholder="Search by room name..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005A9C" />
          <Text style={styles.loadingText}>Scanning campus...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList} keyboardShouldPersistTaps="handled">
              {BLOCKS.map((item) => (
                <TouchableOpacity 
                  key={item}
                  style={[styles.filterChip, activeBlock === item && styles.filterChipActive]}
                  onPress={() => setActiveBlock(item)}
                >
                  <Text style={[styles.filterChipText, activeBlock === item && styles.filterChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No rooms available for this block/time.</Text>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.roomName}>{item.room}</Text>
                <Text style={styles.details}>{item.block} • {item.capacity} Seats</Text>
              </View>
              <TouchableOpacity style={styles.bookBtn} onPress={() => {
                  setSelectedRoom(item);
                  setTempDate(confirmedDate);
                  setTempSlot(confirmedSlot);
                  setModalVisible(true);
              }}>
                <Text style={styles.bookBtnText}>Book Slot</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* BOTTOM SHEET MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.closeArea} onPress={() => setModalVisible(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetDragHandle} />
            
            <Text style={styles.sheetTitle}>
              {selectedRoom ? `Book ${selectedRoom.room}` : 'Adjust Time & Date'}
            </Text>
            
            <Text style={styles.sectionLabel}>Select Date</Text>
            <View style={styles.scrollContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {calendarDates.map((dateObj) => (
                  <TouchableOpacity 
                    key={dateObj.dbDate} 
                    activeOpacity={0.7}
                    onPress={() => setTempDate(dateObj)}
                    style={[styles.slotChip, tempDate?.dbDate === dateObj.dbDate && styles.slotChipActive]}
                  >
                    <Text style={[styles.slotText, tempDate?.dbDate === dateObj.dbDate && styles.slotTextActive]}>
                      {dateObj.display}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionLabel}>Select Class Slot</Text>
            <View style={styles.scrollContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {BMSCE_SLOTS.map((slot) => (
                  <TouchableOpacity 
                    key={slot.id} 
                    activeOpacity={0.7}
                    onPress={() => setTempSlot(slot)}
                    style={[styles.slotChip, tempSlot?.id === slot.id && styles.slotChipActive]}
                  >
                    <Text style={[styles.slotText, tempSlot?.id === slot.id && styles.slotTextActive]}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmSlot}>
              <Text style={styles.confirmBtnText}>Confirm Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EAEAEC' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  activeTimeDisplay: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F0F9', padding: 16, borderRadius: 12, marginTop: 15 },
  activeTimeTextContainer: { flex: 1, marginLeft: 12 },
  activeTimeLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  activeTimeValue: { fontSize: 14, fontWeight: 'bold', color: '#005A9C' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 10, padding: 12, marginTop: 15 },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666', fontSize: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { marginTop: 12, color: '#888', fontSize: 16, textAlign: 'center' },
  filterList: { paddingHorizontal: 20, paddingVertical: 15 },
  filterChip: { backgroundColor: '#FFF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  filterChipActive: { backgroundColor: '#005A9C', borderColor: '#005A9C' },
  filterChipText: { color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#FFF' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardInfo: { flex: 1 },
  roomName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  details: { fontSize: 14, color: '#666', marginTop: 4 },
  bookBtn: { backgroundColor: '#005A9C', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  bookBtnText: { color: '#FFF', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  closeArea: { ...StyleSheet.absoluteFillObject },
  bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetDragHandle: { width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1A1A1A' },
  sectionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#444' },
  scrollContainer: { height: 55, marginBottom: 24 }, 
  slotChip: { borderWidth: 1, borderColor: '#E0E0E0', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginRight: 12, backgroundColor: '#FFF', justifyContent: 'center' },
  slotChipActive: { backgroundColor: '#005A9C', borderColor: '#005A9C' },
  slotText: { color: '#666', fontWeight: '600' },
  slotTextActive: { color: '#FFF' },
  confirmBtn: { backgroundColor: '#005A9C', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});