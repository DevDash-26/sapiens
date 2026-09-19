import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { StatusBadge, Button, IconSymbol } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

export const StaffConsoleHomeScreen: React.FC = () => {
  const { navigate, currentUser, activeRole, contents, alerts, requests, bookings } = useNavigation();

  // Metric counts
  const publishedNoticesCount = contents.filter((c) => c.type === 'announcement' && c.status === 'published').length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;
  const openRequestsCount = requests.filter((r) => r.status === 'open' || r.status === 'in_progress').length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Department Banner */}
        <View style={styles.deptBanner}>
          <View style={styles.deptLeft}>
            <Text style={styles.deptTitle}>UCL Campus Management Portal</Text>
            <Text style={styles.deptSubtitle}>
              Logged in as {currentUser.displayName} ({currentUser.email})
            </Text>
          </View>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{activeRole.toUpperCase()}</Text>
          </View>
        </View>

        {/* Enterprise KPI Grid */}
        <View style={styles.kpiGrid}>
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigate('content_management')}
            activeOpacity={0.8}
          >
            <Text style={styles.kpiNum}>{publishedNoticesCount}</Text>
            <Text style={styles.kpiLabel}>Active Notices</Text>
            <Text style={styles.kpiSub}>Manage feed & composer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kpiCard, activeAlertsCount > 0 && styles.kpiCardAlert]}
            onPress={() => navigate('alerts_feed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.kpiNum, activeAlertsCount > 0 && { color: colors.critical[700] }]}>
              {activeAlertsCount}
            </Text>
            <Text style={styles.kpiLabel}>Active Alerts</Text>
            <Text style={styles.kpiSub}>Emergency & closures</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigate('my_requests')}
            activeOpacity={0.8}
          >
            <Text style={[styles.kpiNum, { color: colors.warning[700] }]}>{openRequestsCount}</Text>
            <Text style={styles.kpiLabel}>Open Requests</Text>
            <Text style={styles.kpiSub}>Student service tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigate('classroom_availability')}
            activeOpacity={0.8}
          >
            <Text style={[styles.kpiNum, { color: colors.primary[700] }]}>{activeBookingsCount}</Text>
            <Text style={styles.kpiLabel}>Room Bookings</Text>
            <Text style={styles.kpiSub}>Classrooms & labs</Text>
          </TouchableOpacity>
        </View>

        {/* Content & Communication Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content & Communication Tools</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('announcement_composer')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="notices" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Announcement Composer (BR11)</Text>
              <Text style={styles.actionSubtitle}>Draft, target (faculty/year), and publish official student notices</Text>
            </View>
            <View style={styles.actionRowActions}>
              <TouchableOpacity
                style={styles.quickCreateBtn}
                onPress={() => navigate('announcement_composer')}
                activeOpacity={0.8}
              >
                <Text style={styles.quickCreateBtnText}>+ Compose</Text>
              </TouchableOpacity>
              <Text style={styles.actionArrow}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('emergency_broadcast')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrapper, styles.actionIconCritical]}>
              <IconSymbol name="alerts" size={20} color={colors.critical[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionTitle, { color: colors.critical[700] }]}>
                Emergency Alert Broadcast (BR15)
              </Text>
              <Text style={styles.actionSubtitle}>Dispatch instant Text.lk SMS & critical safety notifications</Text>
            </View>
            <View style={styles.actionRowActions}>
              <TouchableOpacity
                style={[styles.quickCreateBtn, styles.quickCriticalBtn]}
                onPress={() => navigate('emergency_broadcast')}
                activeOpacity={0.8}
              >
                <Text style={[styles.quickCreateBtnText, { color: '#ffffff' }]}>+ Broadcast</Text>
              </TouchableOpacity>
              <Text style={[styles.actionArrow, { color: colors.critical[600] }]}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('schedule_change_broadcast')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="weather" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Schedule Change Broadcast (BR16)</Text>
              <Text style={styles.actionSubtitle}>Campus closures, holiday shifting & auto room booking releases</Text>
            </View>
            <View style={styles.actionRowActions}>
              <TouchableOpacity
                style={styles.quickCreateBtn}
                onPress={() => navigate('schedule_change_broadcast')}
                activeOpacity={0.8}
              >
                <Text style={styles.quickCreateBtnText}>+ Broadcast</Text>
              </TouchableOpacity>
              <Text style={styles.actionArrow}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('content_management')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="document" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Content Registry (BR11)</Text>
              <Text style={styles.actionSubtitle}>Review, edit, unpublish, or archive department notices</Text>
            </View>
            <Text style={styles.actionArrow}>Manage →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('staff_event_management')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="sparkles" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Event Management & RSVPs (BR3/4)</Text>
              <Text style={styles.actionSubtitle}>Publish workshops, guest lectures, and track live attendee interest</Text>
            </View>
            <View style={styles.actionRowActions}>
              <TouchableOpacity
                style={styles.quickCreateBtn}
                onPress={() => navigate('staff_event_management', { openCreate: true })}
                activeOpacity={0.8}
              >
                <Text style={styles.quickCreateBtnText}>+ New Event</Text>
              </TouchableOpacity>
              <Text style={styles.actionArrow}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('staff_society_management')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="directory" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Society & Club Operations (BR5/6)</Text>
              <Text style={styles.actionSubtitle}>Approve student membership requests and manage club profiles</Text>
            </View>
            <Text style={styles.actionArrow}>Societies →</Text>
          </TouchableOpacity>
        </View>

        {/* Operational Queues & Approvals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operational Queues & Triage</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('facility_queue')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="tool" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Facility Defect Queue (BR21)</Text>
              <Text style={styles.actionSubtitle}>Triage IT, electrical, and plumbing repair tickets</Text>
            </View>
            <Text style={styles.actionArrow}>Queue →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('academic_support_queue')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="school" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Academic Support Queue (BR9)</Text>
              <Text style={styles.actionSubtitle}>Assign faculty mentors and tutors to student study requests</Text>
            </View>
            <Text style={styles.actionArrow}>Queue →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('feedback_inbox')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="chat" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Student Feedback Inbox (BR17)</Text>
              <Text style={styles.actionSubtitle}>Review student inquiries, suggestions, and send official replies</Text>
            </View>
            <Text style={styles.actionArrow}>Inbox →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('room_booking_queue')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="building" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Room Booking Approvals (BR8)</Text>
              <Text style={styles.actionSubtitle}>Manage study room reservations & conflict overrides</Text>
            </View>
            <Text style={styles.actionArrow}>Bookings →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('lost_found_admin')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="search" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Lost & Found Security Admin (BR7)</Text>
              <Text style={styles.actionSubtitle}>Inspect secret verification hints and authorize item handovers</Text>
            </View>
            <Text style={styles.actionArrow}>Admin →</Text>
          </TouchableOpacity>
        </View>

        {/* Administration & Knowledgebase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administration & Knowledgebase</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('admin_overview')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="admin" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Executive Telemetry & Overview (BR1)</Text>
              <Text style={styles.actionSubtitle}>Cross-cutting university health, activity metrics & long-term logs</Text>
            </View>
            <Text style={styles.actionArrow}>Admin Hub →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('user_role_management')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="admin" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>User & Role Management (BR12)</Text>
              <Text style={styles.actionSubtitle}>Configure 8-tier RBAC permissions and user account status</Text>
            </View>
            <Text style={styles.actionArrow}>RBAC →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('faq_management')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="help" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Campus FAQ Management (BR10)</Text>
              <Text style={styles.actionSubtitle}>Maintain verified Q&As and train AI Campus Assistant corpus</Text>
            </View>
            <Text style={styles.actionArrow}>FAQs →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigate('staff_directory_management')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrapper}>
              <IconSymbol name="person" size={20} color={colors.primary[700]} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Staff Directory Admin (BR22)</Text>
              <Text style={styles.actionSubtitle}>Update faculty consulting hours, office rooms & contact topics</Text>
            </View>
            <Text style={styles.actionArrow}>Directory →</Text>
          </TouchableOpacity>
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
  deptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[900],
    padding: spacing[4],
    borderRadius: radius.md,
    marginBottom: spacing[4],
  },
  deptLeft: {
    flex: 1,
    marginRight: spacing[2],
  },
  deptTitle: {
    ...typography.labelSm,
    color: colors.neutral[0],
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 2,
  },
  deptSubtitle: {
    ...typography.caption,
    color: colors.neutral[400],
    fontSize: 11,
  },
  roleTag: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
  },
  roleTagText: {
    ...typography.caption,
    color: colors.neutral[0],
    fontWeight: '800',
    fontSize: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2.5],
    marginBottom: spacing[5],
  },
  kpiCard: {
    width: '48%',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3.5],
  },
  kpiCardAlert: {
    borderColor: colors.critical[200],
    backgroundColor: colors.critical[50],
  },
  kpiNum: {
    ...typography.headlineMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: 2,
  },
  kpiLabel: {
    ...typography.labelSm,
    color: colors.neutral[800],
    fontWeight: '700',
    marginBottom: 2,
  },
  kpiSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.neutral[500],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    ...typography.labelSm,
    color: colors.neutral[700],
    fontWeight: '700',
    marginBottom: spacing[2.5],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3.5],
    marginBottom: spacing[2.5],
  },
  actionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  actionIconCritical: {
    backgroundColor: colors.critical[50],
  },
  actionTextCol: {
    flex: 1,
    marginRight: spacing[2],
  },
  actionTitle: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.neutral[500],
    lineHeight: 16,
  },
  actionArrow: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '700',
  },
  actionRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  quickCreateBtn: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
  },
  quickCreateBtnText: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '700',
  },
  quickCriticalBtn: {
    backgroundColor: colors.critical[600],
    borderColor: colors.critical[600],
  },
});
