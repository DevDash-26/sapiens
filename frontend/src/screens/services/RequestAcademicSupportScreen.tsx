import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, Button, FormField } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

type AcademicKind = 'study_group' | 'peer_tutoring' | 'mentorship';
type AcademicDirection = 'request' | 'offer';

const KINDS: Array<{ id: AcademicKind; label: string; desc: string; icon: string }> = [
  {
    id: 'study_group',
    label: 'Study Group Formation',
    desc: 'Collaborate with cohort peers for revision & assignments',
    icon: '👥',
  },
  {
    id: 'peer_tutoring',
    label: '1-on-1 Peer Tutoring',
    desc: 'Structured tutoring on specific course topics & code labs',
    icon: '🧑‍🏫',
  },
  {
    id: 'mentorship',
    label: 'Senior Peer Mentorship',
    desc: 'Guidance on degree pathways, electives, and career prep',
    icon: '🌟',
  },
];

const COMMON_COURSES = ['MA101', 'CS102', 'SE201', 'CS202', 'SE301', 'BBA101', 'ENG101'];

export const RequestAcademicSupportScreen: React.FC = () => {
  const { goBack, navigate, createRequest } = useNavigation();

  const [direction, setDirection] = useState<AcademicDirection>('request');
  const [kind, setKind] = useState<AcademicKind>('study_group');
  const [courseCode, setCourseCode] = useState<string>('SE201');
  const [customCourse, setCustomCourse] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [preferredTimes, setPreferredTimes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const activeCourse = customCourse.trim() ? customCourse.trim().toUpperCase() : courseCode;

  const handleSubmit = () => {
    setError(null);
    if (!title.trim()) {
      setError('Please provide a brief title or summary of your request.');
      return;
    }
    if (!activeCourse) {
      setError('Please select or specify a valid Course / Module Code.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide details on what topics you need help with or plan to cover.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      createRequest({
        type: 'academic_support',
        status: 'open',
        visibility: direction === 'offer' ? 'public' : 'private',
        title: title.trim(),
        description: description.trim(),
        imageUrls: [],
        location: 'UCL Library / Online Zoom',
        occurredAt: null,
        data: {
          kind,
          direction,
          courseCode: activeCourse,
          preferredTimes: preferredTimes.trim() || 'Flexible / After lectures',
        },
        verificationHint: null,
        handoverNote: null,
        assigneeUid: 'usr_acad_01',
        resolution: null,
      });

      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Header title="Request Submitted" showBack onBack={goBack} />
        <View style={styles.successContent}>
          <View style={styles.successIconBox}>
            <Text style={styles.successEmoji}>🎓</Text>
          </View>
          <Text style={styles.successTitle}>
            {direction === 'offer' ? 'Peer Support Offer Listed' : 'Academic Request Logged'}
          </Text>
          <Text style={styles.successBody}>
            {direction === 'offer'
              ? `Your offer to tutor/mentor for ${activeCourse} is active and routed to the Academic Support Office for accreditation.`
              : `Your request for ${activeCourse} (${KINDS.find((k) => k.id === kind)?.label}) has been sent to the Faculty Academic Advising Coordinator.`}
          </Text>

          <View style={styles.ticketSummaryBox}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Type:</Text>
              <Text style={styles.ticketValue}>{KINDS.find((k) => k.id === kind)?.label}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Module:</Text>
              <Text style={styles.ticketValue}>{activeCourse}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Availability:</Text>
              <Text style={styles.ticketValue}>{preferredTimes || 'Flexible'}</Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <Button
              title="Track in My Requests"
              variant="primary"
              size="lg"
              onPress={() => navigate('my_requests')}
              style={{ marginBottom: spacing[3] }}
            />
            <Button
              title="Return to Services Hub"
              variant="secondary"
              size="md"
              onPress={() => navigate('services_hub')}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Academic Support Hub"
        showBack
        onBack={goBack}
        rightAction={{
          label: 'My Requests',
          onPress: () => navigate('my_requests'),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Support Direction Segment (Seeking vs Offering) */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, direction === 'request' && styles.segmentBtnActive]}
            onPress={() => setDirection('request')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, direction === 'request' && styles.segmentTextActive]}>
              🙋 I Need Support
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, direction === 'offer' && styles.segmentBtnActive]}
            onPress={() => setDirection('offer')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, direction === 'offer' && styles.segmentTextActive]}>
              🤝 I Want to Mentor/Tutor
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Support Kind Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Program</Text>
          <View style={styles.kindList}>
            {KINDS.map((item) => {
              const isSelected = kind === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.kindCard, isSelected && styles.kindCardSelected]}
                  onPress={() => setKind(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.kindIcon}>{item.icon}</Text>
                  <View style={styles.kindInfo}>
                    <Text style={[styles.kindLabel, isSelected && styles.kindLabelSelected]}>
                      {item.label}
                    </Text>
                    <Text style={styles.kindDesc}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Course / Module Code Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Course / Module</Text>
          <View style={styles.courseChipRow}>
            {COMMON_COURSES.map((code) => {
              const isSelected = courseCode === code && !customCourse;
              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.courseChip, isSelected && styles.courseChipSelected]}
                  onPress={() => {
                    setCourseCode(code);
                    setCustomCourse('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.courseChipText, isSelected && styles.courseChipTextSelected]}>
                    {code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <FormField
            label="Or enter custom course code"
            value={customCourse}
            onChangeText={setCustomCourse}
            placeholder="e.g. CS305, BA201, BIO101"
            containerStyle={{ marginTop: spacing[2] }}
          />
        </View>

        {/* Title */}
        <FormField
          label={direction === 'offer' ? 'Tutoring Offer Title' : 'Request Headline'}
          value={title}
          onChangeText={setTitle}
          placeholder={
            direction === 'offer'
              ? 'e.g. Free 1-on-1 SE201 Design Patterns Tutoring'
              : 'e.g. Need help with Graph Algorithms & Recursion'
          }
        />

        {/* Detailed Description */}
        <FormField
          label={direction === 'offer' ? 'Your Background & Topics You Can Cover' : 'Specific Topics / Areas of Need'}
          value={description}
          onChangeText={setDescription}
          placeholder="Detail the concepts, past papers, or lab questions you'd like to focus on..."
          multiline
          numberOfLines={4}
        />

        {/* Preferred Times / Availability */}
        <FormField
          label="Preferred Days & Availability"
          value={preferredTimes}
          onChangeText={setPreferredTimes}
          placeholder="e.g. Tuesday & Thursday afternoons after 4:00 PM, or Saturdays online"
          helper="Helps match you quickly with appropriate peer groups or mentors."
        />

        {/* Submit */}
        <View style={styles.actionContainer}>
          <Button
            title={loading ? 'Submitting...' : direction === 'offer' ? 'Publish Support Offer' : 'Submit Support Request'}
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={loading}
          />
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
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing[4],
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing[2.5],
    alignItems: 'center',
    borderRadius: radius.md - 2,
  },
  segmentBtnActive: {
    backgroundColor: colors.neutral[0],
  },
  segmentText: {
    ...typography.labelSm,
    color: colors.neutral[600],
  },
  segmentTextActive: {
    color: colors.neutral[900],
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: colors.critical[50],
    borderWidth: 1,
    borderColor: colors.critical[200],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    ...typography.bodySm,
    color: colors.critical[700],
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.labelSm,
    color: colors.neutral[800],
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  kindList: {
    gap: spacing[2.5],
  },
  kindCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3.5],
    alignItems: 'center',
  },
  kindCardSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  kindIcon: {
    fontSize: 26,
    marginRight: spacing[3],
  },
  kindInfo: {
    flex: 1,
  },
  kindLabel: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '600',
    marginBottom: spacing[0.5],
  },
  kindLabelSelected: {
    color: colors.primary[800],
    fontWeight: '700',
  },
  kindDesc: {
    ...typography.bodySm,
    color: colors.neutral[500],
    lineHeight: 18,
  },
  courseChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  courseChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.full,
  },
  courseChipSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  courseChipText: {
    ...typography.labelSm,
    color: colors.neutral[700],
  },
  courseChipTextSelected: {
    color: colors.neutral[0],
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: spacing[3],
  },
  // Success
  successContent: {
    flex: 1,
    padding: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  successEmoji: {
    fontSize: 34,
  },
  successTitle: {
    ...typography.headlineMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  successBody: {
    ...typography.bodyMd,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing[5],
    lineHeight: 22,
  },
  ticketSummaryBox: {
    width: '100%',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[1.5],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  ticketLabel: {
    ...typography.bodySm,
    color: colors.neutral[500],
  },
  ticketValue: {
    ...typography.labelSm,
    color: colors.neutral[800],
    fontWeight: '600',
  },
  successActions: {
    width: '100%',
  },
});
