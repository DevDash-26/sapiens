import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { AuthRBACProvider, useAuthRBAC } from './src/contexts/AuthRBACContext';
import { Header } from './src/components';
import { AdminDashboard } from './src/screens/admin/AdminDashboard';
import { StaffDashboard } from './src/screens/staff/StaffDashboard';
import { StudentDashboard } from './src/screens/student/StudentDashboard';
import { AlumniDashboard } from './src/screens/alumni/AlumniDashboard';
import { UserRole } from './src/types/auth';
import { getPortalCategory } from './src/utils/rbacGuard';

const AppNavigator: React.FC = () => {
  const { role, loading } = useAuthRBAC();
  // Role switcher state for local preview & testing the 8 tiers
  const [selectedRoleOverride, setSelectedRoleOverride] = useState<UserRole | null>(null);

  const activeRole: UserRole = selectedRoleOverride || role || 'student';
  const portal = getPortalCategory(activeRole);

  const ALL_ROLES: UserRole[] = [
    'super_admin',
    'admin',
    'manager',
    'academic_staff',
    'finance_staff',
    'society_rep',
    'student',
    'past_alumni',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <Header
        title="UCL Campus System"
        subtitle={`Active Role: ${activeRole.replace('_', ' ').toUpperCase()}`}
      />

      {/* Role Switcher Toolbar for interactive verification of 8 roles */}
      <View style={styles.roleToolbar}>
        <Text style={styles.roleToolbarLabel}>RBAC Switcher:</Text>
        <View style={styles.roleChips}>
          {ALL_ROLES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleChip, activeRole === r && styles.roleChipActive]}
              onPress={() => setSelectedRoleOverride(r)}
            >
              <Text style={[styles.roleChipText, activeRole === r && styles.roleChipTextActive]}>
                {r.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.contentContainer}>
        {portal === 'admin' && <AdminDashboard />}
        {portal === 'staff' && <StaffDashboard />}
        {portal === 'student' && <StudentDashboard />}
        {portal === 'alumni' && <AlumniDashboard />}
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthRBACProvider>
      <AppNavigator />
    </AuthRBACProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  roleToolbar: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  roleToolbarLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
  },
  roleChipText: {
    color: '#cbd5e1',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  roleChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
