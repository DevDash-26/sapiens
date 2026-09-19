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

export const NotificationsCenterScreen: React.FC = () => {
  const {
    notifications,
    currentUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigate,
  } = useNavigation();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Filter for current user
  const userNotifs = notifications.filter((n) => n.uid === currentUser.id);

  const filteredNotifs = userNotifs.filter((n) => {
    if (filter === 'unread') return n.readAt === null;
    return true;
  });

  const unreadCount = userNotifs.filter((n) => n.readAt === null).length;

  const handleNotificationPress = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);

    // Route to appropriate screen based on refType
    if (notif.refType === 'alert') {
      navigate('schedule_change_notice', { alertId: notif.refId });
    } else if (notif.refType === 'content') {
      navigate('announcement_detail', { announcementId: notif.refId });
    } else {
      navigate('announcements_feed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Notifications Center</Text>
            <Text style={styles.subtitle}>
              {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
            </Text>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllNotificationsAsRead}
              activeOpacity={0.7}
              style={styles.markAllBtn}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <FilterChip
            label="All"
            count={userNotifs.length}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterChip
            label="Unread"
            count={unreadCount}
            active={filter === 'unread'}
            onPress={() => setFilter('unread')}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifs.length === 0 ? (
          <EmptyState
            title="Inbox is all clear"
            description="You have no notifications in this view."
            actionTitle={filter === 'unread' ? 'Show all notifications' : undefined}
            onActionPress={filter === 'unread' ? () => setFilter('all') : undefined}
          />
        ) : (
          filteredNotifs.map((notif) => {
            const isUnread = notif.readAt === null;
            const badgeVariant =
              notif.type === 'alert'
                ? 'critical'
                : notif.type === 'announcement'
                ? 'targeted'
                : 'academic';

            return (
              <ListRow
                key={notif.id}
                title={notif.title}
                subtitle={notif.body}
                meta={isUnread ? 'Unread · Tap to view' : 'Read'}
                badgeLabel={notif.type.toUpperCase()}
                badgeVariant={badgeVariant}
                isUnread={isUnread}
                onPress={() => handleNotificationPress(notif)}
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
  header: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
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
