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
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { useNavigation } from '../../contexts/NavigationContext';

export const AnnouncementDetailScreen: React.FC = () => {
  const { params, contents, goBack } = useNavigation();
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const announcementId = params?.announcementId || 'cnt_a1b2c3';
  const item = contents.find((c) => c.id === announcementId) || contents[0];

  const handleDownload = (filename: string) => {
    setDownloadFeedback(`Simulated download: ${filename}`);
    setTimeout(() => setDownloadFeedback(null), 2500);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={goBack}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>← Back to Notices</Text>
      </TouchableOpacity>

      <Card padding="lg" style={styles.mainCard}>
        {/* Verification & Category Badge */}
        <View style={styles.badgeRow}>
          <StatusBadge
            label={item.source.verified ? 'OFFICIALLY VERIFIED' : 'STUDENT NOTICE'}
            variant={item.source.verified ? 'verified' : 'neutral'}
          />
          <StatusBadge
            label={item.category.toUpperCase()}
            variant="neutral"
            style={styles.categoryBadge}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{item.title}</Text>

        {/* Author / Department Meta Trust Line (BR2 Trust thesis) */}
        <View style={styles.trustBox}>
          <Text style={styles.trustAuthor}>
            Published by <Text style={styles.boldText}>{item.source.department}</Text>
          </Text>
          <Text style={styles.trustMeta}>
            Author: {item.author.name} · Updated 19 Sep 2026, 10:30 AM
          </Text>
        </View>

        {/* Audience Scope Tags */}
        <View style={styles.audienceBox}>
          <Text style={styles.audienceLabel}>AUDIENCE SCOPE:</Text>
          <Text style={styles.audienceValue}>
            {item.audience.all
              ? 'University-wide (All students and faculty)'
              : `Faculties: ${item.audience.faculties.join(', ') || 'All'} | Programmes: ${item.audience.programmes.join(', ') || 'All'} | Year: ${item.audience.years.join(', ') || 'All'}`}
          </Text>
        </View>

        {/* Body Text */}
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyText}>{item.body}</Text>
        </View>

        {/* Attachments Section */}
        <View style={styles.attachmentSection}>
          <Text style={styles.attachmentHeader}>OFFICIAL ATTACHMENTS</Text>
          <TouchableOpacity
            style={styles.attachmentRow}
            onPress={() => handleDownload('UCL_Lab_Relocation_Schedule.pdf')}
            activeOpacity={0.7}
          >
            <View style={styles.pdfIcon}>
              <Text style={styles.pdfIconText}>PDF</Text>
            </View>
            <View style={styles.attachmentMeta}>
              <Text style={styles.attachmentName}>
                UCL_Notice_Protocol_v2.pdf
              </Text>
              <Text style={styles.attachmentSize}>1.2 MB · Verified Document</Text>
            </View>
            <Text style={styles.downloadAction}>Download</Text>
          </TouchableOpacity>
        </View>

        {downloadFeedback && (
          <View style={styles.feedbackToast}>
            <Text style={styles.feedbackToastText}>{downloadFeedback}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Button
            title="Share via WhatsApp"
            onPress={() => setDownloadFeedback('Link copied: ' + item.shareUrl)}
            variant="outline"
            style={styles.shareBtn}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },
  mainCard: {
    backgroundColor: colors.neutral.white,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.neutral.text,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  trustBox: {
    backgroundColor: colors.neutral.surfaceAlt,
    borderLeftWidth: 3.5,
    borderLeftColor: colors.primary.DEFAULT,
    padding: spacing.md,
    borderRadius: radius.control,
    marginBottom: spacing.md,
  },
  trustAuthor: {
    fontSize: 13,
    color: colors.neutral.text,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
  },
  trustMeta: {
    fontSize: 12,
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
  audienceBox: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.control,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  audienceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral.textMuted,
    letterSpacing: 0.5,
  },
  audienceValue: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  bodyContainer: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    marginBottom: spacing.lg,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.neutral.text,
  },
  attachmentSection: {
    marginBottom: spacing.lg,
  },
  attachmentHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs + 2,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
    borderRadius: radius.control,
  },
  pdfIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.control,
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  pdfIconText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontWeight: '800',
  },
  attachmentMeta: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral.text,
  },
  attachmentSize: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 1,
  },
  downloadAction: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
    marginLeft: spacing.sm,
  },
  feedbackToast: {
    backgroundColor: '#0f172a',
    borderRadius: radius.control,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  feedbackToastText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    marginTop: spacing.xs,
  },
  shareBtn: {
    width: '100%',
  },
});
