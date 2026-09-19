import React from 'react';
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

export const EventDetailScreen: React.FC = () => {
  const { params, contents, toggleEventInterest, goBack } = useNavigation();

  const eventId = params?.eventId || 'cnt_evt1';
  const event = contents.find((c) => c.id === eventId) || contents[0];

  const isInterested = event.viewer?.interested || false;

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
        <Text style={styles.backText}>← Back to Events</Text>
      </TouchableOpacity>

      <Card padding="lg" style={styles.mainCard}>
        {/* Verification & Type */}
        <View style={styles.badgeRow}>
          <StatusBadge
            label={event.origin === 'official' ? 'OFFICIAL UNIVERSITY EVENT' : 'SOCIETY EVENT'}
            variant={event.origin === 'official' ? 'verified' : 'neutral'}
          />
          <StatusBadge
            label={event.category.toUpperCase()}
            variant="academic"
            style={styles.categoryBadge}
          />
        </View>

        <Text style={styles.title}>{event.title}</Text>

        {/* Date, Time, Venue Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time:</Text>
            <Text style={styles.infoValue}>
              Thursday 24 September 2026 · 10:00 AM – 02:00 PM
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Venue:</Text>
            <Text style={styles.infoValue}>
              {event.venue || 'Universal College Lanka — Main Quad'}
            </Text>
          </View>
          {event.capacity && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Capacity:</Text>
              <Text style={styles.infoValue}>{event.capacity} seats</Text>
            </View>
          )}
        </View>

        {/* Organiser Trust Line */}
        <View style={styles.trustBox}>
          <Text style={styles.trustText}>
            Organised by <Text style={styles.bold}>{event.source.department}</Text>
          </Text>
          <Text style={styles.trustMeta}>
            Host: {event.author.name} · Verified Student Affairs
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descBox}>
          <Text style={styles.descHeading}>ABOUT THIS HAPPENING</Text>
          <Text style={styles.bodyText}>{event.body}</Text>
        </View>

        {/* Guest Lecture Speaker Details if available */}
        {event.type === 'guest_lecture' && event.details?.speaker && (
          <View style={styles.speakerBox}>
            <Text style={styles.speakerHeader}>FEATURED KEYNOTE SPEAKER</Text>
            <Text style={styles.speakerName}>{event.details.speaker}</Text>
            <Text style={styles.speakerTitle}>{event.details.speakerTitle}</Text>
          </View>
        )}

        {/* Interactive RSVP Action Button (BR4) */}
        <View style={styles.rsvpSection}>
          <View style={styles.rsvpCountRow}>
            <Text style={styles.rsvpCountText}>
              <Text style={styles.rsvpCountNum}>{event.interestedCount}</Text> student{event.interestedCount === 1 ? '' : 's'} attending / interested
            </Text>
            {isInterested && (
              <StatusBadge label="RSVP CONFIRMED" variant="active" />
            )}
          </View>

          <Button
            title={isInterested ? "✓ You're Interested (Tap to cancel RSVP)" : "★ I'm Interested / Going (RSVP)"}
            onPress={() => toggleEventInterest(event.id)}
            variant={isInterested ? 'secondary' : 'primary'}
            fullWidth
            style={styles.rsvpBtn}
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
  infoBox: {
    backgroundColor: colors.neutral.surfaceAlt,
    borderRadius: radius.control,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 90,
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.textSecondary,
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.text,
  },
  trustBox: {
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.border,
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.control,
    marginBottom: spacing.md,
  },
  trustText: {
    fontSize: 13,
    color: colors.neutral.text,
  },
  bold: {
    fontWeight: '700',
  },
  trustMeta: {
    fontSize: 12,
    color: colors.primary.DEFAULT,
    marginTop: 2,
    fontWeight: '500',
  },
  descBox: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  descHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.neutral.text,
  },
  speakerBox: {
    backgroundColor: colors.neutral.surfaceAlt,
    borderRadius: radius.control,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3.5,
    borderLeftColor: colors.primary.DEFAULT,
  },
  speakerHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  speakerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral.text,
  },
  speakerTitle: {
    fontSize: 12,
    color: colors.neutral.textSecondary,
    marginTop: 1,
  },
  rsvpSection: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingTop: spacing.md,
  },
  rsvpCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rsvpCountText: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
  },
  rsvpCountNum: {
    fontWeight: '800',
    color: colors.neutral.text,
  },
  rsvpBtn: {
    marginTop: spacing.xs,
  },
});
