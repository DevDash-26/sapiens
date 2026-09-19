import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { StatusBadge, EmptyState, Button, FilterChip } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { Booking } from '../../types/contract';

export const MyBookingsScreen: React.FC = () => {
  const { goBack, navigate, bookings, cancelBooking, currentUser } = useNavigation();

  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter bookings belonging to the user
  const myBookings = useMemo(() => {
    return bookings.filter((b) => b.uid === currentUser.id);
  }, [bookings, currentUser.id]);

  const activeCount = myBookings.filter((b) => b.status === 'confirmed').length;
  const cancelledCount = myBookings.filter(
    (b) => b.status === 'cancelled' || b.status === 'cancelled_by_closure'
  ).length;

  const filteredBookings = useMemo(() => {
    return myBookings.filter((b) => {
      if (statusFilter === 'confirmed' && b.status !== 'confirmed') return false;
      if (
        statusFilter === 'cancelled' &&
        b.status !== 'cancelled' &&
        b.status !== 'cancelled_by_closure'
      )
        return false;
      return true;
    });
  }, [myBookings, statusFilter]);

  const formatDateTime = (startsAt: string, endsAt: string) => {
    const d = new Date(startsAt);
    const dateStr = d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const startLocal = startsAt.substring(11, 16);
    const endLocal = endsAt.substring(11, 16);

    return {
      dateStr,
      timeStr: `${startLocal} – ${endLocal}`,
    };
  };

  const handleCancelBooking = (booking: Booking) => {
    cancelBooking(booking.id, 'User self-cancelled');
  };

  return (
    <View style={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.topActionBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.topActionTitle}>Room Reservations</Text>
          <Text style={styles.topActionSub}>Review and manage your booked campus spaces</Text>
        </View>
        <TouchableOpacity
          style={styles.newBookingBtn}
          onPress={() => navigate('classroom_availability')}
          activeOpacity={0.8}
        >
          <Text style={styles.newBookingBtnText}>+ Book Room</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Metrics */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiNum, { color: colors.primary[700] }]}>{activeCount}</Text>
          <Text style={styles.kpiLabel}>Confirmed Bookings</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNum}>{myBookings.length}</Text>
          <Text style={styles.kpiLabel}>Total History</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiNum, { color: colors.neutral[400] }]}>{cancelledCount}</Text>
          <Text style={styles.kpiLabel}>Cancelled</Text>
        </View>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <FilterChip
            label={`All Reservations (${myBookings.length})`}
            selected={statusFilter === 'all'}
            onPress={() => setStatusFilter('all')}
          />
          <FilterChip
            label={`🟢 Active & Confirmed (${activeCount})`}
            selected={statusFilter === 'confirmed'}
            onPress={() => setStatusFilter('confirmed')}
          />
          <FilterChip
            label={`⚪ Cancelled (${cancelledCount})`}
            selected={statusFilter === 'cancelled'}
            onPress={() => setStatusFilter('cancelled')}
          />
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredBookings.length === 0 ? (
          <EmptyState
            title="No Room Bookings"
            description="You don't have any active room reservations. Explore available discussion rooms and study spaces across campus."
            action={{
              label: 'Browse Available Rooms',
              onPress: () => navigate('classroom_availability'),
            }}
          />
        ) : (
          filteredBookings.map((b) => {
            const { dateStr, timeStr } = formatDateTime(b.startsAt, b.endsAt);
            const isConfirmed = b.status === 'confirmed';

            return (
              <View key={b.id} style={styles.bookingCard}>
                <View style={styles.cardTop}>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{b.roomName}</Text>
                    <Text style={styles.bookingId}>ID: {b.id.toUpperCase()}</Text>
                  </View>

                  <StatusBadge status={b.status} />
                </View>

                {/* Date & Time block */}
                <View style={styles.timeBlock}>
                  <Text style={styles.timeIcon}>📅</Text>
                  <View>
                    <Text style={styles.timeDateText}>{dateStr}</Text>
                    <Text style={styles.timeRangeText}>⏰ {timeStr} (Asia/Colombo)</Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.detailsBox}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Purpose:</Text>
                    <Text style={styles.detailValue}>{b.purpose}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Group Size:</Text>
                    <Text style={styles.detailValue}>{b.attendees} attendees</Text>
                  </View>
                  {b.cancelReason && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.critical[600] }]}>
                        Cancellation Note:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.critical[700] }]}>
                        {b.cancelReason}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Card actions */}
                {isConfirmed && (
                  <View style={styles.cardActions}>
                    <Button
                      title="Cancel Reservation"
                      variant="outline"
                      size="sm"
                      onPress={() => handleCancelBooking(b)}
                    />
                  </View>
                )}
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
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  topActionTitle: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
  },
  topActionSub: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 1,
  },
  newBookingBtn: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.sm,
  },
  newBookingBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#ffffff',
  },
  kpiContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    gap: spacing[2.5],
    backgroundColor: colors.neutral[0],
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
  },
  kpiNum: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[0.5],
  },
  kpiLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '600',
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
  bookingCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: 2,
  },
  bookingId: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    padding: spacing[3],
    borderRadius: radius.sm,
    marginBottom: spacing[3],
  },
  timeIcon: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  timeDateText: {
    ...typography.labelSm,
    color: colors.primary[900],
    fontWeight: '700',
  },
  timeRangeText: {
    ...typography.caption,
    color: colors.primary[800],
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: colors.neutral[50],
    padding: spacing[3],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing[1.5],
    marginBottom: spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  detailValue: {
    ...typography.caption,
    color: colors.neutral[800],
    fontWeight: '700',
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[2.5],
    alignItems: 'flex-end',
  },
});
