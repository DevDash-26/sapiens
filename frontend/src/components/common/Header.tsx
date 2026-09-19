import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthRBAC } from '../../contexts/AuthRBACContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onLogout }) => {
  const { profile, roleDisplayName, logout } = useAuthRBAC();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.userInfo}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{roleDisplayName || 'Guest'}</Text>
        </View>
        {profile?.displayName && <Text style={styles.userName}>{profile.displayName}</Text>}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e3a8a',
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#93c5fd',
    fontSize: 13,
    marginTop: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  userName: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500',
  },
  logoutButton: {
    marginLeft: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
