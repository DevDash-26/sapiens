import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

interface FilterChipProps {
  label: string;
  count?: number;
  active?: boolean;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  count,
  active,
  selected,
  onPress,
  style,
}) => {
  const isSelected = active !== undefined ? active : (selected !== undefined ? selected : false);

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isSelected ? styles.activeChip : styles.inactiveChip,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.labelText,
          isSelected ? styles.activeLabelText : styles.inactiveLabelText,
        ]}
      >
        {label}
      </Text>

      {count !== undefined && (
        <View
          style={[
            styles.countBadge,
            isSelected ? styles.activeCountBadge : styles.inactiveCountBadge,
          ]}
        >
          <Text
            style={[
              styles.countText,
              isSelected ? styles.activeCountText : styles.inactiveCountText,
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  activeChip: {
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.DEFAULT,
  },
  inactiveChip: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral.border,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeLabelText: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  inactiveLabelText: {
    color: colors.neutral.textSecondary,
  },
  countBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  activeCountBadge: {
    backgroundColor: colors.primary.DEFAULT,
  },
  inactiveCountBadge: {
    backgroundColor: colors.neutral.surfaceAlt,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeCountText: {
    color: '#ffffff',
  },
  inactiveCountText: {
    color: colors.neutral.textSecondary,
  },
});
