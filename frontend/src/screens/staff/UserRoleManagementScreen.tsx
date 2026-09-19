import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import {
  Button,
  StatusBadge,
  SearchBar,
  FilterChip,
  Modal,
  EmptyState,
} from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { Role, User, UserStatus } from '../../types/contract';

const ALL_ROLES: Array<{ role: Role; label: string; tier: number }> = [
  { role: 'super_admin', label: 'Super Admin', tier: 8 },
  { role: 'admin', label: 'Admin Staff', tier: 7 },
  { role: 'manager', label: 'Manager / Operations', tier: 6 },
  { role: 'finance_staff', label: 'Finance Staff', tier: 5 },
  { role: 'academic_staff', label: 'Academic Staff / Lecturer', tier: 4 },
  { role: 'society_rep', label: 'Society Rep / President', tier: 3 },
  { role: 'student', label: 'Student', tier: 2 },
  { role: 'alumni', label: 'Past Alumni', tier: 1 },
];

export const UserRoleManagementScreen: React.FC = () => {
  const { goBack, users, updateUserRole, updateUserStatus, activeRole, navigate } = useNavigation();

  // Role Gate: super_admin, admin, and manager
  const isAuthorized = ['super_admin', 'admin', 'manager'].includes(activeRole);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<Role>('student');
  const [targetStatus, setTargetStatus] = useState<UserStatus>('active');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesSearch =
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.studentId && u.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  const stats = useMemo(() => {
    const staffCount = users.filter((u) =>
      ['super_admin', 'admin', 'manager', 'academic_staff', 'finance_staff'].includes(u.role)
    ).length;
    const studentCount = users.filter((u) => u.role === 'student').length;
    const repCount = users.filter((u) => u.role === 'society_rep').length;
    return { staffCount, studentCount, repCount, total: users.length };
  }, [users]);

  if (!isAuthorized) {
    return (
      <View style={styles.container}>
        <View style={styles.unauthBox}>
          <Text style={styles.unauthEmoji}>🔒</Text>
          <Text style={styles.unauthTitle}>Access Restricted (BR12)</Text>
          <Text style={styles.unauthDesc}>
            User access control and privilege assignment requires Administrator, Manager, or Super Admin permissions.
          </Text>
          <Button
            title="Return to Staff Console"
            variant="primary"
            size="md"
            onPress={() => navigate('staff_dashboard')}
            style={{ marginTop: spacing[4] }}
          />
        </View>
      </View>
    );
  }

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setTargetRole(user.role);
    setTargetStatus(user.status);
  };

  const handleSaveUserChanges = () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    setTimeout(() => {
      updateUserRole(selectedUser.id, targetRole);
      updateUserStatus(selectedUser.id, targetStatus);
      setIsUpdating(false);
      setSelectedUser(null);
    }, 400);
  };

  return (
    <View style={styles.container}>
      {/* KPI Header */}

      {/* KPI Header */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderColor: colors.primary[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.primary[700] }]}>{stats.staffCount}</Text>
          <Text style={styles.kpiLabel}>Staff / Admins</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.neutral[300] }]}>
          <Text style={[styles.kpiVal, { color: colors.neutral[800] }]}>{stats.studentCount}</Text>
          <Text style={styles.kpiLabel}>Students</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.warning[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.warning[700] }]}>{stats.repCount}</Text>
          <Text style={styles.kpiLabel}>Society Reps</Text>
        </View>
      </View>

      {/* Search & Filter Chips */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, email, UCL ID..."
          onClear={() => setSearchQuery('')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterChip
            label="All Roles"
            selected={roleFilter === 'all'}
            onPress={() => setRoleFilter('all')}
          />
          <FilterChip
            label="Students"
            selected={roleFilter === 'student'}
            onPress={() => setRoleFilter('student')}
          />
          <FilterChip
            label="Academic Staff"
            selected={roleFilter === 'academic_staff'}
            onPress={() => setRoleFilter('academic_staff')}
          />
          <FilterChip
            label="Society Reps"
            selected={roleFilter === 'society_rep'}
            onPress={() => setRoleFilter('society_rep')}
          />
          <FilterChip
            label="Admins"
            selected={roleFilter === 'admin'}
            onPress={() => setRoleFilter('admin')}
          />
        </ScrollView>
      </View>

      {/* User Table List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredUsers.length === 0 ? (
          <EmptyState
            iconText="👥"
            title="No Users Found"
            description="No user accounts match your search or role filter."
          />
        ) : (
          filteredUsers.map((user) => {
            const isSuspended = user.status === 'suspended';
            const roleMeta = ALL_ROLES.find((r) => r.role === user.role);

            return (
              <TouchableOpacity
                key={user.id}
                style={[styles.userRowCard, isSuspended && styles.userRowSuspended]}
                onPress={() => handleOpenEditModal(user)}
                activeOpacity={0.7}
              >
                <View style={styles.userRowHeader}>
                  <View style={styles.nameBlock}>
                    <Text style={styles.userName}>{user.displayName}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                  <View style={styles.tierBadge}>
                    <Text style={styles.tierText}>Tier {roleMeta?.tier || 2}</Text>
                  </View>
                </View>

                <View style={styles.userMetaRow}>
                  <StatusBadge
                    status={
                      user.role === 'super_admin' || user.role === 'admin'
                        ? 'critical'
                        : user.role === 'academic_staff' || user.role === 'manager'
                        ? 'primary'
                        : 'neutral'
                    }
                    label={user.role.replace(/_/g, ' ').toUpperCase()}
                  />

                  {user.studentId && (
                    <Text style={styles.studentIdText}>ID: {user.studentId}</Text>
                  )}
                  {user.department && (
                    <Text style={styles.deptText}>Dept: {user.department}</Text>
                  )}

                  <StatusBadge
                    status={user.status === 'active' ? 'success' : 'critical'}
                    label={user.status.toUpperCase()}
                  />
                </View>

                <View style={styles.userCardFooter}>
                  <Text style={styles.cohortInfo}>
                    {user.faculty ? `${user.faculty} · ${user.programme || ''} Year ${user.yearGroup || ''}` : 'Administrative Cohort'}
                  </Text>
                  <Text style={styles.editActionText}>Modify Role →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Edit User Role Modal */}
      <Modal
        visible={!!selectedUser}
        title="Edit User Role & Permissions"
        onClose={() => setSelectedUser(null)}
      >
        {selectedUser && (
          <View style={styles.modalContent}>
            <Text style={styles.modalUserName}>{selectedUser.displayName}</Text>
            <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>

            <Text style={styles.modalSectionLabel}>ASSIGN PRIVILEGE TIER (BR12):</Text>
            <ScrollView style={styles.rolePickerScroll} showsVerticalScrollIndicator={false}>
              {ALL_ROLES.map((r) => (
                <TouchableOpacity
                  key={r.role}
                  style={[
                    styles.roleOption,
                    targetRole === r.role && styles.roleOptionActive,
                  ]}
                  onPress={() => setTargetRole(r.role)}
                >
                  <View style={styles.roleOptionTextCol}>
                    <Text
                      style={[
                        styles.roleOptionLabel,
                        targetRole === r.role && styles.roleOptionLabelActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                    <Text style={styles.roleOptionTier}>Tier Rank {r.tier}</Text>
                  </View>
                  {targetRole === r.role && (
                    <Text style={styles.checkIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.modalSectionLabel, { marginTop: spacing[3] }]}>
              ACCOUNT STATUS:
            </Text>
            <View style={styles.statusToggleRow}>
              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  targetStatus === 'active' && styles.statusToggleActive,
                ]}
                onPress={() => setTargetStatus('active')}
              >
                <Text
                  style={[
                    styles.statusToggleText,
                    targetStatus === 'active' && styles.statusToggleTextActive,
                  ]}
                >
                  🟢 Active
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  targetStatus === 'suspended' && styles.statusToggleSuspended,
                ]}
                onPress={() => setTargetStatus('suspended')}
              >
                <Text
                  style={[
                    styles.statusToggleText,
                    targetStatus === 'suspended' && styles.statusToggleTextSuspended,
                  ]}
                >
                  🔴 Suspended
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setSelectedUser(null)}
                style={{ flex: 1 }}
              />
              <Button
                title={isUpdating ? 'Saving...' : 'Save Privileges'}
                variant="primary"
                size="md"
                onPress={handleSaveUserChanges}
                disabled={isUpdating}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        )}
      </Modal>
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
  unauthBox: {
    margin: spacing[4],
    padding: spacing[6],
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  unauthEmoji: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  unauthTitle: {
    ...typography.headlineSm,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  unauthDesc: {
    ...typography.bodySm,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    gap: spacing[2],
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
  },
  kpiVal: {
    ...typography.headlineSm,
    fontWeight: '800',
  },
  kpiLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral[500],
    marginTop: 2,
  },
  searchSection: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterScroll: {
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
    gap: spacing[3],
  },
  userRowCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  userRowSuspended: {
    backgroundColor: colors.neutral[100],
    opacity: 0.7,
  },
  userRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  nameBlock: {
    flex: 1,
  },
  userName: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  userEmail: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  tierBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  tierText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[2],
    paddingVertical: spacing[1.5],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    marginBottom: spacing[1.5],
  },
  studentIdText: {
    ...typography.caption,
    fontFamily: 'monospace',
    color: colors.neutral[700],
  },
  deptText: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  userCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  cohortInfo: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  editActionText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[600],
  },
  modalContent: {
    paddingTop: spacing[1],
  },
  modalUserName: {
    ...typography.headlineSm,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  modalUserEmail: {
    ...typography.caption,
    color: colors.neutral[500],
    marginBottom: spacing[3],
  },
  modalSectionLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[700],
    letterSpacing: 0.5,
    marginBottom: spacing[2],
  },
  rolePickerScroll: {
    maxHeight: 180,
    marginBottom: spacing[2],
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[2.5],
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing[1.5],
  },
  roleOptionActive: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  roleOptionTextCol: {
    flex: 1,
  },
  roleOptionLabel: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  roleOptionLabelActive: {
    color: colors.primary[900],
    fontWeight: '700',
  },
  roleOptionTier: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
  },
  checkIcon: {
    fontSize: 16,
    color: colors.primary[600],
    fontWeight: '800',
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  statusToggleBtn: {
    flex: 1,
    paddingVertical: spacing[2.5],
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statusToggleActive: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[600],
  },
  statusToggleSuspended: {
    backgroundColor: colors.critical[50],
    borderColor: colors.critical[600],
  },
  statusToggleText: {
    ...typography.labelSm,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  statusToggleTextActive: {
    color: colors.success[700],
    fontWeight: '700',
  },
  statusToggleTextSuspended: {
    color: colors.critical[700],
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
});
