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

export const ItemDetailClaimScreen: React.FC = () => {
  const { params, requests, claims, createClaim, navigate, goBack, currentUser } = useNavigation();

  const requestId = params?.requestId || 'req_f0und9';
  const item = requests.find((r) => r.id === requestId) || requests[0];

  const isFound = item.type === 'found';
  const isLost = item.type === 'lost';
  const isOwner = item.ownerUid === currentUser.id;

  // Check if current user already submitted a claim
  const existingClaim = claims.find(
    (c) => c.requestId === item.id && c.claimantUid === currentUser.id
  );

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimAnswer, setClaimAnswer] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimError, setClaimError] = useState<string | null>(null);

  // Find match suggestions (BR7 automated matching)
  const potentialMatches = requests.filter(
    (r) =>
      r.id !== item.id &&
      r.type !== item.type &&
      (r.data?.itemCategory === item.data?.itemCategory ||
        r.location?.includes('LH2'))
  );

  const handleClaimSubmit = () => {
    setClaimError(null);
    if (!claimAnswer.trim()) {
      setClaimError('Please provide specific identifying details of your item.');
      return;
    }

    createClaim(item.id, claimAnswer.trim(), claimMessage.trim());
    setShowClaimForm(false);
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
        <Text style={styles.backText}>← Back to Lost & Found</Text>
      </TouchableOpacity>

      <Card padding="lg" style={styles.mainCard}>
        {/* Status Badges */}
        <View style={styles.badgeRow}>
          <StatusBadge
            label={isFound ? 'FOUND ITEM' : 'LOST REPORT'}
            variant={isFound ? 'verified' : 'critical'}
          />
          <StatusBadge
            label={item.status.toUpperCase()}
            variant={
              item.status === 'resolved'
                ? 'active'
                : item.status === 'in_progress'
                ? 'warning'
                : 'neutral'
            }
            style={styles.statusBadge}
          />
        </View>

        <Text style={styles.title}>{item.title}</Text>

        {/* Location & Reported Meta Box */}
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Location:</Text>
            <Text style={styles.metaValue}>{item.location || 'Campus'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaValue}>
              {(item.data?.itemCategory || 'General').toUpperCase()}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Reported by:</Text>
            <Text style={styles.metaValue}>{item.ownerName}</Text>
          </View>
          {item.handoverNote && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Collection:</Text>
              <Text style={[styles.metaValue, { color: colors.primary.DEFAULT }]}>
                {item.handoverNote}
              </Text>
            </View>
          )}
        </View>

        {/* Item Description */}
        <View style={styles.descBox}>
          <Text style={styles.descHeader}>DESCRIPTION & OBSERVATIONS</Text>
          <Text style={styles.bodyText}>{item.description}</Text>
        </View>

        {/* Automated Match Suggestion Box (BR7) */}
        {potentialMatches.length > 0 && (
          <View style={styles.matchSection}>
            <View style={styles.matchHeaderRow}>
              <Text style={styles.matchHeader}>AUTOMATED MATCH SUGGESTIONS (BR7)</Text>
              <StatusBadge label="86% CONFIDENCE" variant="academic" />
            </View>
            {potentialMatches.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.matchCard}
                onPress={() => navigate('item_detail_claim', { requestId: m.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.matchTitle}>{m.title}</Text>
                <Text style={styles.matchSub}>
                  Reported at {m.location} · Tap to inspect listing →
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Claim / Action Section */}
        <View style={styles.actionSection}>
          {isOwner ? (
            <View style={styles.ownerBox}>
              <Text style={styles.ownerText}>
                You are the author of this {item.type} listing.
              </Text>
            </View>
          ) : existingClaim ? (
            <View style={styles.claimStatusBox}>
              <Text style={styles.claimStatusTitle}>✓ Claim Submitted</Text>
              <Text style={styles.claimStatusDesc}>
                Your verification answer is currently under review by the desk officer.
              </Text>
            </View>
          ) : isFound ? (
            showClaimForm ? (
              <View style={styles.claimFormContainer}>
                <Text style={styles.claimFormTitle}>
                  Verify Ownership of this Item
                </Text>
                <Text style={styles.claimFormSub}>
                  Describe distinguishing marks or private features only the owner would know.
                </Text>

                {claimError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorBoxText}>{claimError}</Text>
                  </View>
                )}

                <FormField
                  label="Private Identifying Details (Verification Answer)"
                  value={claimAnswer}
                  onChangeText={setClaimAnswer}
                  placeholder="e.g. Stickers on cover, scratches, exact serial digits, contents inside..."
                  multiline
                  required
                />

                <FormField
                  label="Message to Handover Officer"
                  value={claimMessage}
                  onChangeText={setClaimMessage}
                  placeholder="e.g. Available to collect today after 3 PM..."
                />

                <View style={styles.formBtnsRow}>
                  <Button
                    title="Submit Ownership Claim"
                    onPress={handleClaimSubmit}
                    variant="primary"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => setShowClaimForm(false)}
                    variant="secondary"
                    style={{ marginLeft: spacing.sm }}
                  />
                </View>
              </View>
            ) : (
              <Button
                title="This is mine — Submit Claim"
                onPress={() => setShowClaimForm(true)}
                variant="primary"
                fullWidth
              />
            )
          ) : (
            <Button
              title="I Found this Item — Report Handover"
              onPress={() => navigate('report_found_item')}
              variant="primary"
              fullWidth
            />
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
  statusBadge: {
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
  metaBox: {
    backgroundColor: colors.neutral.surfaceAlt,
    borderRadius: radius.control,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    width: 90,
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.textSecondary,
  },
  metaValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.text,
  },
  descBox: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    marginBottom: spacing.md,
  },
  descHeader: {
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
  matchSection: {
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.border,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  matchHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
    letterSpacing: 0.5,
  },
  matchCard: {
    backgroundColor: colors.neutral.white,
    padding: spacing.sm + 2,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.primary.border,
    marginTop: spacing.xs,
  },
  matchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral.text,
  },
  matchSub: {
    fontSize: 11,
    color: colors.primary.DEFAULT,
    marginTop: 2,
    fontWeight: '500',
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingTop: spacing.md,
  },
  ownerBox: {
    backgroundColor: colors.neutral.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.control,
    alignItems: 'center',
  },
  ownerText: {
    fontSize: 13,
    color: colors.neutral.textSecondary,
    fontWeight: '600',
  },
  claimStatusBox: {
    backgroundColor: colors.status.success.bg,
    borderColor: colors.status.success.border,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: spacing.md,
    alignItems: 'center',
  },
  claimStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.status.success.text,
  },
  claimStatusDesc: {
    fontSize: 12,
    color: colors.status.success.text,
    textAlign: 'center',
    marginTop: 2,
  },
  claimFormContainer: {
    backgroundColor: colors.neutral.surfaceAlt,
    borderRadius: radius.control,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
  },
  claimFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral.text,
  },
  claimFormSub: {
    fontSize: 12,
    color: colors.neutral.textMuted,
    marginTop: 1,
    marginBottom: spacing.md,
  },
  errorBox: {
    backgroundColor: colors.status.error.bg,
    borderColor: colors.status.error.border,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBoxText: {
    color: colors.status.error.text,
    fontSize: 12,
    fontWeight: '500',
  },
  formBtnsRow: {
    flexDirection: 'row',
  },
});
