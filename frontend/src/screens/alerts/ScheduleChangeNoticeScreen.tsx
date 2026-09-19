import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useNavigation } from '../../contexts/NavigationContext';

export const ScheduleChangeNoticeScreen: React.FC = () => {
  const { params, alerts, goBack } = useNavigation();

  const alertId = params?.alertId || 'alt_9f8e7d';
  const alert = alerts.find((a) => a.id === alertId) || alerts[0];

  const isCritical = alert.kind === 'emergency';
  const isClosure = alert.kind === 'closure';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={goBack}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>← Back to Alerts</Text>
      </TouchableOpacity>

      <Card
        padding="lg"
        variant={isCritical ? 'error' : isClosure ? 'default' : 'default'}
        style={[
          styles.mainCard,
          isCritical && styles.criticalCard,
          isClosure && styles.closureCard,
        ]}
      >
        {/* Severity & Status */}
        <View style={styles.badgeRow}>
          <StatusBadge
            label={
              alert.status === 'resolved'
                ? 'RESOLVED'
                : isCritical
                ? 'CRITICAL EMERGENCY'
                : isClosure
                ? 'CAMPUS CLOSURE'
                : 'SCHEDULE CHANGE'
            }
            variant={
              alert.status === 'resolved'
                ? 'resolved'
                : isCritical
                ? 'critical'
                : 'warning'
            }
          />
          <StatusBadge
            label={alert.status.toUpperCase()}
            variant={alert.status === 'active' ? 'active' : 'neutral'}
            style={styles.statusBadge}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{alert.title}</Text>

        {/* Affects Window & Scope (BR16) */}
        {alert.affects && (
          <View style={styles.affectsBox}>
            <Text style={styles.affectsHeader}>EFFECTIVE DURATION & SCOPE</Text>
            <View style={styles.affectsRow}>
              <Text style={styles.affectsLabel}>Scope:</Text>
              <Text style={styles.affectsValue}>
                {alert.affects.scope.toUpperCase()} ({alert.affects.buildings.join(', ') || 'All Buildings'})
              </Text>
            </View>
            <View style={styles.affectsRow}>
              <Text style={styles.affectsLabel}>Effective:</Text>
              <Text style={styles.affectsValue}>
                Tuesday 22 September 2026 (All day)
              </Text>
            </View>
          </View>
        )}

        {/* Impact Counters Box (BR15, BR16) */}
        {alert.impact && (
          <View style={styles.impactGrid}>
            <View style={styles.impactCard}>
              <Text style={styles.impactNumber}>{alert.impact.usersNotified}</Text>
              <Text style={styles.impactLabel}>Notified</Text>
            </View>
            <View style={styles.impactCard}>
              <Text style={styles.impactNumber}>{alert.impact.smsSent}</Text>
              <Text style={styles.impactLabel}>Text.lk SMS</Text>
            </View>
            <View style={styles.impactCard}>
              <Text style={styles.impactNumber}>
                {alert.impact.bookingsCancelled}
              </Text>
              <Text style={styles.impactLabel}>Bookings Freed</Text>
            </View>
            <View style={styles.impactCard}>
              <Text style={styles.impactNumber}>{alert.impact.eventsFlagged}</Text>
              <Text style={styles.impactLabel}>Events Flagged</Text>
            </View>
          </View>
        )}

        {/* Notice Body */}
        <View style={styles.bodyBox}>
          <Text style={styles.bodyText}>{alert.body}</Text>
        </View>

        {/* Live Updates Stream */}
        {alert.updates.length > 0 && (
          <View style={styles.updatesSection}>
            <Text style={styles.updatesHeader}>DISPATCH TIMELINE & UPDATES</Text>
            {alert.updates.map((update, idx) => (
              <View key={idx} style={styles.updateRow}>
                <View style={styles.timelineDot} />
                <View style={styles.updateContent}>
                  <Text style={styles.updateTime}>
                    {idx === 0 ? 'Initial Broadcast' : 'Follow-up Update'}
                  </Text>
                  <Text style={styles.updateText}>{update.text}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Publisher Info */}
        <View style={styles.publisherFooter}>
          <Text style={styles.publisherText}>
            Authorized by <Text style={styles.bold}>{alert.createdBy.name}</Text> ({alert.createdBy.role.replace('_', ' ')})
          </Text>
        </View>
      </Card>
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
  backButton: {
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },
  mainCard: {
    backgroundColor: colors.neutral.white,
  },
  criticalCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.DEFAULT,
  },
  closureCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning.solid,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.neutral.text,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  affectsBox: {
    backgroundColor: colors.neutral.surfaceAlt,
    borderRadius: radius.control,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
    marginBottom: spacing.md,
  },
  affectsHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  affectsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  affectsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.textSecondary,
    width: 65,
  },
  affectsValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.text,
    flex: 1,
  },
  impactGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  impactCard: {
    flex: 1,
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.border,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  impactNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
  },
  impactLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary.dark,
    marginTop: 1,
    textAlign: 'center',
  },
  bodyBox: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.neutral.text,
  },
  updatesSection: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  updatesHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.DEFAULT,
    marginTop: 5,
    marginRight: spacing.sm,
  },
  updateContent: {
    flex: 1,
  },
  updateTime: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral.textMuted,
  },
  updateText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral.text,
    marginTop: 1,
  },
  publisherFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingTop: spacing.sm,
  },
  publisherText: {
    fontSize: 12,
    color: colors.neutral.textMuted,
  },
  bold: {
    fontWeight: '700',
    color: colors.neutral.text,
  },
});
