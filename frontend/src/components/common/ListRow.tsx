import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { StatusBadge, BadgeVariant } from './StatusBadge';

interface ListRowProps {
  title: string;
  subtitle?: string;
  meta?: string;
  badgeLabel?: string;
  badgeVariant?: BadgeVariant;
  onPress?: () => void;
  style?: ViewStyle;
  isUnread?: boolean;
  leftAccentColor?: string;
  rightElement?: React.ReactNode;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  meta,
  badgeLabel,
  badgeVariant = 'neutral',
  onPress,
  style,
  isUnread = false,
  leftAccentColor,
  rightElement,
}) => {
  const content = (
    <View
      style={[
        styles.container,
        isUnread && styles.unreadContainer,
        leftAccentColor ? { borderLeftWidth: 4, borderLeftColor: leftAccentColor } : null,
        style,
      ]}
    >
      <View style={styles.mainCol}>
        <View style={styles.topRow}>
          {badgeLabel && (
            <StatusBadge
              label={badgeLabel}
              variant={badgeVariant}
              style={styles.badge}
            />
          )}
          {meta && <Text style={styles.metaText}>{meta}</Text>}
        </View>

        <Text
          style={[styles.title, isUnread && styles.unreadTitle]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement && <View style={styles.rightContainer}>{rightElement}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchable}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  unreadContainer: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.primary.border,
    borderLeftWidth: 3.5,
    borderLeftColor: colors.primary.DEFAULT,
  },
  mainCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  badge: {
    marginRight: spacing.sm,
  },
  metaText: {
    fontSize: 12,
    color: colors.neutral.textMuted,
    fontWeight: '500',
  },
  title: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  unreadTitle: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  rightContainer: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
