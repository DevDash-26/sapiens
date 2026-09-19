import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, StatusBadge, Button, Card } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { RequestStatus } from '../../types/contract';

export const RequestDetailTimelineScreen: React.FC = () => {
  const { params, goBack, navigate, requests, updateRequestStatus, currentUser } = useNavigation();

  const requestId = params?.requestId || 'req_fac01';
  const request = requests.find((r) => r.id === requestId) || requests[0];

  const [resolving, setResolving] = useState<boolean>(false);

  const isOwner = request?.ownerUid === currentUser.id;

  if (!request) {
    return (
      <View style={styles.container}>
        <Header title="Request Details" showBack onBack={goBack} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Request Not Found</Text>
          <Button title="Back to My Requests" onPress={() => navigate('my_requests')} />
        </View>
      </View>
    );
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Pending';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Timeline Steps Calculation
  const isSubmitted = true;
  const isAssigned = request.status === 'in_progress' || request.status === 'resolved' || request.status === 'closed';
  const isActionTaken = request.status === 'in_progress' || request.status === 'resolved' || request.status === 'closed';
  const isResolved = request.status === 'resolved' || request.status === 'closed';

  const handleResolve = () => {
    setResolving(true);
    setTimeout(() => {
      setResolving(false);
      updateRequestStatus(request.id, 'resolved', 'Marked as resolved by student owner.');
    }, 500);
  };

  const handleCancel = () => {
    updateRequestStatus(request.id, 'closed', 'Cancelled by requester.');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Tracking & Timeline"
        showBack
        onBack={goBack}
        rightAction={{
          label: 'All Tickets',
          onPress: () => navigate('my_requests'),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ticket Top Header Card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketCardTop}>
            <View style={styles.ticketIdBadge}>
              <Text style={styles.ticketIdText}>{request.id.toUpperCase()}</Text>
            </View>
            <StatusBadge status={request.status} />
          </View>

          <Text style={styles.ticketTitle}>{request.title}</Text>
          <Text style={styles.ticketTypeLabel}>
            Type: <Text style={{ fontWeight: '700' }}>{request.type.toUpperCase().replace('_', ' ')}</Text> · Visibility: <Text style={{ fontWeight: '600' }}>{request.visibility}</Text>
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Submitted Description</Text>
          <Text style={styles.descriptionText}>{request.description}</Text>

          {/* Type-specific details */}
          {request.type === 'facility_issue' && request.data && (
            <View style={styles.specsBox}>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Building & Room:</Text>
                <Text style={styles.specValue}>{request.data.building} · {request.data.room}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Defect Category:</Text>
                <Text style={styles.specValue}>{request.data.issueCategory?.toUpperCase()}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Urgency / Severity:</Text>
                <Text style={styles.specValue}>{request.data.severity?.toUpperCase()}</Text>
              </View>
            </View>
          )}

          {request.type === 'academic_support' && request.data && (
            <View style={styles.specsBox}>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Program / Kind:</Text>
                <Text style={styles.specValue}>{request.data.kind?.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Course Code:</Text>
                <Text style={styles.specValue}>{request.data.courseCode}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Preferred Times:</Text>
                <Text style={styles.specValue}>{request.data.preferredTimes}</Text>
              </View>
            </View>
          )}

          {request.type === 'textbook' && request.data && (
            <View style={styles.specsBox}>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Course Module:</Text>
                <Text style={styles.specValue}>{request.data.courseCode}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Condition:</Text>
                <Text style={styles.specValue}>{request.data.condition?.toUpperCase()}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Listing Type:</Text>
                <Text style={styles.specValue}>
                  {request.data.offer === 'sell' ? `For Sale (LKR ${request.data.price})` : request.data.offer?.toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          {request.type === 'found' && request.verificationHint && (
            <View style={styles.verificationBox}>
              <Text style={styles.verificationLabel}>🔒 Private Verification Hint (Masked to Public)</Text>
              <Text style={styles.verificationText}>{request.verificationHint}</Text>
            </View>
          )}

          {request.location && (
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{request.location}</Text>
            </View>
          )}
        </View>

        {/* Live Status Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.timelineTitle}>Live Lifecycle Timeline</Text>

          {/* Step 1: Submitted */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineTrack}>
              <View style={[styles.timelineNode, styles.timelineNodeActive]}>
                <Text style={styles.nodeCheck}>✓</Text>
              </View>
              <View style={[styles.timelineLine, isAssigned && styles.timelineLineActive]} />
            </View>
            <View style={styles.timelineContent}>
              <View style={styles.timelineHeaderRow}>
                <Text style={styles.stepTitle}>1. Ticket Submitted & Logged</Text>
                <Text style={styles.stepTime}>{formatDate(request.createdAt)}</Text>
              </View>
              <Text style={styles.stepDesc}>
                Submitted by {request.ownerName}. Awaiting staff queue pickup.
              </Text>
            </View>
          </View>

          {/* Step 2: Assigned / In Review */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineTrack}>
              <View style={[styles.timelineNode, isAssigned && styles.timelineNodeActive]}>
                <Text style={styles.nodeCheck}>{isAssigned ? '✓' : '2'}</Text>
              </View>
              <View style={[styles.timelineLine, isActionTaken && styles.timelineLineActive]} />
            </View>
            <View style={styles.timelineContent}>
              <View style={styles.timelineHeaderRow}>
                <Text style={styles.stepTitle}>2. Assigned & Under Review</Text>
                <Text style={styles.stepTime}>
                  {isAssigned ? formatDate(request.updatedAt) : 'Pending triage'}
                </Text>
              </View>
              <Text style={styles.stepDesc}>
                {isAssigned
                  ? `Assigned to department coordinator (${request.assigneeUid || 'Staff Queue'}). Initial inspection conducted.`
                  : 'Ticket queued for coordinator review.'}
              </Text>
            </View>
          </View>

          {/* Step 3: In Progress / Action */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineTrack}>
              <View style={[styles.timelineNode, isActionTaken && styles.timelineNodeActive]}>
                <Text style={styles.nodeCheck}>{isActionTaken ? '✓' : '3'}</Text>
              </View>
              <View style={[styles.timelineLine, isResolved && styles.timelineLineActive]} />
            </View>
            <View style={styles.timelineContent}>
              <View style={styles.timelineHeaderRow}>
                <Text style={styles.stepTitle}>3. Remediation & Action Taken</Text>
                <Text style={styles.stepTime}>
                  {isActionTaken ? formatDate(request.updatedAt) : 'Pending action'}
                </Text>
              </View>
              <Text style={styles.stepDesc}>
                {request.resolution
                  ? request.resolution
                  : isActionTaken
                  ? 'Work order in progress. Campus technicians / coordinators actively handling.'
                  : 'Pending dispatch.'}
              </Text>
            </View>
          </View>

          {/* Step 4: Resolved */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineTrack}>
              <View style={[styles.timelineNode, isResolved && styles.timelineNodeResolved]}>
                <Text style={styles.nodeCheck}>{isResolved ? '✓' : '4'}</Text>
              </View>
            </View>
            <View style={styles.timelineContent}>
              <View style={styles.timelineHeaderRow}>
                <Text style={[styles.stepTitle, isResolved && { color: colors.success[700] }]}>
                  4. Ticket Resolved & Verified
                </Text>
                <Text style={styles.stepTime}>
                  {isResolved ? formatDate(request.resolvedAt || request.updatedAt) : 'Incomplete'}
                </Text>
              </View>
              <Text style={styles.stepDesc}>
                {isResolved
                  ? 'Resolution confirmed. Issue verified and ticket closed by campus administration.'
                  : 'Will mark closed upon final inspection and confirmation.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Controls for Requester */}
        {isOwner && request.status !== 'resolved' && request.status !== 'closed' && (
          <View style={styles.actionCard}>
            <Text style={styles.actionCardTitle}>Manage Request</Text>
            <Text style={styles.actionCardDesc}>
              Has your issue been fixed or have you received what you needed?
            </Text>

            <View style={styles.actionBtnRow}>
              <Button
                title={resolving ? 'Updating...' : 'Mark as Resolved'}
                variant="primary"
                size="md"
                onPress={handleResolve}
                disabled={resolving}
                style={{ flex: 1, marginRight: spacing[2] }}
              />
              <Button
                title="Cancel Request"
                variant="outline"
                size="md"
                onPress={handleCancel}
                style={{ flex: 1 }}
              />
            </View>
          </View>
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
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  emptyContainer: {
    flex: 1,
    padding: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.headlineMd,
    color: colors.neutral[800],
    marginBottom: spacing[4],
  },
  ticketCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  ticketCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  ticketIdBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
  },
  ticketIdText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.neutral[700],
  },
  ticketTitle: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[1],
  },
  ticketTypeLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    marginBottom: spacing[3],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginBottom: spacing[3],
  },
  sectionHeader: {
    ...typography.labelSm,
    color: colors.neutral[700],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  descriptionText: {
    ...typography.bodySm,
    color: colors.neutral[800],
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  specsBox: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
    gap: spacing[1.5],
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specLabel: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  specValue: {
    ...typography.caption,
    color: colors.neutral[800],
    fontWeight: '700',
  },
  verificationBox: {
    backgroundColor: colors.warning[50],
    borderLeftWidth: 3,
    borderLeftColor: colors.warning[600],
    padding: spacing[3],
    borderRadius: radius.sm,
    marginBottom: spacing[3],
  },
  verificationLabel: {
    ...typography.caption,
    color: colors.warning[900],
    fontWeight: '700',
    marginBottom: spacing[0.5],
  },
  verificationText: {
    ...typography.bodySm,
    color: colors.warning[800],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[1],
  },
  locationIcon: {
    fontSize: 14,
    marginRight: spacing[1.5],
  },
  locationText: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  // Timeline styles
  timelineSection: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  timelineTitle: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[4],
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineTrack: {
    alignItems: 'center',
    width: 28,
    marginRight: spacing[3],
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineNodeActive: {
    backgroundColor: colors.primary[600],
  },
  timelineNodeResolved: {
    backgroundColor: colors.success[600],
  },
  nodeCheck: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.neutral[0],
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[1],
    minHeight: 48,
  },
  timelineLineActive: {
    backgroundColor: colors.primary[600],
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing[4],
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[0.5],
  },
  stepTitle: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  stepTime: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  stepDesc: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginTop: spacing[0.5],
  },
  actionCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
  },
  actionCardTitle: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  actionCardDesc: {
    ...typography.bodySm,
    color: colors.neutral[500],
    marginBottom: spacing[3],
  },
  actionBtnRow: {
    flexDirection: 'row',
  },
});
