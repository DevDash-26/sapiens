import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert as NativeAlert,
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
import { Staff } from '../../types/contract';

const DEPARTMENTS = [
  'all',
  'Faculty of Computing',
  'Faculty of Business',
  'Faculty of Engineering',
  'Student Affairs',
  'Registrar Office',
  'Examination Unit',
];

export const StaffDirectoryManagementScreen: React.FC = () => {
  const { goBack, staff, createStaff, updateStaff, deleteStaff } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeStaff, setActiveStaff] = useState<Staff | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDept, setFormDept] = useState('Faculty of Computing');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formOffice, setFormOffice] = useState('');
  const [formHours, setFormHours] = useState('Mon–Fri 09:00–16:00');
  const [formTopics, setFormTopics] = useState('');

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchesDept = selectedDept === 'all' || s.department === selectedDept;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDept && matchesSearch;
    });
  }, [staff, selectedDept, searchQuery]);

  const handleOpenCreate = () => {
    setActiveStaff(null);
    setFormName('');
    setFormTitle('');
    setFormDept('Faculty of Computing');
    setFormEmail('');
    setFormPhone('+94112223344');
    setFormOffice('Admin Block, Room 10');
    setFormHours('Mon–Thu 10:00–15:00');
    setFormTopics('Algorithms, Final Year Project, Mentorship');
    setModalMode('create');
  };

  const handleOpenEdit = (member: Staff) => {
    setActiveStaff(member);
    setFormName(member.name);
    setFormTitle(member.title);
    setFormDept(member.department);
    setFormEmail(member.email);
    setFormPhone(member.phone);
    setFormOffice(member.office);
    setFormHours(member.officeHours);
    setFormTopics(member.topics.join(', '));
    setModalMode('edit');
  };

  const handleSave = () => {
    if (!formName.trim() || !formTitle.trim() || !formEmail.trim()) {
      NativeAlert.alert('Incomplete Profile', 'Please provide staff name, designation title, and official email.');
      return;
    }

    const topicList = formTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (modalMode === 'create') {
      createStaff({
        name: formName.trim(),
        title: formTitle.trim(),
        department: formDept,
        email: formEmail.trim(),
        phone: formPhone.trim(),
        office: formOffice.trim(),
        officeHours: formHours.trim(),
        topics: topicList,
        status: 'active',
      });
    } else if (modalMode === 'edit' && activeStaff) {
      updateStaff(activeStaff.id, {
        name: formName.trim(),
        title: formTitle.trim(),
        department: formDept,
        email: formEmail.trim(),
        phone: formPhone.trim(),
        office: formOffice.trim(),
        officeHours: formHours.trim(),
        topics: topicList,
      });
    }

    setModalMode(null);
  };

  const handleDelete = (staffId: string) => {
    deleteStaff(staffId);
    setModalMode(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Action Strip */}
      <View style={styles.actionStrip}>
        <View style={styles.actionStripLeft}>
          <Text style={styles.actionStripTitle}>Staff Directory Admin</Text>
          <Text style={styles.actionStripSub}>Faculty roster, designations & office hours</Text>
        </View>
        <TouchableOpacity
          style={styles.actionStripBtn}
          onPress={handleOpenCreate}
          activeOpacity={0.8}
        >
          <Text style={styles.actionStripBtnText}>+ Add Staff</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Department Filters */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, title, topics..."
          onClear={() => setSearchQuery('')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {DEPARTMENTS.map((dept) => (
            <FilterChip
              key={dept}
              label={dept === 'all' ? 'All Departments' : dept}
              selected={selectedDept === dept}
              onPress={() => setSelectedDept(dept)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Staff Roster Cards */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredStaff.length === 0 ? (
          <EmptyState
            iconText="👨‍🏫"
            title="No Staff Profiles Found"
            description="No directory profiles match your query or department filter."
          />
        ) : (
          filteredStaff.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.card}
              onPress={() => handleOpenEdit(member)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarEmoji}>🎓</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.staffName}>{member.name}</Text>
                  <Text style={styles.staffTitle}>{member.title}</Text>
                  <Text style={styles.staffDept}>{member.department}</Text>
                </View>
                <StatusBadge
                  status={member.status === 'active' ? 'success' : 'neutral'}
                  label={member.status.toUpperCase()}
                />
              </View>

              <View style={styles.contactDetailsBox}>
                <Text style={styles.contactRow}>📍 {member.office}</Text>
                <Text style={styles.contactRow}>⏱️ {member.officeHours}</Text>
                <Text style={styles.contactRow}>✉️ {member.email} · 📞 {member.phone}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.topicTags} numberOfLines={1}>
                  🏷️ {member.topics.join(' · ')}
                </Text>
                <Text style={styles.editAction}>Edit Profile →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Profile Modal */}
      <Modal
        visible={!!modalMode}
        title={modalMode === 'create' ? 'Add Staff Member' : 'Edit Staff Profile'}
        onClose={() => setModalMode(null)}
      >
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.fieldLabel}>FULL NAME & TITLE *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dr. Kasun Silva"
            value={formName}
            onChangeText={setFormName}
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing[2.5] }]}>DESIGNATION / ROLE *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Senior Lecturer / Head of Computing"
            value={formTitle}
            onChangeText={setFormTitle}
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing[2.5] }]}>FACULTY / DEPARTMENT</Text>
          <View style={styles.deptPickerCol}>
            {[
              'Faculty of Computing',
              'Faculty of Business',
              'Faculty of Engineering',
              'Student Affairs',
              'Registrar Office',
            ].map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.deptOption,
                  formDept === d && styles.deptOptionActive,
                ]}
                onPress={() => setFormDept(d)}
              >
                <Text
                  style={[
                    styles.deptOptionText,
                    formDept === d && styles.deptOptionTextActive,
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { marginTop: spacing[2.5] }]}>OFFICIAL EMAIL *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. kasun.s@ucl.demo"
            value={formEmail}
            onChangeText={setFormEmail}
            keyboardType="email-address"
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing[2.5] }]}>DIRECT PHONE</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +94112223344"
            value={formPhone}
            onChangeText={setFormPhone}
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing[2.5] }]}>CAMPUS OFFICE LOCATION</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Block B, Room 302"
            value={formOffice}
            onChangeText={setFormOffice}
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing[2.5] }]}>STUDENT CONSULTING HOURS</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mon & Wed 14:00–16:00"
            value={formHours}
            onChangeText={setFormHours}
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing[2.5] }]}>
            TOPIC TAGS (COMMA SEPARATED)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Algorithms, Cloud Computing, Project Guidance"
            value={formTopics}
            onChangeText={setFormTopics}
          />

          <View style={styles.modalBtnRow}>
            {modalMode === 'edit' && activeStaff && (
              <Button
                title="Delete"
                variant="outline"
                size="md"
                onPress={() => handleDelete(activeStaff.id)}
                style={{ flex: 1, borderColor: colors.critical[500] }}
              />
            )}
            <Button
              title="Cancel"
              variant="outline"
              size="md"
              onPress={() => setModalMode(null)}
              style={{ flex: 1 }}
            />
            <Button
              title="Save Profile"
              variant="primary"
              size="md"
              onPress={handleSave}
              style={{ flex: 1.5 }}
            />
          </View>
        </ScrollView>
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
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2.5],
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  actionStripLeft: {
    flex: 1,
    marginRight: spacing[2],
  },
  actionStripTitle: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: 2,
  },
  actionStripSub: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  actionStripBtn: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
  },
  actionStripBtnText: {
    ...typography.caption,
    color: '#ffffff',
    fontWeight: '700',
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
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatarEmoji: {
    fontSize: 20,
  },
  infoCol: {
    flex: 1,
  },
  staffName: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  staffTitle: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '600',
  },
  staffDept: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
  },
  contactDetailsBox: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: spacing[2.5],
    marginBottom: spacing[2],
    gap: 3,
  },
  contactRow: {
    ...typography.caption,
    fontSize: 11,
    color: colors.neutral[700],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[1.5],
  },
  topicTags: {
    ...typography.caption,
    color: colors.neutral[500],
    fontSize: 10,
    flex: 1,
    marginRight: spacing[2],
  },
  editAction: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[600],
  },
  modalScroll: {
    maxHeight: 440,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[700],
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  input: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[2.5],
    ...typography.bodySm,
    color: colors.neutral[900],
  },
  deptPickerCol: {
    gap: spacing[1.5],
  },
  deptOption: {
    padding: spacing[2],
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  deptOptionActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  deptOptionText: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  deptOptionTextActive: {
    color: colors.primary[700],
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
});
