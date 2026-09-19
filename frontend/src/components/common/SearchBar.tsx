import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

import { IconSymbol } from './IconSymbol';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  style,
}) => {
  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchIcon}>
        <IconSymbol name="search" size={18} color={colors.neutral.textMuted} />
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <IconSymbol name="close" size={16} color={colors.neutral.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    height: 44,
    width: '100%',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
    color: colors.neutral.textMuted,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral.text,
    height: '100%',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.textMuted,
  },
});
