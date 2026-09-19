import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { Card } from '../../components/common/Card';
import { useNavigation } from '../../contexts/NavigationContext';
import { CAMPUS_META } from '../../constants/meta';
import { Faculty, Programme } from '../../types/contract';

export const SignUpScreen: React.FC = () => {
  const { navigate, setCurrentUser } = useNavigation();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty>('FOC');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = () => {
    setError(null);
    if (!displayName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid university email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Create user draft and navigate to Step 4 Onboarding
      const newUser = {
        id: `usr_${Date.now()}`,
        email: email.trim(),
        displayName: displayName.trim(),
        role: 'student' as const,
        status: 'active' as const,
        faculty: selectedFaculty,
        programme: null,
        yearGroup: null,
        studentId: studentId.trim() || 'UCL/26/NEW',
        phone: null,
        smsOptIn: true,
        societyIds: [],
        department: null,
        alumniGradYear: null,
        fcmTokens: [],
        notifPrefs: {
          push: true,
          categories: { announcement: true, event: true },
        },
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      setCurrentUser(newUser);
      navigate('onboarding');
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerArea}>
          <View style={styles.crestBadge}>
            <Image
              source={require('../../../assets/logos/ucl-logo-transparent.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Create your UCL Account</Text>
          <Text style={styles.subtitle}>
            Join the digital campus management portal
          </Text>
        </View>

        <Card style={styles.formCard} padding="lg">
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          <FormField
            label="Full Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="e.g. Nimasha Perera"
            required
          />

          <FormField
            label="University Email"
            value={email}
            onChangeText={setEmail}
            placeholder="name@ucl.demo or student email"
            autoCapitalize="none"
            keyboardType="email-address"
            required
          />

          <FormField
            label="Student ID (Optional)"
            value={studentId}
            onChangeText={setStudentId}
            placeholder="e.g. UCL/24/0142"
          />

          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            secureTextEntry
            required
          />

          {/* Faculty Selector Chips */}
          <View style={styles.facultySection}>
            <Text style={styles.facultyLabel}>Select Faculty *</Text>
            <View style={styles.facultyChips}>
              {CAMPUS_META.faculties.map((fac) => {
                const isSelected = selectedFaculty === fac.id;
                return (
                  <TouchableOpacity
                    key={fac.id}
                    style={[
                      styles.facultyChip,
                      isSelected && styles.facultyChipSelected,
                    ]}
                    onPress={() => setSelectedFaculty(fac.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.facultyChipText,
                        isSelected && styles.facultyChipTextSelected,
                      ]}
                    >
                      {fac.shortName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Button
            title={loading ? 'Creating account...' : 'Continue to Onboarding'}
            onPress={handleSignUp}
            loading={loading}
            fullWidth
            style={styles.createBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigate('login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  crestBadge: {
    width: 60,
    height: 60,
    borderRadius: radius.card,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.neutral.text,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  errorBox: {
    backgroundColor: colors.status.error.bg,
    borderColor: colors.status.error.border,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBoxText: {
    color: colors.status.error.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  facultySection: {
    marginBottom: spacing.lg,
  },
  facultyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: spacing.xs + 2,
  },
  facultyChips: {
    flexDirection: 'row',
    gap: 8,
  },
  facultyChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
    borderRadius: radius.control,
  },
  facultyChipSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  facultyChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral.text,
  },
  facultyChipTextSelected: {
    color: colors.neutral.white,
  },
  createBtn: {
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
});
