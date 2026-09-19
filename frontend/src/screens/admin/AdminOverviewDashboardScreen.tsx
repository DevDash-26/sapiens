import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert as NativeAlert,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { StatusBadge, Button, IconSymbol, Modal, FormField } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { apiClient } from '../../services/apiClient';

export const AdminOverviewDashboardScreen: React.FC = () => {
  const {
    goBack,
    navigate,
    users,
    contents,
    alerts,
    requests,
    bookings,
    societies,
    faqs,
    staff,
  } = useNavigation();

  // Manual Direct SMS State
  const [smsModalVisible, setSmsModalVisible] = useState(false);
  const [manualPhone, setManualPhone] = useState('+94765886220');
  const [manualMessage, setManualMessage] = useState('UCL Campus Alert: Test direct message from Administrator Console.');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendManualSms = async () => {
    if (!manualPhone.trim() || !manualMessage.trim()) {
      NativeAlert.alert('Validation Error', 'Please provide both a recipient phone number and SMS text.');
      return;
    }

    setIsSendingSms(true);
    setSmsFeedback(null);

    try {
      const res = await apiClient.sendManualSms(manualPhone.trim(), manualMessage.trim());
      setIsSendingSms(false);
      setSmsFeedback({
        type: 'success',
        text: `SMS dispatched successfully via Text.lk to ${manualPhone.trim()}!`,
      });
      NativeAlert.alert('SMS Sent', `Successfully dispatched SMS to ${manualPhone.trim()} via Text.lk gateway.`);
    } catch (err: any) {
      setIsSendingSms(false);
      // Even if offline/network hiccup, inform clearly
      setSmsFeedback({
        type: 'error',
        text: err?.message || 'Failed to dispatch SMS.',
      });
      NativeAlert.alert('Dispatch Status', err?.message || 'Failed to send SMS.');
    }
  };

  // Dynamic telemetry metrics computed live from mock data layer
  const metrics = useMemo(() => {
    // Requests
    const facilityCount = requests.filter((r) => r.type === 'facility_issue' && (r.status === 'open' || r.status === 'in_progress')).length;
    const academicCount = requests.filter((r) => r.type === 'academic_support' && (r.status === 'open' || r.status === 'in_progress')).length;
    const feedbackCount = requests.filter((r) => r.type === 'feedback' && (r.status === 'open' || r.status === 'in_progress')).length;
    const lostFoundCount = requests.filter((r) => (r.type === 'lost' || r.type === 'found') && (r.status === 'open' || r.status === 'in_progress')).length;
    const textbookCount = requests.filter((r) => r.type === 'textbook').length;
    const totalOpenRequests = facilityCount + academicCount + feedbackCount + lostFoundCount;

    // Content
    const publishedContents = contents.filter((c) => c.status === 'published').length;
    const scheduledContents = contents.filter((c) => c.status === 'scheduled').length;
    const draftContents = contents.filter((c) => c.status === 'draft').length;

    // Alerts
    const activeAlerts = alerts.filter((a) => a.status === 'active').length;
    const totalAlerts = alerts.length;

    // Bookings
    const activeBookings = bookings.filter((b) => b.status === 'confirmed').length;

    // Users & Roles
    const students = users.filter((u) => u.role === 'student').length;
    const academicStaff = users.filter((u) => u.role === 'academic_staff').length;
    const societyReps = users.filter((u) => u.role === 'society_rep').length;
    const admins = users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length;

    // FAQ metrics
    const totalFaqs = faqs.length;
    const totalHelpfulVotes = faqs.reduce((acc, f) => acc + f.helpfulCount, 0);

    return {
      facilityCount,
      academicCount,
      feedbackCount,
      lostFoundCount,
      textbookCount,
      totalOpenRequests,
      publishedContents,
      scheduledContents,
      draftContents,
      activeAlerts,
      totalAlerts,
      activeBookings,
      totalUsers: users.length,
      students,
      academicStaff,
      societyReps,
      admins,
      totalSocieties: societies.length,
      totalStaff: staff.length,
      totalFaqs,
      totalHelpfulVotes,
    };
  }, [requests, contents, alerts, bookings, users, societies, staff, faqs]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* System Health Hero */}
        <View style={styles.systemHero}>
          <View style={styles.systemHeroHeader}>
            <View style={styles.statusDotRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.systemStatusText}>ALL SERVICES OPERATIONAL · v1.0.0</Text>
            </View>
            <Text style={styles.regionText}>asia-south1 (Colombo)</Text>
          </View>
          <View style={styles.heroBrandRow}>
            <View style={styles.heroLogoBadge}>
              <Image
                source={require('../../../assets/logos/ucl-logo-transparent.png')}
                style={styles.heroLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>Universal College Lanka Digital Hub</Text>
              <Text style={styles.heroSub}>
                Authoritative campus information pipeline serving 1,840 active student & staff accounts.
              </Text>
            </View>
          </View>
        </View>

        {/* Top KPI 4-Block */}
        <View style={styles.kpiRow}>
          <TouchableOpacity
            style={[styles.kpiCard, { borderColor: colors.primary[200] }]}
            onPress={() => navigate('content_management')}
            activeOpacity={0.8}
          >
            <Text style={[styles.kpiVal, { color: colors.primary[700] }]}>
              {metrics.publishedContents}
            </Text>
            <Text style={styles.kpiLabel}>Published Notices</Text>
            <Text style={styles.kpiMicro}>+{metrics.scheduledContents} scheduled</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kpiCard, { borderColor: colors.critical[200] }]}
            onPress={() => navigate('alerts_feed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.kpiVal, { color: colors.critical[700] }]}>
              {metrics.activeAlerts}
            </Text>
            <Text style={styles.kpiLabel}>Active Alerts</Text>
            <Text style={styles.kpiMicro}>Text.lk SMS active</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kpiCard, { borderColor: colors.warning[200] }]}
            onPress={() => navigate('facility_queue')}
            activeOpacity={0.8}
          >
            <Text style={[styles.kpiVal, { color: colors.warning[700] }]}>
              {metrics.totalOpenRequests}
            </Text>
            <Text style={styles.kpiLabel}>Pending Tickets</Text>
            <Text style={styles.kpiMicro}>Across all 5 queues</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kpiCard, { borderColor: colors.success[200] }]}
            onPress={() => navigate('room_booking_queue')}
            activeOpacity={0.8}
          >
            <Text style={[styles.kpiVal, { color: colors.success[700] }]}>
              {metrics.activeBookings}
            </Text>
            <Text style={styles.kpiLabel}>Room Bookings</Text>
            <Text style={styles.kpiMicro}>Confirmed slots</Text>
          </TouchableOpacity>
        </View>

        {/* Operational Queues Telemetry */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Open Service Tickets by Category</Text>
            <Text style={styles.sectionSubCount}>{metrics.totalOpenRequests} Active</Text>
          </View>

          <View style={styles.queueBreakdownList}>
            <TouchableOpacity
              style={styles.queueBreakdownItem}
              onPress={() => navigate('facility_queue')}
            >
              <View style={styles.queueItemLeft}>
                <IconSymbol name="tool" size={18} color={colors.neutral[700]} />
                <Text style={styles.queueName}>Facility & Maintenance Defects</Text>
              </View>
              <View style={styles.queueBadge}>
                <Text style={styles.queueBadgeText}>{metrics.facilityCount} Open</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.queueBreakdownItem}
              onPress={() => navigate('academic_support_queue')}
            >
              <View style={styles.queueItemLeft}>
                <IconSymbol name="school" size={18} color={colors.neutral[700]} />
                <Text style={styles.queueName}>Academic Mentorship Requests</Text>
              </View>
              <View style={styles.queueBadge}>
                <Text style={styles.queueBadgeText}>{metrics.academicCount} Open</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.queueBreakdownItem}
              onPress={() => navigate('feedback_inbox')}
            >
              <View style={styles.queueItemLeft}>
                <IconSymbol name="chat" size={18} color={colors.neutral[700]} />
                <Text style={styles.queueName}>Student Feedback & Inquiries</Text>
              </View>
              <View style={styles.queueBadge}>
                <Text style={styles.queueBadgeText}>{metrics.feedbackCount} Open</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.queueBreakdownItem}
              onPress={() => navigate('lost_found_admin')}
            >
              <View style={styles.queueItemLeft}>
                <IconSymbol name="search" size={18} color={colors.neutral[700]} />
                <Text style={styles.queueName}>Lost & Found Custody Claims</Text>
              </View>
              <View style={styles.queueBadge}>
                <Text style={styles.queueBadgeText}>{metrics.lostFoundCount} Open</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* User RBAC Hierarchy Breakdown */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>User Role Cohorts (8 Tiers)</Text>
            <TouchableOpacity onPress={() => navigate('user_role_management')}>
              <Text style={styles.linkAction}>Manage RBAC →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rbacGrid}>
            <View style={styles.rbacCol}>
              <Text style={styles.rbacNum}>{metrics.students}</Text>
              <Text style={styles.rbacLabel}>Students (T2)</Text>
            </View>
            <View style={styles.rbacCol}>
              <Text style={styles.rbacNum}>{metrics.academicStaff}</Text>
              <Text style={styles.rbacLabel}>Academics (T4)</Text>
            </View>
            <View style={styles.rbacCol}>
              <Text style={styles.rbacNum}>{metrics.societyReps}</Text>
              <Text style={styles.rbacLabel}>Society Reps (T3)</Text>
            </View>
            <View style={styles.rbacCol}>
              <Text style={styles.rbacNum}>{metrics.admins}</Text>
              <Text style={styles.rbacLabel}>Admins (T7-8)</Text>
            </View>
          </View>
        </View>

        {/* Knowledgebase & AI Assistant Telemetry */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Knowledgebase & AI Assistant</Text>
            <TouchableOpacity onPress={() => navigate('faq_management')}>
              <Text style={styles.linkAction}>FAQ Corp →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aiTelemetryRow}>
            <View style={styles.aiTelemetryCol}>
              <Text style={styles.aiTelemetryVal}>{metrics.totalFaqs}</Text>
              <Text style={styles.aiTelemetryLabel}>Grounded FAQs</Text>
            </View>
            <View style={styles.aiTelemetryCol}>
              <Text style={styles.aiTelemetryVal}>👍 {metrics.totalHelpfulVotes}</Text>
              <Text style={styles.aiTelemetryLabel}>Student Upvotes</Text>
            </View>
            <View style={styles.aiTelemetryCol}>
              <Text style={styles.aiTelemetryVal}>{metrics.totalStaff}</Text>
              <Text style={styles.aiTelemetryLabel}>Staff Contacts</Text>
            </View>
          </View>
        </View>

        {/* Audit Trail Log Feed Preview */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeading}>Recent System Audit Events (NFR4)</Text>
          <View style={styles.auditList}>
            <View style={styles.auditItem}>
              <Text style={styles.auditTime}>Just now</Text>
              <Text style={styles.auditText}>
                <Text style={{ fontWeight: '700' }}>Admin Staff: </Text>
                Dispatched Campus Safety Advisory notice via Text.lk SMS gateway.
              </Text>
            </View>
            <View style={styles.auditItem}>
              <Text style={styles.auditTime}>5m ago</Text>
              <Text style={styles.auditText}>
                <Text style={{ fontWeight: '700' }}>Security Desk: </Text>
                Verified student claim and authorized physical handover for Casio calculator.
              </Text>
            </View>
            <View style={styles.auditItem}>
              <Text style={styles.auditTime}>15m ago</Text>
              <Text style={styles.auditText}>
                <Text style={{ fontWeight: '700' }}>Academic Lead: </Text>
                Published Database Systems lab relocation announcement for Year 2 FOC cohort.
              </Text>
            </View>
          </View>
        </View>

        {/* Master Action Grid */}
        <View style={styles.quickLaunchGrid}>
          <Button
            title="Launch Notice Composer"
            variant="primary"
            size="md"
            onPress={() => navigate('announcement_composer')}
            style={{ flex: 1 }}
          />
          <Button
            title="Emergency SMS Broadcast"
            variant="outline"
            size="md"
            onPress={() => navigate('emergency_broadcast')}
            style={{ flex: 1, borderColor: colors.critical[500] }}
          />
        </View>

        <View style={styles.quickLaunchGrid}>
          <Button
            title="Bulk Data Transfer (NFR5)"
            variant="secondary"
            size="md"
            onPress={() => navigate('data_transfer')}
            style={{ flex: 1 }}
          />
          <Button
            title="Manage Roles & RBAC"
            variant="outline"
            size="md"
            onPress={() => navigate('user_role_management')}
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.quickLaunchGrid}>
          <Button
            title="📱 Send Direct SMS (Text.lk)"
            variant="primary"
            size="md"
            onPress={() => {
              setSmsFeedback(null);
              setSmsModalVisible(true);
            }}
            style={{ flex: 1, backgroundColor: colors.critical[700] }}
          />
        </View>
      </ScrollView>

      {/* Manual Direct SMS Modal */}
      <Modal
        visible={smsModalVisible}
        title="Direct SMS Transmission"
        onClose={() => setSmsModalVisible(false)}
      >
        <View style={styles.smsModalContent}>
          <Text style={styles.smsModalSub}>
            Send a direct, real-time SMS to any phone number via Text.lk API gateway (BR15).
          </Text>

          {smsFeedback && (
            <View
              style={[
                styles.smsFeedbackBox,
                smsFeedback.type === 'success' ? styles.smsFeedbackSuccess : styles.smsFeedbackError,
              ]}
            >
              <Text
                style={[
                  styles.smsFeedbackText,
                  smsFeedback.type === 'success' ? styles.smsFeedbackTextSuccess : styles.smsFeedbackTextError,
                ]}
              >
                {smsFeedback.text}
              </Text>
            </View>
          )}

          <FormField
            label="Recipient Phone Number *"
            placeholder="+947XXXXXXXX"
            value={manualPhone}
            onChangeText={setManualPhone}
            keyboardType="phone-pad"
          />

          <FormField
            label="SMS Text Message *"
            placeholder="Type your SMS message here..."
            value={manualMessage}
            onChangeText={setManualMessage}
            multiline
            numberOfLines={4}
            maxLength={160}
          />
          <Text style={styles.smsCharCounter}>
            {manualMessage.length}/160 characters (1 SMS segment)
          </Text>

          <View style={styles.smsModalActions}>
            <Button
              title="Close"
              variant="outline"
              size="md"
              onPress={() => setSmsModalVisible(false)}
              style={{ flex: 1 }}
            />
            <Button
              title={isSendingSms ? 'Transmitting...' : 'Send SMS'}
              variant="primary"
              size="md"
              onPress={handleSendManualSms}
              disabled={isSendingSms}
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
    gap: spacing[3.5],
  },
  systemHero: {
    backgroundColor: colors.neutral[900],
    borderRadius: radius.md,
    padding: spacing[4],
  },
  systemHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success[500],
    marginRight: spacing[1.5],
  },
  systemStatusText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: colors.success[300],
    letterSpacing: 0.5,
  },
  regionText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[400],
  },
  heroBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  heroLogoBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
    padding: 3,
  },
  heroLogo: {
    width: '100%',
    height: '100%',
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.neutral[0],
    fontWeight: '800',
    marginBottom: 2,
  },
  heroSub: {
    ...typography.caption,
    color: colors.neutral[300],
    lineHeight: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  kpiCard: {
    width: '48%',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[3],
    borderWidth: 1,
  },
  kpiVal: {
    ...typography.headlineMd,
    fontWeight: '800',
    fontSize: 22,
  },
  kpiLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[800],
    marginTop: 2,
  },
  kpiMicro: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
    marginTop: 1,
  },
  sectionBox: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  sectionHeading: {
    ...typography.labelSm,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  sectionSubCount: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[700],
  },
  linkAction: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[600],
  },
  queueBreakdownList: {
    gap: spacing[2],
  },
  queueBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[2.5],
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  queueItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueIcon: {
    fontSize: 16,
    marginRight: spacing[2],
  },
  queueName: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral[800],
    marginLeft: spacing[2],
  },
  queueBadge: {
    backgroundColor: colors.warning[50],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  queueBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.warning[800],
  },
  rbacGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing[1],
  },
  rbacCol: {
    alignItems: 'center',
  },
  rbacNum: {
    ...typography.headlineSm,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  rbacLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
    marginTop: 2,
  },
  aiTelemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing[1],
  },
  aiTelemetryCol: {
    alignItems: 'center',
  },
  aiTelemetryVal: {
    ...typography.headlineSm,
    fontWeight: '800',
    color: colors.primary[700],
  },
  aiTelemetryLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
    marginTop: 2,
  },
  auditList: {
    gap: spacing[2],
    marginTop: spacing[2.5],
  },
  auditItem: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary[600],
    paddingLeft: spacing[2.5],
    paddingVertical: 2,
  },
  auditTime: {
    ...typography.caption,
    fontSize: 9,
    color: colors.neutral[400],
    fontWeight: '600',
    marginBottom: 1,
  },
  auditText: {
    ...typography.caption,
    color: colors.neutral[700],
    lineHeight: 16,
  },
  quickLaunchGrid: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  smsModalContent: {
    paddingTop: spacing[1],
  },
  smsModalSub: {
    ...typography.caption,
    color: colors.neutral[600],
    marginBottom: spacing[3],
    lineHeight: 18,
  },
  smsFeedbackBox: {
    padding: spacing[3],
    borderRadius: radius.sm,
    marginBottom: spacing[3],
    borderWidth: 1,
  },
  smsFeedbackSuccess: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[300],
  },
  smsFeedbackError: {
    backgroundColor: colors.critical[50],
    borderColor: colors.critical[300],
  },
  smsFeedbackText: {
    ...typography.caption,
    fontWeight: '600',
  },
  smsFeedbackTextSuccess: {
    color: colors.success[800],
  },
  smsFeedbackTextError: {
    color: colors.critical[800],
  },
  smsCharCounter: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
    textAlign: 'right',
    marginTop: -spacing[2],
    marginBottom: spacing[3],
  },
  smsModalActions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
});
