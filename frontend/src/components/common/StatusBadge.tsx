import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

export type BadgeVariant =
  | 'verified'
  | 'critical'
  | 'warning'
  | 'active'
  | 'resolved'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'academic'
  | 'targeted'
  | 'neutral';

interface StatusBadgeProps {
  label?: string;
  variant?: BadgeVariant;
  status?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant,
  status,
  size = 'sm',
  style,
}) => {
  // Derive variant and display label from status string if status is provided
  const deriveFromStatus = (): { effectiveVariant: BadgeVariant; effectiveLabel: string } => {
    if (variant && label) {
      return { effectiveVariant: variant, effectiveLabel: label };
    }

    if (status) {
      const s = status.toLowerCase();
      switch (s) {
        case 'open':
        case 'active':
          return { effectiveVariant: 'active', effectiveLabel: label || 'Open' };
        case 'in_progress':
        case 'in_review':
        case 'pending':
          return { effectiveVariant: 'warning', effectiveLabel: label || 'In Progress' };
        case 'confirmed':
        case 'approved':
          return { effectiveVariant: 'approved', effectiveLabel: label || 'Confirmed' };
        case 'resolved':
          return { effectiveVariant: 'resolved', effectiveLabel: label || 'Resolved' };
        case 'closed':
        case 'cancelled':
        case 'cancelled_by_closure':
        case 'cancelled_by_admin':
          return { effectiveVariant: 'neutral', effectiveLabel: label || s.replace(/_/g, ' ') };
        case 'rejected':
        case 'critical':
          return { effectiveVariant: 'critical', effectiveLabel: label || 'Rejected' };
        default:
          return { effectiveVariant: 'neutral', effectiveLabel: label || status.toUpperCase() };
      }
    }

    return { effectiveVariant: variant || 'neutral', effectiveLabel: label || 'Status' };
  };

  const { effectiveVariant, effectiveLabel } = deriveFromStatus();

  const getBadgeColors = (): { bg: string; text: string; border: string } => {
    switch (effectiveVariant) {
      case 'verified':
        return {
          bg: colors.status.verified.bg,
          text: colors.status.verified.text,
          border: colors.status.verified.border,
        };
      case 'critical':
      case 'rejected':
        return {
          bg: colors.status.error.bg,
          text: colors.status.error.text,
          border: colors.status.error.border,
        };
      case 'warning':
      case 'pending':
        return {
          bg: colors.status.warning.bg,
          text: colors.status.warning.text,
          border: colors.status.warning.border,
        };
      case 'active':
      case 'approved':
      case 'resolved':
        return {
          bg: colors.status.success.bg,
          text: colors.status.success.text,
          border: colors.status.success.border,
        };
      case 'academic':
        return {
          bg: colors.primary.surface,
          text: colors.primary.DEFAULT,
          border: colors.primary.border,
        };
      case 'targeted':
        return {
          bg: colors.accent.surface,
          text: colors.accent.DEFAULT,
          border: colors.accent.border,
        };
      case 'neutral':
      default:
        return {
          bg: colors.status.neutral.bg,
          text: colors.status.neutral.text,
          border: colors.status.neutral.border,
        };
    }
  };

  const badgeColors = getBadgeColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          borderColor: badgeColors.border,
          paddingHorizontal: isSmall ? spacing.xs + 2 : spacing.sm + 2,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: badgeColors.text,
            fontSize: isSmall ? 10 : 12,
            textTransform: 'uppercase',
          },
        ]}
      >
        {effectiveLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
