import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, Button, FormField } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

const PURPOSES = [
  'Group Study & Revision',
  'Software Project Meeting',
  'Presentation / Pitch Practice',
  'Society Committee Discussion',
  'Quiet Reading & Research',
];

export const RoomBookingRequestScreen: React.FC = () => {
  const { params, goBack, navigate, rooms, createBooking, bookings } = useNavigation();

  const prefilledRoomId = params?.roomId || 'room_b204';
  const prefilledDate = params?.date || '2026-09-21';
  const prefilledStart = params?.startTime || '10:00';
  const prefilledEnd = params?.endTime || '11:30';

  const [selectedRoomId, setSelectedRoomId] = useState<string>(prefilledRoomId);
  const [date, setDate] = useState<string>(prefilledDate);
  const [startTime, setStartTime] = useState<string>(prefilledStart);
  const [endTime, setEndTime] = useState<string>(prefilledEnd);
  const [purpose, setPurpose] = useState<string>('Group Study & Revision');
  const [customPurpose, setCustomPurpose] = useState<string>('');
  const [attendees, setAttendees] = useState<string>('4');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedBooking, setSubmittedBooking] = useState<any | null>(null);

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const handleSubmit = () => {
    setError(null);
    const numAttendees = parseInt(attendees, 10);

    if (isNaN(numAttendees) || numAttendees <= 0) {
      setError('Please enter a valid number of attendees (1 or more).');
      return;
    }

    if (currentRoom && numAttendees > currentRoom.capacity) {
      setError(`Selected room (${currentRoom.name}) max capacity is ${currentRoom.capacity} seats.`);
      return;
    }

    const activePurpose = customPurpose.trim() || purpose;
    if (!activePurpose) {
      setError('Please specify the booking purpose.');
      return;
    }

    // Check conflict against existing bookings
    const startsAtIso = `${date}T${startTime}:00.000Z`;
    const endsAtIso = `${date}T${endTime}:00.000Z`;

    const hasConflict = bookings.some((b) => {
      if (b.status === 'cancelled' || b.status === 'cancelled_by_closure') return false;
      if (b.roomId !== selectedRoomId) return false;
      if (!b.startsAt.startsWith(date)) return false;
      // Overlap logic
      return (
        (startsAtIso >= b.startsAt && startsAtIso < b.endsAt) ||
        (endsAtIso > b.startsAt && endsAtIso <= b.endsAt)
      );
    });

    if (hasConflict) {
      setError('A reservation already exists for this room during that time window. Please choose another slot or room.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newBooking = createBooking({
        roomId: currentRoom.id,
        roomName: currentRoom.name,
        startsAt: startsAtIso,
        endsAt: endsAtIso,
        purpose: activePurpose,
        attendees: numAttendees,
        status: 'confirmed',
        source: 'student',
      });

      setSubmittedBooking(newBooking);
    }, 600);
  };

  if (submittedBooking) {
    return (
      <View style={styles.container}>
        <Header title="Booking Confirmed" showBack onBack={goBack} />
        <View style={styles.successContent}>
          <View style={styles.successIconBox}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>
          <Text style={styles.successTitle}>Room Reservation Confirmed!</Text>
          <Text style={styles.successBody}>
            {currentRoom.name} is reserved for your group. A confirmation notification and calendar entry have been added to your hub.
          </Text>

          <View style={styles.ticketSummaryBox}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Room:</Text>
              <Text style={styles.ticketValue}>{currentRoom.name} ({currentRoom.building})</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Date & Time:</Text>
              <Text style={styles.ticketValue}>{date} · {startTime}–{endTime}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Attendees:</Text>
              <Text style={styles.ticketValue}>{attendees} students</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Status:</Text>
              <Text style={[styles.ticketValue, { color: colors.success[700] }]}>Instant Confirmed</Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <Button
              title="View in My Bookings"
              variant="primary"
              size="lg"
              onPress={() => navigate('my_bookings')}
              style={{ marginBottom: spacing[3] }}
            />
            <Button
              title="Check More Availability"
              variant="secondary"
              size="md"
              onPress={() => navigate('classroom_availability')}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Book a Study Room"
        showBack
        onBack={goBack}
        rightAction={{
          label: 'Availability',
          onPress: () => navigate('classroom_availability'),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>Student Room Reservation Policy</Text>
          <Text style={styles.infoBannerText}>
            Study and discussion rooms can be booked up to 7 days in advance. Please ensure the room is left clean and tidy.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Room Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Room</Text>
          <View style={styles.roomSelectorGrid}>
            {rooms.map((r) => {
              const isSelected = selectedRoomId === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roomSelectCard, isSelected && styles.roomSelectCardActive]}
                  onPress={() => setSelectedRoomId(r.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.roomSelectHeader}>
                    <Text style={[styles.roomSelectName, isSelected && styles.roomSelectNameActive]}>
                      {r.name}
                    </Text>
                    <Text style={styles.roomSelectCap}>👥 {r.capacity}</Text>
                  </View>
                  <Text style={styles.roomSelectBldg}>{r.building} · Fl {r.floor}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date & Time Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time Window</Text>
          <FormField
            label="Booking Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            placeholder="e.g. 2026-09-21"
          />

          <View style={styles.twoColumn}>
            <View style={{ flex: 1, marginRight: spacing[2] }}>
              <FormField
                label="Start Time"
                value={startTime}
                onChangeText={setStartTime}
                placeholder="10:00"
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                label="End Time"
                value={endTime}
                onChangeText={setEndTime}
                placeholder="11:30"
              />
            </View>
          </View>
        </View>

        {/* Attendees Count with capacity warning */}
        <FormField
          label={`Expected Group Size (Max ${currentRoom.capacity})`}
          value={attendees}
          onChangeText={setAttendees}
          keyboardType="numeric"
          placeholder="e.g. 4"
          helper={
            parseInt(attendees, 10) > currentRoom.capacity
              ? `⚠️ Exceeds room capacity (${currentRoom.capacity} seats)!`
              : `Within room limit (${currentRoom.capacity} seats)`
          }
        />

        {/* Purpose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purpose of Booking</Text>
          <View style={styles.purposeList}>
            {PURPOSES.map((p) => {
              const isSelected = purpose === p && !customPurpose;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.purposeRow, isSelected && styles.purposeRowSelected]}
                  onPress={() => {
                    setPurpose(p);
                    setCustomPurpose('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.radioIcon}>{isSelected ? '◉' : '○'}</Text>
                  <Text style={[styles.purposeText, isSelected && styles.purposeTextSelected]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FormField
            label="Or describe custom purpose"
            value={customPurpose}
            onChangeText={setCustomPurpose}
            placeholder="e.g. FYP final review with supervisor"
            containerStyle={{ marginTop: spacing[2] }}
          />
        </View>

        {/* Submit */}
        <View style={styles.actionContainer}>
          <Button
            title={loading ? 'Confirming Reservation...' : 'Confirm Room Booking'}
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={loading}
          />
        </View>
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
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  infoBanner: {
    backgroundColor: colors.primary[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
    borderRadius: radius.md,
    padding: spacing[3.5],
    marginBottom: spacing[4],
  },
  infoBannerTitle: {
    ...typography.labelSm,
    color: colors.primary[900],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  infoBannerText: {
    ...typography.bodySm,
    color: colors.primary[800],
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: colors.critical[50],
    borderWidth: 1,
    borderColor: colors.critical[200],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    ...typography.bodySm,
    color: colors.critical[700],
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.labelSm,
    color: colors.neutral[800],
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  roomSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  roomSelectCard: {
    width: '48%',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
  },
  roomSelectCardActive: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  roomSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  roomSelectName: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '700',
    flex: 1,
  },
  roomSelectNameActive: {
    color: colors.primary[900],
  },
  roomSelectCap: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  roomSelectBldg: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  twoColumn: {
    flexDirection: 'row',
  },
  purposeList: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  purposeRowSelected: {
    backgroundColor: colors.primary[50],
  },
  radioIcon: {
    fontSize: 16,
    color: colors.primary[600],
    marginRight: spacing[2.5],
  },
  purposeText: {
    ...typography.bodySm,
    color: colors.neutral[800],
  },
  purposeTextSelected: {
    color: colors.primary[900],
    fontWeight: '700',
  },
  actionContainer: {
    marginTop: spacing[3],
  },
  // Success state
  successContent: {
    flex: 1,
    padding: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  successEmoji: {
    fontSize: 34,
  },
  successTitle: {
    ...typography.headlineMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  successBody: {
    ...typography.bodyMd,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing[5],
    lineHeight: 22,
  },
  ticketSummaryBox: {
    width: '100%',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[1.5],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  ticketLabel: {
    ...typography.bodySm,
    color: colors.neutral[500],
  },
  ticketValue: {
    ...typography.labelSm,
    color: colors.neutral[800],
    fontWeight: '600',
  },
  successActions: {
    width: '100%',
  },
});
