import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { FilterChip, EmptyState, Button, SearchBar } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { Room } from '../../types/contract';

const BUILDINGS = ['All Buildings', 'Block A', 'Block B', 'Admin Block'];
const CAPACITY_OPTIONS = [
  { label: 'Any Size', min: 0 },
  { label: 'Study (4-8)', min: 4, max: 10 },
  { label: 'Medium (15-40)', min: 15, max: 40 },
  { label: 'Hall (50+)', min: 50 },
];

const TIME_BLOCKS = [
  { slot: '08:30 - 10:00', start: '08:30', end: '10:00' },
  { slot: '10:00 - 11:30', start: '10:00', end: '11:30' },
  { slot: '11:30 - 13:00', start: '11:30', end: '13:00' },
  { slot: '13:30 - 15:00', start: '13:30', end: '15:00' },
  { slot: '15:00 - 16:30', start: '15:00', end: '16:30' },
  { slot: '16:30 - 18:00', start: '16:30', end: '18:00' },
  { slot: '18:00 - 19:30', start: '18:00', end: '19:30' },
];

export const ClassroomAvailabilityScreen: React.FC = () => {
  const { goBack, navigate, rooms, bookings } = useNavigation();

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-21');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All Buildings');
  const [selectedCapacityIdx, setSelectedCapacityIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (selectedBuilding !== 'All Buildings' && room.building !== selectedBuilding) {
        return false;
      }
      const cap = CAPACITY_OPTIONS[selectedCapacityIdx];
      if (cap.min && room.capacity < cap.min) return false;
      if (cap.max && room.capacity > cap.max) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = room.name.toLowerCase().includes(q);
        const bldgMatch = room.building.toLowerCase().includes(q);
        const featMatch = room.features.some((f) => f.toLowerCase().includes(q));
        if (!nameMatch && !bldgMatch && !featMatch) return false;
      }
      return true;
    });
  }, [rooms, selectedBuilding, selectedCapacityIdx, searchQuery]);

  // Check if a room is booked for a specific time block on the selected date
  const isRoomSlotBooked = (roomId: string, blockStart: string) => {
    // Check against bookings
    return bookings.some((b) => {
      if (b.status === 'cancelled' || b.status === 'cancelled_by_closure') return false;
      if (b.roomId !== roomId) return false;

      // Check date match
      const bookingDate = b.startsAt.substring(0, 10);
      if (bookingDate !== selectedDate) return false;

      // Compare slot roughly
      const d = new Date(b.startsAt);
      const hours = d.getUTCHours() + 5; // Colombo UTC+5:30 offset approx
      const mins = d.getUTCMinutes() + 30;
      const totalMinutes = hours * 60 + mins;

      const [bHour, bMin] = blockStart.split(':').map(Number);
      const slotMinutes = bHour * 60 + bMin;

      // Overlap if within 60 mins of slot start
      return Math.abs(totalMinutes - slotMinutes) < 60;
    });
  };

  const handleBookSlot = (room: Room, startTime: string, endTime: string) => {
    navigate('room_booking_request', {
      roomId: room.id,
      roomName: room.name,
      date: selectedDate,
      startTime,
      endTime,
      capacity: room.capacity,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Booking Shortcut Strip */}
      <View style={styles.bookingShortcutStrip}>
        <View style={{ flex: 1 }}>
          <Text style={styles.shortcutTitle}>Classrooms & Labs</Text>
          <Text style={styles.shortcutSubtitle}>Check availability and reserve study rooms</Text>
        </View>
        <TouchableOpacity
          style={styles.myBookingsBtn}
          onPress={() => navigate('my_bookings')}
          activeOpacity={0.8}
        >
          <Text style={styles.myBookingsBtnText}>My Bookings →</Text>
        </TouchableOpacity>
      </View>

      {/* Date Switcher Bar */}
      <View style={styles.dateBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          <TouchableOpacity
            style={[styles.dateChip, selectedDate === '2026-09-21' && styles.dateChipActive]}
            onPress={() => setSelectedDate('2026-09-21')}
            activeOpacity={0.8}
          >
            <Text style={[styles.dateDayText, selectedDate === '2026-09-21' && styles.dateDayTextActive]}>
              Mon
            </Text>
            <Text style={[styles.dateNumText, selectedDate === '2026-09-21' && styles.dateNumTextActive]}>
              21 Sep
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateChip, selectedDate === '2026-09-22' && styles.dateChipActive]}
            onPress={() => setSelectedDate('2026-09-22')}
            activeOpacity={0.8}
          >
            <Text style={[styles.dateDayText, selectedDate === '2026-09-22' && styles.dateDayTextActive]}>
              Tue
            </Text>
            <Text style={[styles.dateNumText, selectedDate === '2026-09-22' && styles.dateNumTextActive]}>
              22 Sep
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateChip, selectedDate === '2026-09-23' && styles.dateChipActive]}
            onPress={() => setSelectedDate('2026-09-23')}
            activeOpacity={0.8}
          >
            <Text style={[styles.dateDayText, selectedDate === '2026-09-23' && styles.dateDayTextActive]}>
              Wed
            </Text>
            <Text style={[styles.dateNumText, selectedDate === '2026-09-23' && styles.dateNumTextActive]}>
              23 Sep
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateChip, selectedDate === '2026-09-24' && styles.dateChipActive]}
            onPress={() => setSelectedDate('2026-09-24')}
            activeOpacity={0.8}
          >
            <Text style={[styles.dateDayText, selectedDate === '2026-09-24' && styles.dateDayTextActive]}>
              Thu
            </Text>
            <Text style={[styles.dateNumText, selectedDate === '2026-09-24' && styles.dateNumTextActive]}>
              24 Sep
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateChip, selectedDate === '2026-09-25' && styles.dateChipActive]}
            onPress={() => setSelectedDate('2026-09-25')}
            activeOpacity={0.8}
          >
            <Text style={[styles.dateDayText, selectedDate === '2026-09-25' && styles.dateDayTextActive]}>
              Fri
            </Text>
            <Text style={[styles.dateNumText, selectedDate === '2026-09-25' && styles.dateNumTextActive]}>
              25 Sep
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search rooms, projectors, whiteboards..."
          onClear={() => setSearchQuery('')}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {BUILDINGS.map((bldg) => (
            <FilterChip
              key={bldg}
              label={bldg}
              selected={selectedBuilding === bldg}
              onPress={() => setSelectedBuilding(bldg)}
            />
          ))}
          {CAPACITY_OPTIONS.map((cap, idx) => (
            <FilterChip
              key={cap.label}
              label={cap.label}
              selected={selectedCapacityIdx === idx}
              onPress={() => setSelectedCapacityIdx(idx)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success[500] }]} />
            <Text style={styles.legendText}>Available (Tap to Book)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.critical[500] }]} />
            <Text style={styles.legendText}>Booked / Lecture</Text>
          </View>
        </View>

        {filteredRooms.length === 0 ? (
          <EmptyState
            title="No Rooms Match Filters"
            description="Try selecting a different building, capacity range, or date."
            action={{
              label: 'Reset Filters',
              onPress: () => {
                setSelectedBuilding('All Buildings');
                setSelectedCapacityIdx(0);
                setSearchQuery('');
              },
            }}
          />
        ) : (
          filteredRooms.map((room) => {
            return (
              <View key={room.id} style={styles.roomCard}>
                <View style={styles.roomCardHeader}>
                  <View style={styles.roomMainInfo}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomLocation}>
                      {room.building} · Floor {room.floor} · Open {room.openTime}–{room.closeTime}
                    </Text>
                  </View>

                  <View style={styles.capacityBadge}>
                    <Text style={styles.capacityText}>👥 {room.capacity} seats</Text>
                  </View>
                </View>

                {/* Features tags */}
                <View style={styles.featureRow}>
                  {room.features.map((f) => (
                    <View key={f} style={styles.featureChip}>
                      <Text style={styles.featureText}>{f.replace('_', ' ')}</Text>
                    </View>
                  ))}
                </View>

                {/* Time Slots Strip */}
                <Text style={styles.slotsLabel}>Available Slots on {selectedDate}:</Text>
                <View style={styles.slotsGrid}>
                  {TIME_BLOCKS.map((block) => {
                    const isBooked = isRoomSlotBooked(room.id, block.start);

                    return (
                      <TouchableOpacity
                        key={block.slot}
                        style={[
                          styles.slotBtn,
                          isBooked ? styles.slotBtnBooked : styles.slotBtnFree,
                        ]}
                        onPress={() => !isBooked && handleBookSlot(room, block.start, block.end)}
                        disabled={isBooked}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.slotTimeText,
                            isBooked ? styles.slotTimeTextBooked : styles.slotTimeTextFree,
                          ]}
                        >
                          {block.slot}
                        </Text>
                        <Text
                          style={[
                            styles.slotStatusText,
                            isBooked ? styles.slotStatusTextBooked : styles.slotStatusTextFree,
                          ]}
                        >
                          {isBooked ? '🔴 Busy' : '🟢 Free'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Book Room Full Button */}
                <View style={styles.roomCardFooter}>
                  <Button
                    title="Reserve Room Custom Time"
                    variant="secondary"
                    size="sm"
                    onPress={() =>
                      navigate('room_booking_request', {
                        roomId: room.id,
                        roomName: room.name,
                        date: selectedDate,
                        startTime: '10:00',
                        endTime: '11:30',
                        capacity: room.capacity,
                      })
                    }
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  bookingShortcutStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2.5],
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  shortcutTitle: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
  },
  shortcutSubtitle: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 1,
  },
  myBookingsBtn: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.sm,
  },
  myBookingsBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[700],
  },
  dateBar: {
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing[2.5],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  dateScroll: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  dateChip: {
    paddingHorizontal: spacing[3.5],
    paddingVertical: spacing[1.5],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    minWidth: 64,
  },
  dateChipActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  dateDayText: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  dateDayTextActive: {
    color: colors.neutral[0],
  },
  dateNumText: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '700',
    marginTop: 1,
  },
  dateNumTextActive: {
    color: colors.neutral[0],
  },
  filterSection: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  chipRow: {
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[0],
    padding: spacing[2.5],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[2],
  },
  legendText: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  roomCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  roomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  roomMainInfo: {
    flex: 1,
    marginRight: spacing[2],
  },
  roomName: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[0.5],
  },
  roomLocation: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  capacityBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  capacityText: {
    ...typography.caption,
    color: colors.primary[800],
    fontWeight: '700',
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
    marginBottom: spacing[3],
  },
  featureChip: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: radius.sm,
  },
  featureText: {
    ...typography.caption,
    color: colors.neutral[600],
    textTransform: 'capitalize',
  },
  slotsLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  slotBtn: {
    width: '48%',
    padding: spacing[2.5],
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotBtnFree: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
  },
  slotBtnBooked: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
    opacity: 0.6,
  },
  slotTimeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  slotTimeTextFree: {
    color: colors.success[900],
  },
  slotTimeTextBooked: {
    color: colors.neutral[500],
  },
  slotStatusText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  slotStatusTextFree: {
    color: colors.success[700],
  },
  slotStatusTextBooked: {
    color: colors.neutral[500],
  },
  roomCardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[2.5],
    alignItems: 'flex-end',
  },
});
