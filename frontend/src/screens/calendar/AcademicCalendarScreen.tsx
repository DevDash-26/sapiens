import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FilterChip } from '../../components/common/FilterChip';
import { Card } from '../../components/common/Card';
import { useNavigation } from '../../contexts/NavigationContext';

interface CalendarEntry {
  id: string;
  month: string;
  day: string;
  title: string;
  category: 'exam' | 'deadline' | 'holiday' | 'semester';
  description: string;
  source: string;
}

const ACADEMIC_EVENTS: CalendarEntry[] = [
  {
    id: 'cal_01',
    month: 'SEP',
    day: '25',
    title: 'Binara Full Moon Poya Day (Public Holiday)',
    category: 'holiday',
    description: 'University closed in observance of national Poya holiday.',
    source: 'Registrar Office',
  },
  {
    id: 'cal_02',
    month: 'SEP',
    day: '30',
    title: 'Module Add/Drop & Elective Deadline',
    category: 'deadline',
    description: 'Last day to submit module adjustments without late penalty.',
    source: 'Academic Affairs',
  },
  {
    id: 'cal_03',
    month: 'OCT',
    day: '15',
    title: 'Mid-Semester Examinations Commence',
    category: 'exam',
    description: 'Written assessments begin across all computing and business cohorts.',
    source: 'Exam Unit',
  },
  {
    id: 'cal_04',
    month: 'OCT',
    day: '28',
    title: 'Mid-Semester Examination Period Concludes',
    category: 'exam',
    description: 'All invigilated mid-term papers wrap up.',
    source: 'Exam Unit',
  },
  {
    id: 'cal_05',
    month: 'NOV',
    day: '02',
    title: 'Semester 1 Reading & Project Week',
    category: 'semester',
    description: 'Dedicated week for coursework submissions and final project reviews.',
    source: 'Faculty Deans',
  },
];

export const AcademicCalendarScreen: React.FC = () => {
  const { navigate } = useNavigation();
  const [filter, setFilter] = useState<'all' | 'exam' | 'deadline' | 'holiday'>('all');

  const filteredEntries = ACADEMIC_EVENTS.filter((entry) => {
    if (filter === 'all') return true;
    return entry.category === filter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Academic Calendar</Text>
        <Text style={styles.subtitle}>
          Official UCL Semester 1 key dates, examination periods, and holidays.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterChip
            label="All Dates"
            count={ACADEMIC_EVENTS.length}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterChip
            label="Exams"
            active={filter === 'exam'}
            onPress={() => setFilter('exam')}
          />
          <FilterChip
            label="Deadlines"
            active={filter === 'deadline'}
            onPress={() => setFilter('deadline')}
          />
          <FilterChip
            label="Holidays"
            active={filter === 'holiday'}
            onPress={() => setFilter('holiday')}
          />
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Semester 1 Schedule (2026/2027)" />

        {filteredEntries.map((entry) => {
          const badgeVariant =
            entry.category === 'exam'
              ? 'critical'
              : entry.category === 'deadline'
              ? 'warning'
              : entry.category === 'holiday'
              ? 'verified'
              : 'academic';

          return (
            <Card key={entry.id} style={styles.dateCard} padding="md">
              <View style={styles.cardInner}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateMonth}>{entry.month}</Text>
                  <Text style={styles.dateDay}>{entry.day}</Text>
                </View>

                <View style={styles.contentGroup}>
                  <View style={styles.badgeRow}>
                    <StatusBadge
                      label={entry.category.toUpperCase()}
                      variant={badgeVariant}
                    />
                    <Text style={styles.sourceText}>{entry.source}</Text>
                  </View>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <Text style={styles.entryDesc}>{entry.description}</Text>
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  header: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.neutral.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.neutral.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  dateCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.neutral.white,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateBox: {
    width: 48,
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.border,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
    lineHeight: 20,
  },
  contentGroup: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sourceText: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    fontWeight: '500',
  },
  entryTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  entryDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.neutral.textSecondary,
  },
});
