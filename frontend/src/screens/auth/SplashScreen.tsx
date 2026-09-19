import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useNavigation } from '../../contexts/NavigationContext';

export const SplashScreen: React.FC = () => {
  const { navigate, currentUser } = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      // If user exists, navigate to home, else login
      if (currentUser) {
        navigate('home');
      } else {
        navigate('login');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.markContainer}>
        <View style={styles.crestBadge}>
          <Image
            source={require('../../../assets/logos/ucl-logo-transparent.png')}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Universal College Lanka</Text>
        <Text style={styles.systemName}>Campus Management System</Text>
      </View>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.primary.light} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  markContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  crestBadge: {
    width: 88,
    height: 88,
    borderRadius: radius.card,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  splashLogo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    color: colors.neutral.white,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  systemName: {
    color: colors.neutral.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
  },
});
