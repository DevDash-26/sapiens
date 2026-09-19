import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, EmptyState, Button } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

type StateMode = 'empty' | 'network_error' | 'offline' | 'maintenance';

export const SystemStatesScreen: React.FC = () => {
  const { goBack, navigate } = useNavigation();

  const [activeMode, setActiveMode] = useState<StateMode>('empty');
  const [retrying, setRetrying] = useState<boolean>(false);
  const [retrySuccess, setRetrySuccess] = useState<boolean>(false);

  const handleRetry = () => {
    setRetrying(true);
    setRetrySuccess(false);
    setTimeout(() => {
      setRetrying(false);
      setRetrySuccess(true);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Header
        title="System States & Resilience"
        showBack
        onBack={goBack}
      />

      {/* Mode Switcher */}
      <View style={styles.modeBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeScroll}>
          <TouchableOpacity
            style={[styles.modeTab, activeMode === 'empty' && styles.modeTabActive]}
            onPress={() => setActiveMode('empty')}
          >
            <Text style={[styles.modeText, activeMode === 'empty' && styles.modeTextActive]}>
              1. Empty List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, activeMode === 'network_error' && styles.modeTabActive]}
            onPress={() => setActiveMode('network_error')}
          >
            <Text style={[styles.modeText, activeMode === 'network_error' && styles.modeTextActive]}>
              2. Network Error
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, activeMode === 'offline' && styles.modeTabActive]}
            onPress={() => setActiveMode('offline')}
          >
            <Text style={[styles.modeText, activeMode === 'offline' && styles.modeTextActive]}>
              3. Offline Mode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, activeMode === 'maintenance' && styles.modeTabActive]}
            onPress={() => setActiveMode('maintenance')}
          >
            <Text style={[styles.modeText, activeMode === 'maintenance' && styles.modeTextActive]}>
              4. Maintenance
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* State Preview Frame */}
        <View style={styles.previewContainer}>
          {activeMode === 'empty' && (
            <View>
              <EmptyState
                iconText="📭"
                title="No Announcements for Your Cohort"
                description="There are currently no active notices published for your faculty and year group. University-wide notices remain visible on the home feed."
                action={{
                  label: 'View Home Feed',
                  onPress: () => navigate('home'),
                }}
              />
              <View style={styles.docBox}>
                <Text style={styles.docTitle}>NFR1 Usability Specification:</Text>
                <Text style={styles.docBody}>
                  Empty states must always provide a non-punitive explanation and an actionable next step rather than leaving the user at a blank dead-end.
                </Text>
              </View>
            </View>
          )}

          {activeMode === 'network_error' && (
            <View style={styles.errorContainer}>
              <View style={styles.errorIconBox}>
                <Text style={styles.errorEmoji}>⚡</Text>
              </View>
              <Text style={styles.errorTitle}>Unable to Reach Campus Server</Text>
              <Text style={styles.errorBody}>
                We couldn't load the latest academic feed. Check your campus Wi-Fi or mobile data connection.
              </Text>

              {retrySuccess ? (
                <View style={styles.retrySuccessBox}>
                  <Text style={styles.retrySuccessText}>✓ Connection restored! Data updated.</Text>
                </View>
              ) : (
                <Button
                  title={retrying ? 'Connecting to UCL Hub...' : 'Retry Connection'}
                  variant="primary"
                  size="md"
                  onPress={handleRetry}
                  disabled={retrying}
                  style={{ minWidth: 180, alignSelf: 'center' }}
                />
              )}

              <View style={[styles.docBox, { marginTop: spacing[4] }]}>
                <Text style={styles.docTitle}>NFR3 Reliability Specification:</Text>
                <Text style={styles.docBody}>
                  Client maps standard error codes (400/401/403/404/500) to clear, human-understandable recovery instructions without exposing raw stack traces.
                </Text>
              </View>
            </View>
          )}

          {activeMode === 'offline' && (
            <View>
              {/* Offline Banner */}
              <View style={styles.offlineBanner}>
                <Text style={styles.offlineBannerIcon}>📡</Text>
                <View style={styles.offlineBannerTextCol}>
                  <Text style={styles.offlineBannerTitle}>Offline Mode Active</Text>
                  <Text style={styles.offlineBannerSubtitle}>
                    Displaying cached campus notices. Actions will sync upon reconnecting.
                  </Text>
                </View>
              </View>

              <EmptyState
                iconText="💾"
                title="Showing Cached Notices"
                description="Your device is currently offline. You can still read previously downloaded announcements and safety alerts."
                action={{
                  label: 'Sync When Online',
                  onPress: () => {},
                }}
              />
            </View>
          )}

          {activeMode === 'maintenance' && (
            <View style={styles.errorContainer}>
              <View style={[styles.errorIconBox, { backgroundColor: colors.warning[50] }]}>
                <Text style={styles.errorEmoji}>🚧</Text>
              </View>
              <Text style={styles.errorTitle}>Scheduled System Upgrade</Text>
              <Text style={styles.errorBody}>
                The UCL Student Information System is undergoing scheduled semester maintenance until 06:00 AM. Emergency alert broadcasts remain active.
              </Text>
              <Button
                title="View Emergency Alerts"
                variant="outline"
                size="md"
                onPress={() => navigate('alerts_feed')}
                style={{ alignSelf: 'center' }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  modeBar: {
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modeScroll: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  modeTab: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  modeTabActive: {
    backgroundColor: colors.primary[600],
  },
  modeText: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  modeTextActive: {
    color: colors.neutral[0],
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  previewContainer: {
    paddingTop: spacing[2],
  },
  errorContainer: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[5],
    alignItems: 'center',
  },
  errorIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.critical[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  errorEmoji: {
    fontSize: 28,
  },
  errorTitle: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[1],
    textAlign: 'center',
  },
  errorBody: {
    ...typography.bodySm,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing[4],
    lineHeight: 20,
  },
  retrySuccessBox: {
    backgroundColor: colors.success[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
  },
  retrySuccessText: {
    ...typography.labelSm,
    color: colors.success[700],
    fontWeight: '700',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[800],
    padding: spacing[3],
    borderRadius: radius.md,
    marginBottom: spacing[3],
  },
  offlineBannerIcon: {
    fontSize: 20,
    marginRight: spacing[2.5],
  },
  offlineBannerTextCol: {
    flex: 1,
  },
  offlineBannerTitle: {
    ...typography.labelSm,
    color: colors.neutral[0],
    fontWeight: '700',
  },
  offlineBannerSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.neutral[300],
    marginTop: 1,
  },
  docBox: {
    backgroundColor: colors.primary[50],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[600],
    borderRadius: radius.sm,
    padding: spacing[3],
    marginTop: spacing[3],
  },
  docTitle: {
    ...typography.caption,
    color: colors.primary[900],
    fontWeight: '700',
    marginBottom: spacing[0.5],
  },
  docBody: {
    ...typography.caption,
    color: colors.primary[800],
    lineHeight: 16,
  },
});
