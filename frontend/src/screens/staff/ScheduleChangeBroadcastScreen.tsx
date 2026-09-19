import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert as NativeAlert,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Button, FormField, Modal, StatusBadge } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

const REASON_PRESETS = [
  { id: 'weather', label: 'Heavy Weather / Rain Inundation', icon: '🌧️' },
  { id: 'holiday', label: 'Public / Mercantile Holiday (Poya)', icon: '🏛️' },
  { id: 'maintenance', label: 'Facility Power & Server Upgrade', icon: '⚡' },
  { id: 'exam_setup', label: 'Semester Exam Hall Configuration', icon: '📝' },
];

export const ScheduleChangeBroadcastScreen: React.FC = () => {
  const { goBack, navigate, createAlert } = useNavigation();

  const [title, setTitle] = useState('');
  const [scope, setScope] = useState('Campus-Wide');
  const [selectedReason, setSelectedReason] = useState('weather');
  const [startDate, setStartDate] = useState('2026-09-22 08:00 AM');
  const [endDate, setEndDate] = useState('2026-09-22 06:00 PM');
  const [message, setMessage] = useState('');
  const [cancelBookings, setCancelBookings] = useState(true);
  const [flagEvents, setFlagEvents] = useState(true);
  const [sendSms, setSendSms] = useState(false);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReasonSelect = (reasonId: string, label: string) => {
    setSelectedReason(reasonId);
    if (!title) {
      setTitle(`Campus Operations Notice: ${label}`);
    }
  };

  const handleValidateAndOpen = () => {
    if (!title.trim() || !message.trim()) {
      NativeAlert.alert('Incomplete Form', 'Please enter a clear notice title and operational instructions.');
      return;
    }
    setConfirmModalVisible(true);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await createAlert({
        kind: 'schedule_change',
        status: 'active',
        title: title.trim(),
        body: message.trim(),
        affects: {
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          scope,
          buildings: scope === 'Campus-Wide' ? [] : [scope],
          cancelBookings,
          flagEvents,
        },
        sendSms,
        impact: {
          eventsFlagged: flagEvents ? 2 : 0,
          bookingsCancelled: cancelBookings ? 3 : 0,
          usersNotified: 1840,
          smsSent: sendSms ? 1212 : 0,
        },
      });

      setIsSubmitting(false);
      setConfirmModalVisible(false);
      setSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      NativeAlert.alert('Publish Error', err?.message || 'Failed to dispatch schedule notice to backend.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {success ? (
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <Text style={styles.successEmoji}>📅</Text>
            </View>
            <Text style={styles.successTitle}>Schedule Notice Published</Text>
            <Text style={styles.successDesc}>
              Timetable modifications and room release rules have been applied. Student calendars and classroom availability have been dynamically updated.
            </Text>

            <View style={styles.impactGrid}>
              <View style={styles.impactCard}>
                <Text style={styles.impactVal}>3</Text>
                <Text style={styles.impactLabel}>Bookings Freed</Text>
              </View>
              <View style={styles.impactCard}>
                <Text style={styles.impactVal}>2</Text>
                <Text style={styles.impactLabel}>Events Cautioned</Text>
              </View>
            </View>

            <Button
              title="View Schedule Notice"
              variant="primary"
              size="md"
              onPress={() => navigate('schedule_change_notice')}
              style={{ marginTop: spacing[4], width: '100%' }}
            />
            <Button
              title="Return to Staff Console"
              variant="outline"
              size="md"
              onPress={() => navigate('staff_dashboard')}
              style={{ marginTop: spacing[2], width: '100%' }}
            />
          </View>
        ) : (
          <View>
            {/* Reason Presets */}
            <View style={styles.sectionBox}>
              <Text style={styles.fieldLabel}>PRIMARY CAUSE / REASON</Text>
              <View style={styles.reasonGrid}>
                {REASON_PRESETS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.reasonCard,
                      selectedReason === r.id && styles.reasonCardActive,
                    ]}
                    onPress={() => handleReasonSelect(r.id, r.label)}
                  >
                    <Text style={styles.reasonIcon}>{r.icon}</Text>
                    <Text
                      style={[
                        styles.reasonLabel,
                        selectedReason === r.id && styles.reasonLabelActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Scope Selection */}
            <View style={styles.sectionBox}>
              <Text style={styles.fieldLabel}>AFFECTED SCOPE</Text>
              <View style={styles.scopeChips}>
                {[
                  'Campus-Wide',
                  'Faculty of Computing',
                  'Faculty of Business',
                  'Main Library & Study Rooms',
                  'Block B Lecture Theatres',
                ].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.scopeChip, scope === s && styles.scopeChipActive]}
                    onPress={() => setScope(s)}
                  >
                    <Text
                      style={[
                        styles.scopeChipText,
                        scope === s && styles.scopeChipTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date & Time Range */}
            <View style={styles.sectionBox}>
              <Text style={styles.fieldLabel}>EFFECTIVE TIME WINDOW</Text>
              <View style={styles.dateInputsRow}>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="From (Asia/Colombo)"
                    placeholder="2026-09-22 08:00 AM"
                    value={startDate}
                    onChangeText={setStartDate}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing[2.5] }}>
                  <FormField
                    label="To (Asia/Colombo)"
                    placeholder="2026-09-22 06:00 PM"
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              </View>
            </View>

            {/* Title & Body */}
            <View style={styles.sectionBox}>
              <FormField
                label="Broadcast Notice Headline *"
                placeholder="e.g. Temporary Library & Study Hall Closure"
                value={title}
                onChangeText={setTitle}
                maxLength={120}
              />

              <View style={{ marginTop: spacing[3] }}>
                <FormField
                  label="Detailed Operational Instructions *"
                  placeholder="Explain rescheduled lecture slots, remote Zoom links, or revised access guidelines..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                />
              </View>
            </View>

            {/* Automated Rule Toggles */}
            <View style={styles.sectionBox}>
              <Text style={styles.fieldLabel}>DYNAMIC SYSTEM IMPACT (BR16)</Text>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Release Overlapping Study Bookings</Text>
                  <Text style={styles.toggleDesc}>
                    Automatically cancels confirmed student room reservations and frees slots
                  </Text>
                </View>
                <Switch
                  value={cancelBookings}
                  onValueChange={setCancelBookings}
                  trackColor={{ false: colors.neutral[300], true: colors.primary[600] }}
                />
              </View>

              <View style={[styles.toggleRow, { marginTop: spacing[3] }]}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Attach Alert Flag to Events</Text>
                  <Text style={styles.toggleDesc}>
                    Warns registered students on the Academic Calendar & Events Feed
                  </Text>
                </View>
                <Switch
                  value={flagEvents}
                  onValueChange={setFlagEvents}
                  trackColor={{ false: colors.neutral[300], true: colors.primary[600] }}
                />
              </View>

              <View style={[styles.toggleRow, { marginTop: spacing[3] }]}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Send SMS Advisory</Text>
                  <Text style={styles.toggleDesc}>
                    Transmit standard SMS to students with opted-in mobile alerts
                  </Text>
                </View>
                <Switch
                  value={sendSms}
                  onValueChange={setSendSms}
                  trackColor={{ false: colors.neutral[300], true: colors.primary[600] }}
                />
              </View>
            </View>

            <Button
              title="Review & Broadcast Schedule Change"
              variant="primary"
              size="lg"
              onPress={handleValidateAndOpen}
              style={{ marginTop: spacing[2] }}
            />
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        title="Confirm Schedule Broadcast"
        onClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalBody}>
          <View style={styles.modalHeaderRow}>
            <StatusBadge status="warning" label="SCHEDULE CHANGE" />
            <Text style={styles.modalScopeLabel}>{scope}</Text>
          </View>

          <Text style={styles.modalNoticeTitle}>{title}</Text>
          <Text style={styles.modalWindowText}>
            ⏱️ {startDate} → {endDate}
          </Text>
          <Text style={styles.modalDescText} numberOfLines={3}>{message}</Text>

          <View style={styles.impactListBox}>
            <Text style={styles.impactListHeader}>Cascading Actions Executed:</Text>
            <Text style={styles.impactListRow}>• {cancelBookings ? '3 Confirmed Room Bookings auto-cancelled' : 'No bookings modified'}</Text>
            <Text style={styles.impactListRow}>• {flagEvents ? '2 Overlapping events marked with caution banner' : 'Events unchanged'}</Text>
            <Text style={styles.impactListRow}>• In-App Push dispatched to cohort</Text>
            <Text style={styles.impactListRow}>• {sendSms ? 'Text.lk SMS broadcast enabled' : 'SMS broadcast skipped'}</Text>
          </View>

          <View style={styles.modalBtnRow}>
            <Button
              title="Back to Edit"
              variant="outline"
              size="md"
              onPress={() => setConfirmModalVisible(false)}
              style={{ flex: 1 }}
            />
            <Button
              title={isSubmitting ? 'Publishing...' : 'Confirm & Publish'}
              variant="primary"
              size="md"
              onPress={handlePublish}
              disabled={isSubmitting}
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
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
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  sectionBox: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3.5],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[500],
    letterSpacing: 0.5,
    marginBottom: spacing[2.5],
  },
  reasonGrid: {
    flexDirection: 'column',
    gap: spacing[2],
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  reasonCardActive: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  reasonIcon: {
    fontSize: 18,
    marginRight: spacing[2.5],
  },
  reasonLabel: {
    ...typography.bodySm,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  reasonLabelActive: {
    color: colors.primary[900],
    fontWeight: '700',
  },
  scopeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  scopeChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  scopeChipActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  scopeChipText: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  scopeChipTextActive: {
    color: colors.primary[700],
    fontWeight: '700',
  },
  dateInputsRow: {
    flexDirection: 'row',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing[3],
  },
  toggleTitle: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  toggleDesc: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 2,
  },
  modalBody: {
    paddingTop: spacing[1],
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  modalScopeLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  modalNoticeTitle: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  modalWindowText: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  modalDescText: {
    ...typography.bodySm,
    color: colors.neutral[600],
    marginBottom: spacing[3.5],
  },
  impactListBox: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  impactListHeader: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing[1],
  },
  impactListRow: {
    ...typography.caption,
    color: colors.neutral[600],
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  successCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  successEmoji: {
    fontSize: 28,
  },
  successTitle: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[1],
    textAlign: 'center',
  },
  successDesc: {
    ...typography.bodySm,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing[4],
  },
  impactGrid: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
    marginBottom: spacing[2],
  },
  impactCard: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  impactVal: {
    ...typography.headlineSm,
    color: colors.primary[600],
    fontWeight: '800',
  },
  impactLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
    marginTop: 2,
    textAlign: 'center',
  },
});
