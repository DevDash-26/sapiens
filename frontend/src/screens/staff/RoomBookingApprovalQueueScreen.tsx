import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import {
  Button,
  StatusBadge,
  SearchBar,
  FilterChip,
  Modal,
  EmptyState,
} from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { Booking } from '../../types/contract';

type StatusFilter = 'all' | 'confirmed' | 'cancelled';

export const RoomBookingApprovalQueueScreen: React.FC = () => {
  const { goBack, bookings, approveBooking, adminCancelBooking } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'confirmed' && b.status === 'confirmed') ||
        (statusFilter === 'cancelled' && b.status.includes('cancelled'));

      const matchesSearch =
        b.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.purpose.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const activeCount = bookings.filter((b) => b.status === 'confirmed').length;
    const cancelledCount = bookings.filter((b) => b.status.includes('cancelled')).length;
    return { activeCount, cancelledCount, total: bookings.length };
  }, [bookings]);

  const handleOpenActionModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
  };

  const handleAdminCancel = () => {
    if (!selectedBooking) return;
    setIsProcessing(true);
    setTimeout(() => {
      adminCancelBooking(
        selectedBooking.id,
        cancelReason.trim() || 'Cancelled by Academic Administrator for exam preparation'
      );
      setIsProcessing(false);
      setSelectedBooking(null);
    }, 400);
  };

  const handleApprove = () => {
    if (!selectedBooking) return;
    setIsProcessing(true);
    setTimeout(() => {
      approveBooking(selectedBooking.id);
      setIsProcessing(false);
      setSelectedBooking(null);
    }, 400);
  };

  return (
    <View style={styles.container}>
      {/* KPI Header */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderColor: colors.success[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.success[700] }]}>{stats.activeCount}</Text>
          <Text style={styles.kpiLabel}>Active Bookings</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.critical[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.critical[700] }]}>{stats.cancelledCount}</Text>
          <Text style={styles.kpiLabel}>Cancelled / Freed</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.neutral[300] }]}>
          <Text style={[styles.kpiVal, { color: colors.neutral[800] }]}>{stats.total}</Text>
          <Text style={styles.kpiLabel}>Total Records</Text>
        </View>
      </View>

      {/* Search & Filter Chips */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search room name, student, purpose..."
          onClear={() => setSearchQuery('')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterChip
            label="All Bookings"
            selected={statusFilter === 'all'}
            onPress={() => setStatusFilter('all')}
          />
          <FilterChip
            label={`Active (${stats.activeCount})`}
            selected={statusFilter === 'confirmed'}
            onPress={() => setStatusFilter('confirmed')}
          />
          <FilterChip
            label={`Cancelled (${stats.cancelledCount})`}
            selected={statusFilter === 'cancelled'}
            onPress={() => setStatusFilter('cancelled')}
          />
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredBookings.length === 0 ? (
          <EmptyState
            iconText="🏢"
            title="No Bookings Found"
            description="No room reservation records match your filter criteria."
          />
        ) : (
          filteredBookings.map((b) => {
            const isConfirmed = b.status === 'confirmed';
            const startDate = new Date(b.startsAt);
            const endDate = new Date(b.endsAt);

            return (
              <TouchableOpacity
                key={b.id}
                style={styles.card}
                onPress={() => handleOpenActionModal(b)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <StatusBadge
                    status={isConfirmed ? 'success' : 'critical'}
                    label={b.status.replace(/_/g, ' ').toUpperCase()}
                  />
                  <Text style={styles.bookingId}>{b.id}</Text>
                </View>

                <Text style={styles.roomTitle}>{b.roomName}</Text>
                <Text style={styles.timeWindow}>
                  📅 {startDate.toLocaleDateString()} · {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>

                <View style={styles.purposeBox}>
                  <Text style={styles.purposeLabel}>Purpose: </Text>
                  <Text style={styles.purposeText} numberOfLines={2}>
                    {b.purpose}
                  </Text>
                </View>

                {b.cancelReason && (
                  <View style={styles.cancelReasonBox}>
                    <Text style={styles.cancelReasonText} numberOfLines={1}>
                      Reason: {b.cancelReason}
                    </Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.attendeeInfo}>
                    👥 {b.attendees} Attendees · Booked by {b.userName}
                  </Text>
                  <Text style={styles.actionPrompt}>Manage →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Admin Action Modal */}
      <Modal
        visible={!!selectedBooking}
        title="Manage Classroom Booking"
        onClose={() => setSelectedBooking(null)}
      >
        {selectedBooking && (
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <StatusBadge
                status={selectedBooking.status === 'confirmed' ? 'success' : 'critical'}
                label={selectedBooking.status.replace(/_/g, ' ').toUpperCase()}
              />
              <Text style={styles.modalBookingId}>{selectedBooking.id}</Text>
            </View>

            <Text style={styles.modalRoomName}>{selectedBooking.roomName}</Text>
            <Text style={styles.modalTimeText}>
              ⏱️ {new Date(selectedBooking.startsAt).toLocaleString()} → {new Date(selectedBooking.endsAt).toLocaleTimeString()}
            </Text>

            <View style={styles.detailBox}>
              <Text style={styles.detailRow}>
                <Text style={styles.detailBold}>Student Booker: </Text>
                {selectedBooking.userName}
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailBold}>Group Size: </Text>
                {selectedBooking.attendees} Attendees
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailBold}>Purpose: </Text>
                {selectedBooking.purpose}
              </Text>
            </View>

            {selectedBooking.status === 'confirmed' ? (
              <View>
                <Text style={styles.inputHeading}>Admin Cancellation Reason (BR8/16):</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="e.g. Room needed for Faculty Examination or Maintenance..."
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                  numberOfLines={3}
                />

                <Button
                  title={isProcessing ? 'Cancelling...' : 'Cancel Reservation (Admin Override)'}
                  variant="primary"
                  size="md"
                  onPress={handleAdminCancel}
                  disabled={isProcessing}
                  style={{ marginTop: spacing[3], backgroundColor: colors.critical[600] }}
                />
              </View>
            ) : (
              <View>
                <Text style={styles.cancelledNotice}>
                  This booking was cancelled. Slots have been released back into the availability matrix.
                </Text>
                <Button
                  title="Re-Approve & Restore Booking"
                  variant="primary"
                  size="md"
                  onPress={handleApprove}
                  disabled={isProcessing}
                  style={{ marginTop: spacing[3] }}
                />
              </View>
            )}
          </View>
        )}
      </Modal>
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
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    gap: spacing[2],
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
  },
  kpiVal: {
    ...typography.headlineSm,
    fontWeight: '800',
  },
  kpiLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral[500],
    marginTop: 2,
  },
  searchSection: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterScroll: {
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
    gap: spacing[3],
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  bookingId: {
    ...typography.caption,
    fontFamily: 'monospace',
    fontSize: 10,
    color: colors.neutral[400],
  },
  roomTitle: {
    ...typography.headlineSm,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  timeWindow: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  purposeBox: {
    flexDirection: 'row',
    marginBottom: spacing[2],
  },
  purposeLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  purposeText: {
    ...typography.caption,
    color: colors.neutral[800],
    flex: 1,
  },
  cancelReasonBox: {
    backgroundColor: colors.critical[50],
    borderRadius: radius.xs,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    marginBottom: spacing[2],
  },
  cancelReasonText: {
    ...typography.caption,
    color: colors.critical[800],
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  attendeeInfo: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  actionPrompt: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[600],
  },
  modalContent: {
    paddingTop: spacing[1],
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  modalBookingId: {
    ...typography.caption,
    fontFamily: 'monospace',
    color: colors.neutral[500],
  },
  modalRoomName: {
    ...typography.headlineSm,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  modalTimeText: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '600',
    marginBottom: spacing[3],
  },
  detailBox: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3.5],
    gap: spacing[1],
  },
  detailRow: {
    ...typography.caption,
    color: colors.neutral[800],
  },
  detailBold: {
    fontWeight: '700',
    color: colors.neutral[600],
  },
  inputHeading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[700],
    marginBottom: spacing[1.5],
  },
  reasonInput: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[3],
    ...typography.bodySm,
    color: colors.neutral[900],
    minHeight: 70,
    textAlignVertical: 'top',
  },
  cancelledNotice: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
  },
});
