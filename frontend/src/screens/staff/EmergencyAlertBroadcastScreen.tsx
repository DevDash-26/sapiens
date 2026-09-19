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

export const EmergencyAlertBroadcastScreen: React.FC = () => {
  const { goBack, navigate, activeRole, createAlert } = useNavigation();

  // Role Gate: Only super_admin, admin, manager
  const isAuthorized = ['super_admin', 'admin', 'manager'].includes(activeRole);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'advisory'>('critical');
  const [scope, setScope] = useState('campus');
  const [sendSms, setSendSms] = useState(true);
  const [cancelBookings, setCancelBookings] = useState(true);
  const [flagEvents, setFlagEvents] = useState(true);

  // Two-step confirmation modal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  if (!isAuthorized) {
    return (
      <View style={styles.container}>
        <View style={styles.unauthBox}>
          <View style={styles.unauthIcon}>
            <Text style={styles.unauthEmoji}>🔒</Text>
          </View>
          <Text style={styles.unauthTitle}>Restricted Access (BR12)</Text>
          <Text style={styles.unauthDesc}>
            Emergency broadcast authorization is strictly restricted to University Administrators and Incident Response Managers.
          </Text>
          <Button
            title="Return to Console"
            variant="primary"
            size="md"
            onPress={() => navigate('staff_dashboard')}
            style={{ marginTop: spacing[4] }}
          />
        </View>
      </View>
    );
  }

  const handleOpenConfirm = () => {
    if (!title.trim() || !body.trim()) {
      NativeAlert.alert('Missing Information', 'Please provide both an alert title and detailed safety instructions.');
      return;
    }
    setConfirmModalVisible(true);
  };

  const handleDispatchBroadcast = async () => {
    setIsSubmitting(true);
    try {
      await createAlert({
        kind: 'emergency',
        status: 'active',
        title: title.trim(),
        body: body.trim(),
        affects: {
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          scope,
          buildings: scope === 'campus' ? [] : [scope],
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
      setBroadcastSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      NativeAlert.alert('Broadcast Error', err?.message || 'Failed to dispatch alert to backend.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {broadcastSuccess ? (
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <Text style={styles.successEmoji}>🚨</Text>
            </View>
            <Text style={styles.successTitle}>Safety Broadcast Dispatched</Text>
            <Text style={styles.successDesc}>
              Emergency alert has been published campus-wide. High-priority push notifications and Text.lk flash SMS have been transmitted.
            </Text>

            <View style={styles.metricSummary}>
              <View style={styles.metricCol}>
                <Text style={styles.metricVal}>1,212</Text>
                <Text style={styles.metricLbl}>SMS Sent (Text.lk)</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricCol}>
                <Text style={styles.metricVal}>1,840</Text>
                <Text style={styles.metricLbl}>Push / In-App</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricCol}>
                <Text style={styles.metricVal}>3</Text>
                <Text style={styles.metricLbl}>Bookings Freed</Text>
              </View>
            </View>

            <Button
              title="View Active Alerts Feed"
              variant="primary"
              size="md"
              onPress={() => navigate('alerts_feed')}
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
            {/* Warning Banner */}
            <View style={styles.warningBanner}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <View style={styles.warningTextCol}>
                <Text style={styles.warningTitle}>High-Impact Emergency Channel</Text>
                <Text style={styles.warningBody}>
                  Broadcasting will trigger instant Text.lk SMS alerts to students and staff mobile devices and override normal app schedules.
                </Text>
              </View>
            </View>

            {/* Severity Picker */}
            <View style={styles.sectionBox}>
              <Text style={styles.fieldLabel}>SEVERITY LEVEL</Text>
              <View style={styles.severityRow}>
                <TouchableOpacity
                  style={[
                    styles.severityBtn,
                    severity === 'critical' && styles.severityBtnCritical,
                  ]}
                  onPress={() => setSeverity('critical')}
                >
                  <Text style={[styles.severityEmoji]}>🔴</Text>
                  <Text
                    style={[
                      styles.severityText,
                      severity === 'critical' && styles.severityTextActive,
                    ]}
                  >
                    Critical Emergency (Flash SMS)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.severityBtn,
                    severity === 'advisory' && styles.severityBtnAdvisory,
                  ]}
                  onPress={() => setSeverity('advisory')}
                >
                  <Text style={[styles.severityEmoji]}>🟡</Text>
                  <Text
                    style={[
                      styles.severityText,
                      severity === 'advisory' && styles.severityTextActive,
                    ]}
                  >
                    Safety Advisory (Standard)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Alert Title */}
            <View style={styles.sectionBox}>
              <FormField
                label="Alert Headline / Title *"
                placeholder="e.g. Severe Weather Closure - Heavy Inundation"
                value={title}
                onChangeText={setTitle}
                maxLength={120}
              />
            </View>

            {/* Scope Selection */}
            <View style={styles.sectionBox}>
              <Text style={styles.fieldLabel}>AFFECTED SCOPE</Text>
              <View style={styles.scopeChips}>
                {[
                  { id: 'campus', label: 'All Campus' },
                  { id: 'Block A - Main', label: 'Block A Main' },
                  { id: 'Block B - Computing', label: 'Block B Computing' },
                  { id: 'Engineering Labs', label: 'Engineering Labs' },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.scopeChip, scope === s.id && styles.scopeChipActive]}
                    onPress={() => setScope(s.id)}
                  >
                    <Text
                      style={[
                        styles.scopeChipText,
                        scope === s.id && styles.scopeChipTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Alert Body */}
            <View style={styles.sectionBox}>
              <FormField
                label="Safety Directive & Instructions *"
                placeholder="Detail the mandatory safety actions, evacuation points, or remote transition protocols..."
                value={body}
                onChangeText={setBody}
                multiline
                numberOfLines={4}
                maxLength={1000}
              />
            </View>

            {/* Cascade Action Toggles */}
            <View style={styles.sectionBox}>
              <Text style={styles.fieldLabel}>AUTOMATED CASCADE ACTIONS</Text>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Dispatch Text.lk SMS Broadcast</Text>
                  <Text style={styles.toggleDesc}>
                    Transmit SMS to all 1,212 registered student & staff phones
                  </Text>
                </View>
                <Switch
                  value={sendSms}
                  onValueChange={setSendSms}
                  trackColor={{ false: colors.neutral[300], true: colors.critical[500] }}
                />
              </View>

              <View style={[styles.toggleRow, { marginTop: spacing[3] }]}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Auto-Cancel Overlapping Bookings</Text>
                  <Text style={styles.toggleDesc}>
                    Free 3 reserved study rooms and notify booked students
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
                  <Text style={styles.toggleTitle}>Flag Scheduled Events</Text>
                  <Text style={styles.toggleDesc}>
                    Attach caution warning banner to upcoming campus events
                  </Text>
                </View>
                <Switch
                  value={flagEvents}
                  onValueChange={setFlagEvents}
                  trackColor={{ false: colors.neutral[300], true: colors.primary[600] }}
                />
              </View>
            </View>

            {/* Trigger Button */}
            <Button
              title="Review & Authorize Broadcast"
              variant="primary"
              size="lg"
              onPress={handleOpenConfirm}
              style={styles.broadcastBtn}
            />
          </View>
        )}
      </ScrollView>

      {/* Two-Step Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        title="Confirm Emergency Broadcast"
        onClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalBody}>
          <View style={styles.modalAlertHeader}>
            <StatusBadge status={severity === 'critical' ? 'critical' : 'warning'} label={severity.toUpperCase()} />
            <Text style={styles.modalScopeBadge}>Scope: {scope}</Text>
          </View>

          <Text style={styles.modalTitleText}>{title}</Text>
          <Text style={styles.modalBodyText} numberOfLines={3}>{body}</Text>

          <View style={styles.modalImpactBox}>
            <Text style={styles.modalImpactHeading}>Estimated Blast Impact:</Text>
            <Text style={styles.modalImpactRow}>• {sendSms ? '1,212 SMS sent via Text.lk Gateway' : 'SMS broadcast disabled'}</Text>
            <Text style={styles.modalImpactRow}>• 1,840 In-App & FCM Push Notifications</Text>
            <Text style={styles.modalImpactRow}>• {cancelBookings ? '3 Room Bookings auto-cancelled' : 'Bookings untouched'}</Text>
            <Text style={styles.modalImpactRow}>• Pinned to Top of All Student Home Feeds</Text>
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              size="md"
              onPress={() => setConfirmModalVisible(false)}
              style={{ flex: 1 }}
            />
            <Button
              title={isSubmitting ? 'Dispatching...' : 'Authorize Dispatch'}
              variant="primary"
              size="md"
              onPress={handleDispatchBroadcast}
              disabled={isSubmitting}
              style={{ flex: 1.5, backgroundColor: colors.critical[600] }}
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
  unauthBox: {
    margin: spacing[4],
    padding: spacing[6],
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  unauthIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.critical[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  unauthEmoji: {
    fontSize: 24,
  },
  unauthTitle: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  unauthDesc: {
    ...typography.bodySm,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: colors.critical[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.critical[600],
    borderRadius: radius.md,
    padding: spacing[3.5],
    marginBottom: spacing[4],
  },
  warningIcon: {
    fontSize: 22,
    marginRight: spacing[3],
  },
  warningTextCol: {
    flex: 1,
  },
  warningTitle: {
    ...typography.labelSm,
    color: colors.critical[900],
    fontWeight: '700',
  },
  warningBody: {
    ...typography.caption,
    color: colors.critical[800],
    marginTop: 2,
    lineHeight: 16,
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
  severityRow: {
    flexDirection: 'column',
    gap: spacing[2],
  },
  severityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  severityBtnCritical: {
    borderColor: colors.critical[500],
    backgroundColor: colors.critical[50],
  },
  severityBtnAdvisory: {
    borderColor: colors.warning[500],
    backgroundColor: colors.warning[50],
  },
  severityEmoji: {
    fontSize: 16,
    marginRight: spacing[2.5],
  },
  severityText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  severityTextActive: {
    color: colors.neutral[900],
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[1],
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
  broadcastBtn: {
    backgroundColor: colors.critical[600],
    marginTop: spacing[2],
    shadowColor: colors.critical[600],
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  modalBody: {
    paddingTop: spacing[1],
  },
  modalAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2.5],
  },
  modalScopeBadge: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  modalTitleText: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  modalBodyText: {
    ...typography.bodySm,
    color: colors.neutral[700],
    lineHeight: 18,
    marginBottom: spacing[3.5],
  },
  modalImpactBox: {
    backgroundColor: colors.neutral[100],
    padding: spacing[3.5],
    borderRadius: radius.md,
    marginBottom: spacing[4],
  },
  modalImpactHeading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing[1.5],
  },
  modalImpactRow: {
    ...typography.caption,
    color: colors.neutral[600],
    lineHeight: 18,
  },
  modalActions: {
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
    backgroundColor: colors.critical[50],
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
  metricSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[3.5],
    width: '100%',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.neutral[200],
  },
  metricVal: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '800',
  },
  metricLbl: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
    marginTop: 2,
    textAlign: 'center',
  },
});
