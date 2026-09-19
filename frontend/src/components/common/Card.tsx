import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'accent' | 'error';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'md',
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'lg':
        return spacing.lg;
      case 'md':
      default:
        return spacing.md;
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.neutral.white,
          borderWidth: 1,
          borderColor: colors.neutral.border,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        };
      case 'accent':
        return {
          backgroundColor: colors.primary.surface,
          borderWidth: 1,
          borderColor: colors.primary.border,
        };
      case 'error':
        return {
          backgroundColor: colors.status.error.bg,
          borderWidth: 1,
          borderColor: colors.status.error.border,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.neutral.white,
          borderWidth: 1,
          borderColor: colors.neutral.border,
        };
    }
  };

  const combinedStyles: ViewStyle = {
    borderRadius: radius.card,
    padding: getPadding(),
    ...getVariantStyle(),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[combinedStyles, style]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[combinedStyles, style]}>{children}</View>;
};
