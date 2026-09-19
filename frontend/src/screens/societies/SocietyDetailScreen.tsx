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
import { FormField } from '../../components/common/FormField';
import { useNavigation } from '../../contexts/NavigationContext';

export const SocietyDetailScreen: React.FC = () => {
  const { params, societies, joinSociety, goBack } = useNavigation();

  const societyId = params?.societyId || 'soc_robotics';
  const society = societies.find((s) => s.id === societyId) || societies[0];

  const [joinMessage, setJoinMessage] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const membershipStatus = society.viewer?.membership;

  const handleJoin = () => {
    joinSociety(society.id, joinMessage);
    setShowJoinModal(false);
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
        <Text style={styles.backText}>← Back to Societies</Text>
      </TouchableOpacity>

      <Card padding="lg" style={styles.mainCard}>
        {/* Verification Badge */}
        <View style={styles.badgeRow}>
          <StatusBadge
            label="REGISTERED UCL SOCIETY"
            variant="verified"
          />
          <StatusBadge
            label={society.category.toUpperCase()}
            variant="academic"
            style={styles.categoryBadge}
          />
        </View>

        <Text style={styles.title}>{society.name}</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{society.memberCount}</Text>
            <Text style={styles.statLabel}>Active Members</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>
              {society.joinMode === 'open' ? 'Instant' : 'Review'}
            </Text>
            <Text style={styles.statLabel}>Join Mode</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>Weekly</Text>
            <Text style={styles.statLabel}>Meet Frequency</Text>
          </View>
        </View>

        {/* Meeting & Contact Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoHeading}>MEETING SCHEDULE & LOCATION</Text>
          <Text style={styles.infoText}>{society.meetingInfo}</Text>

          <Text style={[styles.infoHeading, { marginTop: spacing.sm }]}>
            OFFICIAL CONTACT
          </Text>
          <Text style={styles.infoText}>
            Email: {society.contactEmail} · Instagram: {society.socials?.instagram || '@ucl_studentlife'}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descBox}>
          <Text style={styles.descHeading}>ABOUT THIS SOCIETY</Text>
          <Text style={styles.bodyText}>{society.description}</Text>
        </View>

        {/* Membership Action (BR6) */}
        <View style={styles.joinSection}>
          {membershipStatus === 'approved' ? (
            <View style={styles.memberStatusBox}>
              <Text style={styles.memberStatusText}>
                ✓ You are an active registered member of {society.name}
              </Text>
            </View>
          ) : membershipStatus === 'pending' ? (
            <View style={styles.pendingStatusBox}>
              <Text style={styles.pendingStatusText}>
                ⌛ Your join application is pending approval by the Society President.
              </Text>
            </View>
          ) : (
            <View>
              {society.joinMode === 'approval' && showJoinModal ? (
                <View style={styles.joinForm}>
                  <FormField
                    label="Application Note to Society Rep"
                    value={joinMessage}
                    onChangeText={setJoinMessage}
                    placeholder="Briefly state your interest (e.g. drone builds, AI coding)..."
                    multiline
                  />
                  <View style={styles.joinFormBtns}>
                    <Button
                      title="Submit Application"
                      onPress={handleJoin}
                      variant="primary"
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Cancel"
                      onPress={() => setShowJoinModal(false)}
                      variant="secondary"
                      style={{ marginLeft: spacing.sm }}
                    />
                  </View>
                </View>
              ) : (
                <Button
                  title={
                    society.joinMode === 'open'
                      ? 'Join Society (Instant)'
                      : 'Apply to Join Society'
                  }
                  onPress={() => {
                    if (society.joinMode === 'approval') {
                      setShowJoinModal(true);
                    } else {
                      handleJoin();
                    }
                  }}
                  variant="primary"
                  fullWidth
                />
              )}
            </View>
          )}
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
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.border,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary.dark,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: colors.neutral.surfaceAlt,
    borderRadius: radius.control,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
    marginBottom: spacing.md,
  },
  infoHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: colors.neutral.text,
    lineHeight: 18,
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
  joinSection: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingTop: spacing.md,
  },
  memberStatusBox: {
    backgroundColor: colors.status.success.bg,
    borderColor: colors.status.success.border,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: spacing.md,
    alignItems: 'center',
  },
  memberStatusText: {
    color: colors.status.success.text,
    fontSize: 13,
    fontWeight: '700',
  },
  pendingStatusBox: {
    backgroundColor: colors.status.warning.bg,
    borderColor: colors.status.warning.border,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: spacing.md,
    alignItems: 'center',
  },
  pendingStatusText: {
    color: colors.status.warning.text,
    fontSize: 13,
    fontWeight: '600',
  },
  joinForm: {
    backgroundColor: colors.neutral.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
  },
  joinFormBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
