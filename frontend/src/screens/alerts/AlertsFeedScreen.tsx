import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { ListRow } from '../../components/common/ListRow';
import { FilterChip } from '../../components/common/FilterChip';
import { EmptyState } from '../../components/common/EmptyState';
import { useNavigation } from '../../contexts/NavigationContext';

export const AlertsFeedScreen: React.FC = () => {
  const { navigate, alerts, activeRole } = useNavigation();
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const canBroadcastAlert = ['super_admin', 'admin', 'manager'].includes(activeRole);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'active') return a.status === 'active';
    if (filter === 'resolved') return a.status === 'resolved';
    return true;
  });

  return (
    <View style={styles.container}>
      {canBroadcastAlert && (
        <View style={styles.broadcastBar}>
          <View style={styles.broadcastInfo}>
            <Text style={styles.broadcastTitle}>Incident Response Controls</Text>
            <Text style={styles.broadcastSub}>Dispatch instant Text.lk SMS alerts and safety notices</Text>
          </View>
          <TouchableOpacity
            style={styles.broadcastBtn}
            onPress={() => navigate('emergency_broadcast')}
            activeOpacity={0.8}
          >
            <Text style={styles.broadcastBtnText}>+ Broadcast</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Emergency Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Safety & Emergency Alerts</Text>
          <Text style={styles.subtitle}>
            Critical campus notices, closure warnings, and schedule changes with instant Text.lk SMS integration.
          </Text>
        </View>

        <View style={styles.filterRow}>
          <FilterChip
            label="All Alerts"
            count={alerts.length}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterChip
            label="Active Broadcasts"
            count={alerts.filter((a) => a.status === 'active').length}
            active={filter === 'active'}
            onPress={() => setFilter('active')}
          />
          <FilterChip
            label="Resolved"
            active={filter === 'resolved'}
            onPress={() => setFilter('resolved')}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredAlerts.length === 0 ? (
          <EmptyState
            title="No alerts found"
            description="There are currently no alerts matching this filter."
            actionTitle="Show all alerts"
            onActionPress={() => setFilter('all')}
          />
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.kind === 'emergency';
            const isClosure = alert.kind === 'closure';
            const badgeVariant = isCritical
              ? 'critical'
              : isClosure
              ? 'warning'
              : 'active';

            const badgeLabel =
              alert.status === 'resolved'
                ? 'RESOLVED'
                : alert.kind.replace('_', ' ').toUpperCase();

            const leftAccent =
              alert.status === 'resolved'
                ? colors.neutral.border
                : isCritical
                ? colors.accent.DEFAULT
                : colors.status.warning.solid;

            return (
              <ListRow
                key={alert.id}
                title={alert.title}
                subtitle={alert.body.replace(/\*\*/g, '').slice(0, 110) + '...'}
                meta={
                  alert.status === 'active'
                    ? 'Active Notice · Text.lk SMS sent'
                    : 'Resolved'
                }
                badgeLabel={badgeLabel}
                badgeVariant={badgeVariant}
                leftAccentColor={leftAccent}
                onPress={() =>
                  navigate('schedule_change_notice', { alertId: alert.id })
                }
              />
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
    backgroundColor: colors.neutral.bg,
  },
  broadcastBar: {
    backgroundColor: colors.status.error.bg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.status.error.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  broadcastInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  broadcastTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.status.error.text,
  },
  broadcastSub: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 1,
  },
  broadcastBtn: {
    backgroundColor: colors.accent.DEFAULT,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  broadcastBtnText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  headerTop: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.neutral.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
});
