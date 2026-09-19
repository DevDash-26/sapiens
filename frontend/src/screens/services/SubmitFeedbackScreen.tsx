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

type FeedbackKind = 'suggestion' | 'question' | 'complaint' | 'content_correction';

const FEEDBACK_KINDS: Array<{ id: FeedbackKind; label: string; desc: string; icon: string }> = [
  {
    id: 'suggestion',
    label: 'Campus Suggestion',
    desc: 'Ideas to improve facilities, schedules, or student services',
    icon: '💡',
  },
  {
    id: 'question',
    label: 'Inquiry / Question',
    desc: 'Ask about university policies, procedures, or deadlines',
    icon: '❓',
  },
  {
    id: 'complaint',
    label: 'Grievance / Issue',
    desc: 'Raise a concern requiring administrative attention',
    icon: '⚠️',
  },
  {
    id: 'content_correction',
    label: 'Notice / Info Correction',
    desc: 'Report inaccurate or outdated information on the hub',
    icon: '✏️',
  },
];

export const SubmitFeedbackScreen: React.FC = () => {
  const { goBack, navigate, createRequest } = useNavigation();

  const [kind, setKind] = useState<FeedbackKind>('suggestion');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [contactBack, setContactBack] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = () => {
    setError(null);
    if (!title.trim()) {
      setError('Please provide a subject line or topic.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter your feedback or inquiry message.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      createRequest({
        type: 'feedback',
        status: 'open',
        visibility: 'private',
        title: title.trim(),
        description: message.trim(),
        imageUrls: [],
        location: null,
        occurredAt: null,
        data: {
          kind,
          anonymous: isAnonymous,
          relatedContentId: null,
        },
        verificationHint: null,
        handoverNote: null,
        assigneeUid: 'usr_admin_01',
        resolution: null,
      });

      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Header title="Feedback Submitted" showBack onBack={goBack} />
        <View style={styles.successContent}>
          <View style={styles.successIconBox}>
            <Text style={styles.successEmoji}>📬</Text>
          </View>
          <Text style={styles.successTitle}>Thank You for Your Voice</Text>
          <Text style={styles.successBody}>
            Your {FEEDBACK_KINDS.find((k) => k.id === kind)?.label.toLowerCase()} has been delivered to the Student Affairs & Quality Assurance desk.
          </Text>

          <View style={styles.ticketSummaryBox}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Type:</Text>
              <Text style={styles.ticketValue}>{FEEDBACK_KINDS.find((k) => k.id === kind)?.label}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Identity:</Text>
              <Text style={styles.ticketValue}>{isAnonymous ? 'Anonymous' : 'Verified Student'}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Status:</Text>
              <Text style={styles.ticketValue}>Queued for Staff Review</Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <Button
              title="View in My Requests"
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
        title="Submit Feedback / Question"
        showBack
        onBack={goBack}
        rightAction={{
          label: 'History',
          onPress: () => navigate('my_requests'),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Header */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>Student Voice & Quality Feedback</Text>
          <Text style={styles.infoBannerText}>
            Feedback is reviewed regularly by UCL management to improve academic life and student support.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Category / Kind */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback Category</Text>
          <View style={styles.kindGrid}>
            {FEEDBACK_KINDS.map((item) => {
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

        {/* Anonymous Toggle Option */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.toggleCard, isAnonymous && styles.toggleCardActive]}
            onPress={() => setIsAnonymous(!isAnonymous)}
            activeOpacity={0.8}
          >
            <View style={styles.checkbox}>
              <Text style={styles.checkboxIcon}>{isAnonymous ? '☑' : '☐'}</Text>
            </View>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Submit Anonymously</Text>
              <Text style={styles.toggleSubtitle}>
                Your name and student ID will be hidden from staff review.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <FormField
          label="Subject / Topic"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Extended Library Hours for Exam Revision"
        />

        {/* Message */}
        <FormField
          label="Detailed Message / Feedback"
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your suggestion, concern, or question in detail..."
          multiline
          numberOfLines={5}
        />

        {/* Contact back toggle */}
        {!isAnonymous && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setContactBack(!contactBack)}
              activeOpacity={0.8}
            >
              <Text style={styles.checkboxIcon}>{contactBack ? '☑' : '☐'}</Text>
              <Text style={styles.toggleRowText}>
                I would like an email reply from the coordinator regarding this submission.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Submit */}
        <View style={styles.actionContainer}>
          <Button
            title={loading ? 'Submitting...' : 'Send Feedback to UCL'}
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
  infoBanner: {
    backgroundColor: colors.primary[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
    borderRadius: radius.md,
    padding: spacing[3.5],
    marginBottom: spacing[4],
  },
  infoBannerTitle: {
    ...typography.labelSm,
    color: colors.primary[900],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  infoBannerText: {
    ...typography.bodySm,
    color: colors.primary[800],
    lineHeight: 18,
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
  kindGrid: {
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
    fontSize: 24,
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
  toggleCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3.5],
    alignItems: 'center',
  },
  toggleCardActive: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  checkbox: {
    marginRight: spacing[3],
  },
  checkboxIcon: {
    fontSize: 20,
    color: colors.primary[700],
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  toggleSubtitle: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: spacing[0.5],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  toggleRowText: {
    ...typography.bodySm,
    color: colors.neutral[700],
    marginLeft: spacing[2],
    flex: 1,
  },
  actionContainer: {
    marginTop: spacing[3],
  },
  // Success state
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
