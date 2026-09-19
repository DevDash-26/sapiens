import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = () => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.control,
      opacity: disabled ? 0.6 : 1,
    };

    if (fullWidth) {
      base.width = '100%';
    }

    // Size styling
    switch (size) {
      case 'sm':
        base.paddingVertical = spacing.xs + 2;
        base.paddingHorizontal = spacing.md;
        base.minHeight = 36;
        break;
      case 'lg':
        base.paddingVertical = spacing.md + 2;
        base.paddingHorizontal = spacing.xl;
        base.minHeight = 52;
        break;
      case 'md':
      default:
        base.paddingVertical = spacing.sm + 3;
        base.paddingHorizontal = spacing.lg;
        base.minHeight = 44;
        break;
    }

    // Variant styling
    switch (variant) {
      case 'secondary':
        base.backgroundColor = colors.neutral.surfaceAlt;
        base.borderWidth = 1;
        base.borderColor = colors.neutral.borderStrong;
        break;
      case 'outline':
        base.backgroundColor = colors.neutral.white;
        base.borderWidth = 1.5;
        base.borderColor = colors.primary.DEFAULT;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'danger':
      case 'destructive':
        base.backgroundColor = colors.accent.DEFAULT;
        break;
      case 'primary':
      default:
        base.backgroundColor = colors.primary.DEFAULT;
        break;
    }

    return base;
  };

  const getTextColor = (): string => {
    if (disabled) return colors.neutral.textMuted;
    switch (variant) {
      case 'secondary':
        return colors.neutral.text;
      case 'outline':
        return colors.primary.DEFAULT;
      case 'ghost':
        return colors.primary.DEFAULT;
      case 'danger':
      case 'destructive':
        return colors.neutral.white;
      case 'primary':
      default:
        return colors.neutral.white;
    }
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: 13, lineHeight: 18, fontWeight: '600' };
      case 'lg':
        return { fontSize: 16, lineHeight: 22, fontWeight: '600' };
      case 'md':
      default:
        return { fontSize: 14, lineHeight: 20, fontWeight: '600' };
    }
  };

  const textColor = getTextColor();

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.innerRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[getTextSize(), { color: textColor }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
});
