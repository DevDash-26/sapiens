import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { ScreenId } from '../../types/navigation';
import { Role } from '../../types/contract';
import { IconSymbol, IconSymbolName } from './IconSymbol';

interface BottomTabBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  unreadNotifsCount?: number;
  activeAlertsCount?: number;
  activeRole?: Role;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentScreen,
  onNavigate,
  unreadNotifsCount = 0,
  activeAlertsCount = 0,
  activeRole = 'student',
}) => {
  // Role-Based Navigation Tabs per API Contract & RBAC specs
  const getTabsForRole = (): Array<{
    id: ScreenId;
    label: string;
    icon: IconSymbolName;
    badgeCount?: number;
    badgeColor?: string;
  }> => {
    if (activeRole === 'super_admin' || activeRole === 'admin') {
      return [
        { id: 'admin_overview', label: 'Admin Hub', icon: 'admin' },
        { id: 'staff_dashboard', label: 'Console', icon: 'console' },
        { id: 'announcements_feed', label: 'Notices', icon: 'notices' },
        { id: 'services_hub', label: 'Services', icon: 'services' },
        { id: 'alerts_feed', label: 'Alerts', icon: 'alerts', badgeCount: activeAlertsCount, badgeColor: colors.accent.DEFAULT },
      ];
    }

    if (activeRole === 'manager') {
      return [
        { id: 'staff_dashboard', label: 'Console', icon: 'console' },
        { id: 'announcements_feed', label: 'Notices', icon: 'notices' },
        { id: 'events_feed', label: 'Events', icon: 'events' },
        { id: 'services_hub', label: 'Services', icon: 'services' },
        { id: 'alerts_feed', label: 'Alerts', icon: 'alerts', badgeCount: activeAlertsCount, badgeColor: colors.accent.DEFAULT },
      ];
    }

    if (activeRole === 'academic_staff' || activeRole === 'finance_staff' || activeRole === 'society_rep') {
      return [
        { id: 'staff_dashboard', label: 'Console', icon: 'console' },
        { id: 'announcements_feed', label: 'Notices', icon: 'notices' },
        { id: 'events_feed', label: 'Events', icon: 'events' },
        { id: 'staff_directory', label: 'Directory', icon: 'directory' },
        { id: 'alerts_feed', label: 'Alerts', icon: 'alerts', badgeCount: activeAlertsCount, badgeColor: colors.accent.DEFAULT },
      ];
    }

    if (activeRole === 'alumni') {
      return [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'opportunities_board', label: 'Careers', icon: 'careers' },
        { id: 'student_highlights', label: 'Highlights', icon: 'highlights' },
        { id: 'announcements_feed', label: 'Notices', icon: 'notices' },
        { id: 'alerts_feed', label: 'Alerts', icon: 'alerts', badgeCount: activeAlertsCount, badgeColor: colors.accent.DEFAULT },
      ];
    }

    // Default Student Tabs
    return [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'announcements_feed', label: 'Notices', icon: 'notices' },
      { id: 'events_feed', label: 'Events', icon: 'events' },
      { id: 'services_hub', label: 'Services', icon: 'services' },
      { id: 'alerts_feed', label: 'Alerts', icon: 'alerts', badgeCount: activeAlertsCount, badgeColor: colors.accent.DEFAULT },
    ];
  };

  const tabs = getTabsForRole();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive =
          currentScreen === tab.id ||
          (tab.id === 'announcements_feed' && currentScreen === 'announcement_detail') ||
          (tab.id === 'events_feed' && (currentScreen === 'event_detail' || currentScreen === 'academic_calendar')) ||
          (tab.id === 'services_hub' &&
            (currentScreen === 'societies_directory' ||
              currentScreen === 'society_detail' ||
              currentScreen === 'lost_found_feed' ||
              currentScreen === 'report_lost_item' ||
              currentScreen === 'report_found_item' ||
              currentScreen === 'item_detail_claim' ||
              currentScreen === 'my_requests' ||
              currentScreen === 'classroom_availability')) ||
          (tab.id === 'alerts_feed' && currentScreen === 'schedule_change_notice') ||
          (tab.id === 'staff_dashboard' &&
            (currentScreen === 'facility_queue' ||
              currentScreen === 'academic_support_queue' ||
              currentScreen === 'feedback_inbox' ||
              currentScreen === 'room_booking_queue' ||
              currentScreen === 'lost_found_admin'));

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onNavigate(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <IconSymbol
                name={tab.icon}
                size={22}
                color={isActive ? colors.primary.DEFAULT : colors.neutral.textMuted}
                active={isActive}
              />
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: tab.badgeColor || colors.accent.DEFAULT },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {tab.badgeCount > 9 ? '9+' : tab.badgeCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs + 2,
    paddingBottom: spacing.sm,
    height: 58,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    borderRadius: radius.pill,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: 9,
    fontWeight: '700',
  },
});
