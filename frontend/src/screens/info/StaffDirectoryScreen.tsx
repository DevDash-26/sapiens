import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, SearchBar, FilterChip, EmptyState, Button } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { Staff } from '../../types/contract';

const DEPARTMENTS = [
  'All Departments',
  'Student Wellbeing',
  'IT Services',
  'Faculty of Computing',
  'Registrar Office',
  'Facilities & Operations',
  'Finance Office',
];

export const StaffDirectoryScreen: React.FC = () => {
  const { goBack, navigate, staff } = useNavigation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');

  const filteredStaff = useMemo(() => {
    return staff.filter((person) => {
      if (selectedDept !== 'All Departments' && person.department !== selectedDept) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = person.name.toLowerCase().includes(q);
        const titleMatch = person.title.toLowerCase().includes(q);
        const deptMatch = person.department.toLowerCase().includes(q);
        const topicMatch = person.topics.some((t) => t.toLowerCase().includes(q));
        if (!nameMatch && !titleMatch && !deptMatch && !topicMatch) return false;
      }
      return true;
    });
  }, [staff, selectedDept, searchQuery]);

  return (
    <View style={styles.container}>
      <Header
        title="Staff & Department Directory"
        showBack
        onBack={goBack}
        rightAction={{
          label: 'AI Helper',
          onPress: () => navigate('ai_assistant'),
        }}
      />

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search staff name, designation, topic..."
          onClear={() => setSearchQuery('')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {DEPARTMENTS.map((dept) => (
            <FilterChip
              key={dept}
              label={dept}
              selected={selectedDept === dept}
              onPress={() => setSelectedDept(dept)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <Text style={styles.resultsCount}>
            {filteredStaff.length} {filteredStaff.length === 1 ? 'staff member' : 'staff members'} found
          </Text>
          <Text style={styles.consultationNote}>Official consultation hours & locations</Text>
        </View>

        {filteredStaff.length === 0 ? (
          <EmptyState
            title="No Staff Found"
            description="No directory entries match your search criteria. Try a different department or keyword."
            action={{
              label: 'Reset Filters',
              onPress: () => {
                setSelectedDept('All Departments');
                setSearchQuery('');
              },
            }}
          />
        ) : (
          filteredStaff.map((person) => {
            return (
              <View key={person.id} style={styles.staffCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {person.name
                        .replace('Dr. ', '')
                        .replace('Mr. ', '')
                        .replace('Ms. ', '')
                        .replace('Mrs. ', '')[0]}
                    </Text>
                  </View>

                  <View style={styles.mainDetails}>
                    <Text style={styles.staffName}>{person.name}</Text>
                    <Text style={styles.staffTitle}>{person.title}</Text>
                    <View style={styles.deptBadge}>
                      <Text style={styles.deptText}>{person.department}</Text>
                    </View>
                  </View>
                </View>

                {/* Office & Hours Box */}
                <View style={styles.officeBox}>
                  <View style={styles.officeRow}>
                    <Text style={styles.officeIcon}>📍</Text>
                    <Text style={styles.officeText}>Office: {person.office}</Text>
                  </View>
                  <View style={styles.officeRow}>
                    <Text style={styles.officeIcon}>⏰</Text>
                    <Text style={styles.officeText}>Hours: {person.officeHours}</Text>
                  </View>
                </View>

                {/* Topics of Consultation */}
                <View style={styles.topicsSection}>
                  <Text style={styles.topicsLabel}>Consultation Areas:</Text>
                  <View style={styles.topicsWrap}>
                    {person.topics.map((topic) => (
                      <View key={topic} style={styles.topicChip}>
                        <Text style={styles.topicText}>#{topic.replace('_', ' ')}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Contact Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => Linking.openURL(`mailto:${person.email}`)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.contactBtnIcon}>✉️</Text>
                    <Text style={styles.contactBtnText}>{person.email}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.contactBtn, styles.phoneBtn]}
                    onPress={() => Linking.openURL(`tel:${person.phone}`)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.contactBtnIcon}>📞</Text>
                    <Text style={styles.contactBtnText}>{person.phone}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
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
  filterSection: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  chipScroll: {
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  resultsCount: {
    ...typography.labelSm,
    color: colors.neutral[700],
    fontWeight: '700',
  },
  consultationNote: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  staffCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3.5],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    ...typography.headlineSm,
    color: colors.primary[800],
    fontWeight: '800',
  },
  mainDetails: {
    flex: 1,
  },
  staffName: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
  },
  staffTitle: {
    ...typography.bodySm,
    color: colors.neutral[600],
    marginTop: 1,
  },
  deptBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing[1],
  },
  deptText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  officeBox: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.sm,
    padding: spacing[2.5],
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  officeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officeIcon: {
    fontSize: 13,
    marginRight: spacing[2],
  },
  officeText: {
    ...typography.caption,
    color: colors.neutral[700],
  },
  topicsSection: {
    marginBottom: spacing[3],
  },
  topicsLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  topicsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
  },
  topicChip: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  topicText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary[800],
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[3],
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.sm,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
  },
  phoneBtn: {
    flex: 0.9,
  },
  contactBtnIcon: {
    fontSize: 12,
    marginRight: spacing[1],
  },
  contactBtnText: {
    ...typography.caption,
    color: colors.primary[800],
    fontWeight: '700',
    fontSize: 11,
  },
});
