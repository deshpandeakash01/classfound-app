import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ROOM_DATA = [
  { id: '1', room: 'UG-LAB 1', block: 'PJA Block', capacity: 40, status: 'Available' },
  { id: '2', room: 'APS-101', block: 'APS Block', capacity: 60, status: 'Available' },
  { id: '3', room: 'MCA Lab', block: 'PG Block', capacity: 50, status: 'Booked' },
  { id: '4', room: 'Seminar Hall 2', block: 'PJA Block', capacity: 120, status: 'Available' },
  { id: '5', room: 'Main CAD Lab', block: 'Mechanical Block', capacity: 80, status: 'Available' },
];

const BLOCKS = ['All', 'PJA Block', 'APS Block', 'PG Block', 'Mechanical Block'];
const TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'];
const DATES = ['Today', 'Tomorrow', 'Wed, 24th', 'Thu, 25th'];

export default function SearchScreen() {
  const [activeBlock, setActiveBlock] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [selectedDate, setSelectedDate] = useState('Today');

  const filteredRooms = ROOM_DATA.filter(room => {
    const matchesBlock = activeBlock === 'All' || room.block === activeBlock;
    const matchesSearch = room.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBlock && matchesSearch;
  });

  const openBookingSheet = (room) => {
    setSelectedRoom(room);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Room</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput 
            style={styles.input} 
            placeholder="Search by room name..." 
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.timeFilterRow}>
          <TouchableOpacity style={styles.timePill}>
            <Ionicons name="calendar-outline" size={16} color="#005A9C" />
            <Text style={styles.timePillText}>Today, 10:00 AM</Text>
            <Ionicons name="chevron-down" size={14} color="#005A9C" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.nowChip}>
            <Text style={styles.nowChipText}>Right Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={BLOCKS}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.filterChip, activeBlock === item && styles.filterChipActive]}
              onPress={() => setActiveBlock(item)}
            >
              <Text style={[styles.filterChipText, activeBlock === item && styles.filterChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredRooms}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.roomName}>{item.room}</Text>
              <Text style={styles.details}>{item.block} • {item.capacity} Seats</Text>
              <View style={[styles.statusBadge, item.status === 'Available' ? styles.statusAvail : styles.statusBooked]}>
                <Text style={[styles.statusText, item.status === 'Available' ? styles.textAvail : styles.textBooked]}>{item.status}</Text>
              </View>
            </View>
            {item.status === 'Available' && (
              <TouchableOpacity style={styles.bookBtn} onPress={() => openBookingSheet(item)}>
                <Text style={styles.bookBtnText}>Book Slot</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetDragHandle} />
            {selectedRoom && (
              <>
                <Text style={styles.sheetTitle}>Book {selectedRoom.room}</Text>
                <Text style={styles.sheetSubtitle}>{selectedRoom.block} • {selectedRoom.capacity} Seats</Text>
                
                <Text style={styles.sectionLabel}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                  {DATES.map(date => (
                    <TouchableOpacity key={date} style={[styles.slotChip, selectedDate === date && styles.slotChipActive]} onPress={() => setSelectedDate(date)}>
                      <Text style={[styles.slotText, selectedDate === date && styles.slotTextActive]}>{date}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.sectionLabel}>Select Start Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                  {TIME_SLOTS.map(time => (
                    <TouchableOpacity key={time} style={[styles.slotChip, selectedTime === time && styles.slotChipActive]} onPress={() => setSelectedTime(time)}>
                      <Text style={[styles.slotText, selectedTime === time && styles.slotTextActive]}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity style={styles.confirmBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.confirmBtnText}>Confirm for {selectedDate} at {selectedTime}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { padding: 20, backgroundColor: '#FFF', paddingBottom: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 15 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
  timeFilterRow: { flexDirection: 'row', alignItems: 'center' },
  timePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 10 },
  timePillText: { color: '#005A9C', fontWeight: '600', fontSize: 13, marginHorizontal: 6 },
  nowChip: { borderWidth: 1, borderColor: '#E0E0E0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  nowChipText: { color: '#666', fontWeight: '600', fontSize: 13 },
  filterList: { paddingHorizontal: 20, paddingVertical: 15 },
  filterChip: { backgroundColor: '#FFF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  filterChipActive: { backgroundColor: '#005A9C', borderColor: '#005A9C' },
  filterChipText: { color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#FFF', fontWeight: 'bold' },
  listContainer: { padding: 20, paddingTop: 0 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardInfo: { flex: 1 },
  roomName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  details: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 8 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' },
  statusAvail: { backgroundColor: '#E8F5E9' },
  statusBooked: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 12, fontWeight: '600' },
  textAvail: { color: '#2E7D32' },
  textBooked: { color: '#C62828' },
  bookBtn: { backgroundColor: '#005A9C', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  bookBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetDragHandle: { width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  sheetSubtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 24 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 },
  scrollRow: { marginBottom: 20, maxHeight: 50 },
  slotChip: { borderWidth: 1, borderColor: '#E0E0E0', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, marginRight: 12, backgroundColor: '#FFF' },
  slotChipActive: { backgroundColor: '#005A9C', borderColor: '#005A9C' },
  slotText: { color: '#666', fontWeight: '600', fontSize: 14 },
  slotTextActive: { color: '#FFF', fontWeight: 'bold' },
  confirmBtn: { backgroundColor: '#005A9C', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});