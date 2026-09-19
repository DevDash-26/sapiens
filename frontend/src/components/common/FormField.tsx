import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  helper,
  containerStyle,
  required = false,
  style,
  ...textInputProps
}) => {
  const displayHelper = helper || hint;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.requiredMark}> *</Text>}
        </Text>
      </View>

      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          textInputProps.multiline ? styles.multilineInput : null,
          style,
        ]}
        placeholderTextColor={colors.neutral.textMuted}
        {...textInputProps}
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : displayHelper ? (
        <Text style={styles.hintText}>{displayHelper}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral.text,
  },
  requiredMark: {
    color: colors.accent.DEFAULT,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    color: colors.neutral.text,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm + 2,
  },
  inputError: {
    borderColor: colors.accent.DEFAULT,
    backgroundColor: colors.accent.surface,
  },
  errorText: {
    fontSize: 11,
    color: colors.accent.DEFAULT,
    marginTop: 4,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 4,
  },
});
