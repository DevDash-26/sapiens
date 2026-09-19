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
import { Role, User } from '../../types/contract';
import { apiClient } from '../../services/apiClient';
import { authService, SEED_DEMO_ACCOUNTS } from '../../services/authService';

export const LoginScreen: React.FC = () => {
  const { navigate, setCurrentUser, setRoleOverride } = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your university email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.loginWithCredentials(email.trim(), password);
      if (res?.user) {
        setCurrentUser(res.user);
        setRoleOverride(res.user.role);
        setLoading(false);
        navigate('home');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Authentication failed. Please verify your university email and password.');
    }
  };

  const handleQuickDemo = async (roleKey: string) => {
    setError(null);
    setDemoLoadingRole(roleKey);
    try {
      const res = await authService.switchDemoRole(roleKey as any);
      if (res?.user) {
        setCurrentUser(res.user);
        setRoleOverride(res.user.role);
        setDemoLoadingRole(null);
        navigate('home');
      }
    } catch (err: any) {
      setDemoLoadingRole(null);
      setError(err?.message || `Failed to sign in with demo account ${roleKey}`);
    }
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
              style={styles.loginLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Universal College Lanka</Text>
          <Text style={styles.subtitle}>Digital Campus Hub</Text>
        </View>

        <Card style={styles.formCard} padding="lg">
          <Text style={styles.formTitle}>Sign in to your account</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          <FormField
            label="University Email"
            value={email}
            onChangeText={setEmail}
            placeholder="student@ucl.lk or staff@ucl.lk"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            title={loading ? 'Signing in...' : 'Sign In'}
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to UCL Campus?</Text>
            <TouchableOpacity onPress={() => navigate('signup')} activeOpacity={0.7}>
              <Text style={styles.signupLink}> Create an account</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 8-Tier RBAC Instant Demo Access Section */}
        <Card style={styles.demoCard} padding="md">
          <View style={styles.demoHeader}>
            <Text style={styles.demoTitle}>⚡ Instant Demo Role Sign-In</Text>
            <Text style={styles.demoSub}>
              One-tap authentic JWT login via <Text style={{ fontFamily: 'monospace' }}>/v1/auth/demo-token</Text>
            </Text>
          </View>

          <View style={styles.demoGrid}>
            {[
              { key: 'manager', label: 'Facilities Manager', email: 'manager@ucl.demo', badge: 'Tier 6' },
              { key: 'admin', label: 'Admin Staff', email: 'admin@ucl.demo', badge: 'Tier 7' },
              { key: 'super_admin', label: 'Super Admin', email: 'super@ucl.demo', badge: 'Tier 8' },
              { key: 'student', label: 'Student', email: 'nimasha@ucl.demo', badge: 'Tier 2' },
              { key: 'academic_staff', label: 'Academic Staff', email: 'lecturer.foc@ucl.demo', badge: 'Tier 4' },
              { key: 'finance_staff', label: 'Finance Staff', email: 'finance@ucl.demo', badge: 'Tier 5' },
              { key: 'society_rep', label: 'Society Rep', email: 'robotics.rep@ucl.demo', badge: 'Tier 3' },
              { key: 'past_alumni', label: 'Past Alumni', email: 'alumni@ucl.demo', badge: 'Tier 1' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.demoPill,
                  demoLoadingRole === item.key && styles.demoPillActive,
                ]}
                onPress={() => handleQuickDemo(item.key)}
                activeOpacity={0.75}
                disabled={!!demoLoadingRole || loading}
              >
                <View style={styles.demoPillTop}>
                  <Text style={styles.demoPillLabel} numberOfLines={1}>{item.label}</Text>
                  <View style={styles.tierBadge}>
                    <Text style={styles.tierBadgeText}>{item.badge}</Text>
                  </View>
                </View>
                <Text style={styles.demoPillEmail} numberOfLines={1}>
                  {demoLoadingRole === item.key ? 'Authenticating...' : item.email}
                </Text>
              </TouchableOpacity>
            ))}
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    justifyContent: 'center',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  crestBadge: {
    width: 64,
    height: 64,
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
  loginLogo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.neutral.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.neutral.text,
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
  loginBtn: {
    marginTop: spacing.sm,
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
  signupLink: {
    fontSize: 13,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  demoCard: {
    backgroundColor: '#ffffff',
    borderColor: colors.neutral.border,
    borderWidth: 1,
    borderRadius: radius.card,
    marginTop: spacing.md,
  },
  demoHeader: {
    marginBottom: spacing.md,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral.text,
  },
  demoSub: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoPill: {
    width: '48%',
    backgroundColor: colors.neutral.bg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.control,
    padding: spacing.sm,
  },
  demoPillActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.surface,
  },
  demoPillTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  demoPillLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.text,
    flex: 1,
  },
  tierBadge: {
    backgroundColor: colors.accent.surface,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.accent.DEFAULT,
  },
  demoPillEmail: {
    fontSize: 10,
    color: colors.neutral.textMuted,
  },
});
