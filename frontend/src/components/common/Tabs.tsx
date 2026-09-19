import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string = string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  style?: ViewStyle;
  variant?: 'pill' | 'underline';
}

export const Tabs = <T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  style,
  variant = 'pill',
}: TabsProps<T>) => {
  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabItem,
              isActive && styles.activeTabItem,
            ]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>

            {tab.count !== undefined && (
              <View
                style={[
                  styles.countBadge,
                  isActive ? styles.activeCountBadge : styles.inactiveCountBadge,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isActive ? styles.activeCountText : styles.inactiveCountText,
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.surfaceAlt,
    borderRadius: radius.control,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.control - 2,
  },
  activeTabItem: {
    backgroundColor: colors.neutral.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral.textMuted,
  },
  activeTabText: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  countBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  activeCountBadge: {
    backgroundColor: colors.primary.surface,
  },
  inactiveCountBadge: {
    backgroundColor: colors.neutral.border,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeCountText: {
    color: colors.primary.DEFAULT,
  },
  inactiveCountText: {
    color: colors.neutral.textMuted,
  },
});
