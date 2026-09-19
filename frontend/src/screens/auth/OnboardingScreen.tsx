import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useNavigation } from '../../contexts/NavigationContext';
import { CAMPUS_META } from '../../constants/meta';
import { Faculty, Programme, YearGroup } from '../../types/contract';

export const OnboardingScreen: React.FC = () => {
  const { navigate, currentUser, setCurrentUser } = useNavigation();

  const [faculty, setFaculty] = useState<Faculty>(currentUser.faculty || 'FOC');
  const [programme, setProgramme] = useState<Programme>(
    currentUser.programme || 'BSC-SE'
  );
  const [yearGroup, setYearGroup] = useState<YearGroup>(currentUser.yearGroup || 2);
  const [loading, setLoading] = useState(false);

  // Available programmes for selected faculty
  const availableProgrammes = CAMPUS_META.programmes.filter(
    (p) => p.faculty === faculty
  );

  const handleFacultyChange = (newFaculty: Faculty) => {
    setFaculty(newFaculty);
    const prog = CAMPUS_META.programmes.find((p) => p.faculty === newFaculty);
    if (prog) {
      setProgramme(prog.id);
    }
  };

  const handleCompleteOnboarding = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentUser({
        ...currentUser,
        faculty,
        programme,
        yearGroup,
      });
      navigate('home');
    }, 500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepBadge}>Step 2 of 2 · Academic Profile</Text>
        <Text style={styles.title}>Target Your Campus Feed</Text>
        <Text style={styles.subtitle}>
          Select your faculty, degree programme, and current academic year to receive cohort-specific announcements, timetable notices, and exam alerts.
        </Text>
      </View>

      {/* Faculty Selection */}
      <Card style={styles.sectionCard} padding="md">
        <Text style={styles.sectionTitle}>1. Faculty</Text>
        <View style={styles.optionGrid}>
          {CAMPUS_META.faculties.map((f) => {
            const isSelected = faculty === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => handleFacultyChange(f.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionTitle,
                    isSelected && styles.optionTitleSelected,
                  ]}
                >
                  {f.shortName}
                </Text>
                <Text
                  style={[
                    styles.optionSub,
                    isSelected && styles.optionSubSelected,
                  ]}
                  numberOfLines={1}
                >
                  {f.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Programme Selection */}
      <Card style={styles.sectionCard} padding="md">
        <Text style={styles.sectionTitle}>2. Degree Programme</Text>
        <View style={styles.listOptions}>
          {availableProgrammes.map((p) => {
            const isSelected = programme === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.listOptionRow,
                  isSelected && styles.listOptionRowSelected,
                ]}
                onPress={() => setProgramme(p.id)}
                activeOpacity={0.7}
              >
                <View style={styles.radioCircle}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.programmeTextGroup}>
                  <Text
                    style={[
                      styles.programmeCode,
                      isSelected && styles.programmeCodeSelected,
                    ]}
                  >
                    {p.id}
                  </Text>
                  <Text style={styles.programmeName}>{p.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Year Group Selection */}
      <Card style={styles.sectionCard} padding="md">
        <Text style={styles.sectionTitle}>3. Academic Year</Text>
        <View style={styles.yearGrid}>
          {CAMPUS_META.yearGroups.map((yr) => {
            const isSelected = yearGroup === yr;
            return (
              <TouchableOpacity
                key={yr}
                style={[styles.yearChip, isSelected && styles.yearChipSelected]}
                onPress={() => setYearGroup(yr)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.yearText, isSelected && styles.yearTextSelected]}
                >
                  Year {yr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Button
        title={loading ? 'Saving preferences...' : 'Enter UCL Campus Hub'}
        onPress={handleCompleteOnboarding}
        loading={loading}
        fullWidth
        style={styles.continueBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.neutral.bg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  stepBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.neutral.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xs,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: spacing.sm,
  },
  optionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    padding: spacing.sm + 2,
    backgroundColor: colors.neutral.surfaceAlt,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
  },
  optionCardSelected: {
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.DEFAULT,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: colors.primary.DEFAULT,
  },
  optionSub: {
    fontSize: 11,
    color: colors.neutral.textMuted,
  },
  optionSubSelected: {
    color: colors.primary.dark,
  },
  listOptions: {
    gap: 8,
  },
  listOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    backgroundColor: colors.neutral.surfaceAlt,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
  },
  listOptionRowSelected: {
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.DEFAULT,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.neutral.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.DEFAULT,
  },
  programmeTextGroup: {
    flex: 1,
  },
  programmeCode: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral.text,
  },
  programmeCodeSelected: {
    color: colors.primary.DEFAULT,
  },
  programmeName: {
    fontSize: 12,
    color: colors.neutral.textMuted,
    marginTop: 1,
  },
  yearGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  yearChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surfaceAlt,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
  },
  yearChipSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  yearText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral.text,
  },
  yearTextSelected: {
    color: colors.neutral.white,
  },
  continueBtn: {
    marginTop: spacing.md,
  },
});
