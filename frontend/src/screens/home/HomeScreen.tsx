import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Card } from '../../components/common/Card';
import { ListRow } from '../../components/common/ListRow';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { IconSymbol } from '../../components/common/IconSymbol';
import { useNavigation } from '../../contexts/NavigationContext';

export const HomeScreen: React.FC = () => {
  const { navigate, currentUser, contents, alerts } = useNavigation();

  // Active Emergency or Campus Closure Alert
  const activeAlert = alerts.find((a) => a.status === 'active') || null;

  // Announcements derived directly from backend/context state
  const announcements = contents.filter((c) => c.type === 'announcement');
  const forYouNotices = announcements.filter(
    (c) =>
      currentUser.faculty &&
      (c.audience?.faculties?.includes(currentUser.faculty) ||
        (currentUser.programme && c.audience?.programmes?.includes(currentUser.programme)))
  );
  const universityNotices = announcements.filter((c) => c.audience?.all);

  // Events & Academic Milestones
  const upcomingEvents = contents.filter((c) => c.type === 'event');
  const calendarMilestones = contents.filter((c) => c.type === 'calendar');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Active Emergency / Closure Alert Banner (BR15) */}
      {activeAlert && (
        <TouchableOpacity
          onPress={() =>
            navigate(
              activeAlert.kind === 'closure'
                ? 'schedule_change_notice'
                : 'alerts_feed',
              { alertId: activeAlert.id }
            )
          }
          activeOpacity={0.85}
        >
          <Card
            variant={activeAlert.kind === 'emergency' ? 'error' : 'elevated'}
            style={[
              styles.alertBanner,
              activeAlert.kind === 'closure' && styles.closureBanner,
            ]}
            padding="md"
          >
            <View style={styles.alertHeaderRow}>
              <StatusBadge
                label={
                  activeAlert.kind === 'emergency'
                    ? 'CRITICAL SAFETY ALERT'
                    : 'CAMPUS CLOSURE'
                }
                variant={activeAlert.kind === 'emergency' ? 'critical' : 'warning'}
              />
              <Text style={styles.alertTime}>Live broadcast</Text>
            </View>

            <Text style={styles.alertTitle}>{activeAlert.title}</Text>
            <Text style={styles.alertExcerpt} numberOfLines={2}>
              {activeAlert.body.replace(/\*\*/g, '')}
            </Text>

            <View style={styles.alertFooter}>
              <Text style={styles.alertActionText}>
                View impact & schedule updates →
              </Text>
            </View>
          </Card>
        </TouchableOpacity>
      )}

      {/* Cohort Identity Strip */}
      <View style={styles.studentStrip}>
        <View style={styles.stripLogoBadge}>
          <Image
            source={require('../../../assets/logos/ucl-logo-transparent.png')}
            style={styles.stripLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.studentStripInfo}>
          <Text style={styles.greetingText}>
            Welcome, {currentUser.displayName || 'Student'}
          </Text>
          <Text style={styles.cohortText}>
            {currentUser.faculty || 'All Faculties'} ·{' '}
            {currentUser.programme || 'General'} · Year{' '}
            {currentUser.yearGroup || 1}
          </Text>
        </View>
        <StatusBadge label="VERIFIED" variant="verified" />
      </View>

      {/* Academic Milestones Strip */}
      {calendarMilestones.length > 0 && (
        <View style={styles.milestoneSection}>
          <SectionHeader title="Academic Milestones" />
          {calendarMilestones.slice(0, 1).map((cal) => (
            <Card key={cal.id} style={styles.milestoneCard} padding="md">
              <View style={styles.milestoneRow}>
                <View style={styles.milestoneDateBox}>
                  <Text style={styles.milestoneMonth}>CAL</Text>
                  <IconSymbol name="calendar" size={18} color={colors.neutral.white} />
                </View>
                <View style={styles.milestoneTextGroup}>
                  <Text style={styles.milestoneTitle}>{cal.title}</Text>
                  <Text style={styles.milestoneSummary}>{cal.summary}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Announcements Feed Section */}
      <View style={styles.section}>
        <SectionHeader
          title="Announcements & Notices"
          actionText={announcements.length > 0 ? 'View all notices' : undefined}
          onActionPress={() => navigate('announcements_feed')}
        />

        {forYouNotices.length === 0 && universityNotices.length === 0 ? (
          <Card padding="md" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No notices published</Text>
            <Text style={styles.emptySubtitle}>
              Targeted cohort announcements and university bulletins will appear here once published.
            </Text>
          </Card>
        ) : (
          <>
            {/* Targeted for student first */}
            {forYouNotices.slice(0, 2).map((item) => (
              <ListRow
                key={item.id}
                title={item.title}
                subtitle={item.summary}
                meta="Targeted to your cohort"
                badgeLabel={item.source.department}
                badgeVariant="targeted"
                onPress={() =>
                  navigate('announcement_detail', { announcementId: item.id })
                }
              />
            ))}

            {/* University wide */}
            {universityNotices.slice(0, 2).map((item) => (
              <ListRow
                key={item.id}
                title={item.title}
                subtitle={item.summary}
                meta="University-wide"
                badgeLabel={item.source.department}
                badgeVariant="verified"
                onPress={() =>
                  navigate('announcement_detail', { announcementId: item.id })
                }
              />
            ))}
          </>
        )}
      </View>

      {/* Upcoming Campus Events Preview */}
      <View style={styles.section}>
        <SectionHeader
          title="Upcoming Campus Events"
          actionText={upcomingEvents.length > 0 ? 'View full calendar' : undefined}
          onActionPress={() => navigate('events_feed')}
        />

        {upcomingEvents.length === 0 ? (
          <Card padding="md" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No upcoming events</Text>
            <Text style={styles.emptySubtitle}>
              Campus workshops, guest lectures, and student society events will be listed here.
            </Text>
          </Card>
        ) : (
          upcomingEvents.slice(0, 2).map((event) => (
            <ListRow
              key={event.id}
              title={event.title}
              subtitle={`${event.venue || 'Campus Main'} · ${event.summary}`}
              meta={event.startsAt ? new Date(event.startsAt).toLocaleDateString() : 'Scheduled'}
              badgeLabel={event.source.department}
              badgeVariant="academic"
              onPress={() =>
                navigate('event_detail', { eventId: event.id })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  alertBanner: {
    marginBottom: spacing.md,
    backgroundColor: colors.status.error.bg,
    borderColor: colors.status.error.border,
    borderWidth: 1.5,
  },
  closureBanner: {
    backgroundColor: colors.status.warning.bg,
    borderColor: colors.status.warning.border,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  alertTime: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral.textMuted,
  },
  alertTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: spacing.xxs,
  },
  alertExcerpt: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.sm,
  },
  alertFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingTop: spacing.xs,
    marginTop: spacing.xxs,
  },
  alertActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.DEFAULT,
  },
  studentStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  stripLogoBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  stripLogo: {
    width: '100%',
    height: '100%',
  },
  studentStripInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  cohortText: {
    fontSize: 12,
    color: colors.neutral.textMuted,
  },
  milestoneSection: {
    marginBottom: spacing.md,
  },
  milestoneCard: {
    marginBottom: spacing.xs,
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.border,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneDateBox: {
    width: 44,
    height: 44,
    borderRadius: radius.control,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  milestoneMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  milestoneDay: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.neutral.white,
    lineHeight: 16,
  },
  milestoneTextGroup: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  milestoneSummary: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
    lineHeight: 16,
  },
  section: {
    marginBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.neutral.surface,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.neutral.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 16,
  },
});
