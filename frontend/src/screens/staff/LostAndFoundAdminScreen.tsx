import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import {
  Button,
  StatusBadge,
  SearchBar,
  FilterChip,
  Modal,
  EmptyState,
} from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { Request } from '../../types/contract';

type TypeFilter = 'all' | 'lost' | 'found' | 'claims';

export const LostAndFoundAdminScreen: React.FC = () => {
  const { goBack, requests, claims, decideClaim, updateRequestStatus } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedItem, setSelectedItem] = useState<Request | null>(null);
  const [handoverNote, setHandoverNote] = useState('Collect from Ground Floor Security Desk upon presenting UCL Student ID card.');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter lost & found requests
  const lostFoundItems = useMemo(() => {
    return requests.filter((r) => r.type === 'lost' || r.type === 'found');
  }, [requests]);

  const filteredItems = useMemo(() => {
    return lostFoundItems.filter((item) => {
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'lost' && item.type === 'lost') ||
        (typeFilter === 'found' && item.type === 'found') ||
        (typeFilter === 'claims' && item.status === 'in_progress');

      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [lostFoundItems, typeFilter, searchQuery]);

  const stats = useMemo(() => {
    const lostCount = lostFoundItems.filter((r) => r.type === 'lost' && r.status === 'open').length;
    const foundCount = lostFoundItems.filter((r) => r.type === 'found' && r.status === 'open').length;
    const pendingClaimsCount = claims.filter((c) => c.status === 'pending').length;
    return { lostCount, foundCount, pendingClaimsCount };
  }, [lostFoundItems, claims]);

  const handleOpenItem = (item: Request) => {
    setSelectedItem(item);
  };

  const handleDecideClaimAction = (claimId: string, decision: 'approve' | 'reject') => {
    if (!selectedItem) return;
    setIsProcessing(true);
    setTimeout(() => {
      decideClaim(claimId, selectedItem.id, decision, handoverNote);
      setIsProcessing(false);
      setSelectedItem(null);
    }, 400);
  };

  const handleMarkResolved = () => {
    if (!selectedItem) return;
    setIsProcessing(true);
    setTimeout(() => {
      updateRequestStatus(selectedItem.id, 'resolved', 'Handed over directly to student by Security Desk.');
      setIsProcessing(false);
      setSelectedItem(null);
    }, 400);
  };

  return (
    <View style={styles.container}>
      {/* KPI Header */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderColor: colors.critical[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.critical[700] }]}>{stats.lostCount}</Text>
          <Text style={styles.kpiLabel}>Open Lost</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.primary[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.primary[700] }]}>{stats.foundCount}</Text>
          <Text style={styles.kpiLabel}>Held in Custody</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.warning[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.warning[700] }]}>{stats.pendingClaimsCount}</Text>
          <Text style={styles.kpiLabel}>Claims Pending</Text>
        </View>
      </View>

      {/* Search & Filter Chips */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search items, locations, brands..."
          onClear={() => setSearchQuery('')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterChip
            label="All Items"
            selected={typeFilter === 'all'}
            onPress={() => setTypeFilter('all')}
          />
          <FilterChip
            label={`Lost Reports (${stats.lostCount})`}
            selected={typeFilter === 'lost'}
            onPress={() => setTypeFilter('lost')}
          />
          <FilterChip
            label={`Found / Held (${stats.foundCount})`}
            selected={typeFilter === 'found'}
            onPress={() => setTypeFilter('found')}
          />
          <FilterChip
            label={`Pending Claims (${stats.pendingClaimsCount})`}
            selected={typeFilter === 'claims'}
            onPress={() => setTypeFilter('claims')}
          />
        </ScrollView>
      </View>

      {/* Item List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredItems.length === 0 ? (
          <EmptyState
            iconText="🔍"
            title="No Items Found"
            description="No lost or found items match your current filter."
          />
        ) : (
          filteredItems.map((item) => {
            const isFound = item.type === 'found';
            const itemClaims = claims.filter((c) => c.requestId === item.id);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => handleOpenItem(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badgeGroup}>
                    <StatusBadge
                      status={isFound ? 'success' : 'critical'}
                      label={item.type.toUpperCase()}
                    />
                    <StatusBadge
                      status={
                        item.status === 'open'
                          ? 'neutral'
                          : item.status === 'in_progress'
                          ? 'warning'
                          : 'success'
                      }
                      label={item.status.replace('_', ' ').toUpperCase()}
                    />
                  </View>
                  <Text style={styles.itemId}>{item.id}</Text>
                </View>

                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.locationRow}>
                  <Text style={styles.locationText}>📍 {item.location || 'UCL Campus'}</Text>
                  {isFound && item.data?.handedTo && (
                    <Text style={styles.holdingDeskText}>
                      Held at: {item.data.handedTo.replace('_', ' ').toUpperCase()}
                    </Text>
                  )}
                </View>

                {/* Staff Private Hint Indicator */}
                {isFound && item.verificationHint && (
                  <View style={styles.privateHintBox}>
                    <Text style={styles.privateHintLabel}>🔒 Staff Private Verification Key:</Text>
                    <Text style={styles.privateHintText}>{item.verificationHint}</Text>
                  </View>
                )}

                {itemClaims.length > 0 && (
                  <View style={styles.claimsSummaryBox}>
                    <Text style={styles.claimsSummaryText}>
                      ⚡ {itemClaims.length} Claim(s) Submitted for Verification
                    </Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.ownerText}>Reported by: {item.ownerName}</Text>
                  <Text style={styles.actionPrompt}>Verify & Handover →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Claim & Handover Modal */}
      <Modal
        visible={!!selectedItem}
        title="Lost & Found Security Handover"
        onClose={() => setSelectedItem(null)}
      >
        {selectedItem && (
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <StatusBadge
                status={selectedItem.type === 'found' ? 'success' : 'critical'}
                label={selectedItem.type.toUpperCase()}
              />
              <Text style={styles.modalId}>{selectedItem.id}</Text>
            </View>

            <Text style={styles.modalTitle}>{selectedItem.title}</Text>
            <Text style={styles.modalDesc}>{selectedItem.description}</Text>

            {/* Secret Verification Hint (Staff Privileged) */}
            {selectedItem.verificationHint && (
              <View style={styles.modalSecretBox}>
                <Text style={styles.modalSecretHeader}>🔒 Private Verification Hint (Secret):</Text>
                <Text style={styles.modalSecretBody}>{selectedItem.verificationHint}</Text>
              </View>
            )}

            {/* Review Claims */}
            <Text style={styles.claimsSectionTitle}>Claim Verification Queue:</Text>
            {claims.filter((c) => c.requestId === selectedItem.id).length === 0 ? (
              <Text style={styles.noClaimsText}>No student claims submitted yet.</Text>
            ) : (
              claims
                .filter((c) => c.requestId === selectedItem.id)
                .map((claim) => (
                  <View key={claim.id} style={styles.claimItemBox}>
                    <View style={styles.claimHeader}>
                      <Text style={styles.claimantName}>Claimant: {claim.claimantName}</Text>
                      <StatusBadge
                        status={
                          claim.status === 'approved'
                            ? 'success'
                            : claim.status === 'rejected'
                            ? 'critical'
                            : 'warning'
                        }
                        label={claim.status.toUpperCase()}
                      />
                    </View>
                    <Text style={styles.claimAnswerLabel}>Proof / Secret Details Given:</Text>
                    <Text style={styles.claimAnswerText}>"{claim.answer}"</Text>
                    <Text style={styles.claimMsgText}>Note: {claim.message}</Text>

                    {claim.status === 'pending' && (
                      <View style={styles.claimActionsRow}>
                        <Button
                          title="Reject"
                          variant="outline"
                          size="sm"
                          onPress={() => handleDecideClaimAction(claim.id, 'reject')}
                          disabled={isProcessing}
                          style={{ flex: 1 }}
                        />
                        <Button
                          title="Verify & Approve"
                          variant="primary"
                          size="sm"
                          onPress={() => handleDecideClaimAction(claim.id, 'approve')}
                          disabled={isProcessing}
                          style={{ flex: 1.5 }}
                        />
                      </View>
                    )}
                  </View>
                ))
            )}

            <Text style={[styles.claimsSectionTitle, { marginTop: spacing[3] }]}>
              Official Handover Instructions Note:
            </Text>
            <TextInput
              style={styles.handoverInput}
              value={handoverNote}
              onChangeText={setHandoverNote}
              multiline
              numberOfLines={2}
            />

            <Button
              title={isProcessing ? 'Updating...' : 'Direct Mark Resolved / Handed Over'}
              variant="outline"
              size="md"
              onPress={handleMarkResolved}
              disabled={isProcessing || selectedItem.status === 'resolved'}
              style={{ marginTop: spacing[3] }}
            />
          </View>
        )}
      </Modal>
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
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    gap: spacing[2],
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
  },
  kpiVal: {
    ...typography.headlineSm,
    fontWeight: '800',
  },
  kpiLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral[500],
    marginTop: 2,
  },
  searchSection: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterScroll: {
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
    gap: spacing[3],
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  itemId: {
    ...typography.caption,
    fontFamily: 'monospace',
    fontSize: 10,
    color: colors.neutral[400],
  },
  itemTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  itemDesc: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing[2],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[1],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    marginBottom: spacing[1.5],
  },
  locationText: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  holdingDeskText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary[700],
    fontWeight: '700',
  },
  privateHintBox: {
    backgroundColor: colors.warning[50],
    borderRadius: radius.xs,
    padding: spacing[2],
    marginBottom: spacing[2],
    borderLeftWidth: 3,
    borderLeftColor: colors.warning[600],
  },
  privateHintLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.warning[900],
    marginBottom: 2,
  },
  privateHintText: {
    ...typography.caption,
    color: colors.warning[800],
    fontWeight: '600',
  },
  claimsSummaryBox: {
    backgroundColor: colors.primary[50],
    borderRadius: radius.xs,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    marginBottom: spacing[2],
  },
  claimsSummaryText: {
    ...typography.caption,
    color: colors.primary[800],
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  ownerText: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  actionPrompt: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[600],
  },
  modalContent: {
    paddingTop: spacing[1],
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  modalId: {
    ...typography.caption,
    fontFamily: 'monospace',
    color: colors.neutral[500],
  },
  modalTitle: {
    ...typography.headlineSm,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  modalDesc: {
    ...typography.bodySm,
    color: colors.neutral[700],
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  modalSecretBox: {
    backgroundColor: colors.warning[50],
    padding: spacing[3],
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning[600],
    marginBottom: spacing[3],
  },
  modalSecretHeader: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.warning[900],
    marginBottom: 2,
  },
  modalSecretBody: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  claimsSectionTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing[1.5],
  },
  noClaimsText: {
    ...typography.caption,
    color: colors.neutral[500],
    fontStyle: 'italic',
    marginBottom: spacing[2],
  },
  claimItemBox: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[2.5],
  },
  claimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  claimantName: {
    ...typography.labelSm,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  claimAnswerLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[600],
    marginTop: 2,
  },
  claimAnswerText: {
    ...typography.bodySm,
    color: colors.primary[900],
    fontWeight: '700',
    marginBottom: 2,
  },
  claimMsgText: {
    ...typography.caption,
    color: colors.neutral[600],
    marginBottom: spacing[2],
  },
  claimActionsRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  handoverInput: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[2.5],
    ...typography.bodySm,
    color: colors.neutral[900],
  },
});
