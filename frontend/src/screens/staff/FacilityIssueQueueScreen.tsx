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
import { Request, RequestStatus } from '../../types/contract';

type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved';

export const FacilityIssueQueueScreen: React.FC = () => {
  const { goBack, requests, updateRequestStatus } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedIssue, setSelectedIssue] = useState<Request | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter for facility issues
  const facilityIssues = useMemo(() => {
    return requests.filter((r) => r.type === 'facility_issue');
  }, [requests]);

  const filteredIssues = useMemo(() => {
    return facilityIssues.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.data?.building && item.data.building.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.data?.issueCategory && item.data.issueCategory.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [facilityIssues, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const openCount = facilityIssues.filter((r) => r.status === 'open').length;
    const inProgressCount = facilityIssues.filter((r) => r.status === 'in_progress').length;
    const resolvedCount = facilityIssues.filter((r) => r.status === 'resolved').length;
    return { openCount, inProgressCount, resolvedCount };
  }, [facilityIssues]);

  const handleOpenActionModal = (issue: Request) => {
    setSelectedIssue(issue);
    setResolutionNote(issue.resolution || '');
  };

  const handleStatusChange = (newStatus: RequestStatus) => {
    if (!selectedIssue) return;
    setIsUpdating(true);
    setTimeout(() => {
      updateRequestStatus(selectedIssue.id, newStatus, resolutionNote.trim());
      setIsUpdating(false);
      setSelectedIssue(null);
    }, 400);
  };

  return (
    <View style={styles.container}>
      {/* KPI Header Cards */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderColor: colors.critical[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.critical[700] }]}>{stats.openCount}</Text>
          <Text style={styles.kpiLabel}>Open Tickets</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.warning[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.warning[700] }]}>{stats.inProgressCount}</Text>
          <Text style={styles.kpiLabel}>In Progress</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.success[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.success[700] }]}>{stats.resolvedCount}</Text>
          <Text style={styles.kpiLabel}>Resolved</Text>
        </View>
      </View>

      {/* Search & Filter Chips */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by building, room, category..."
          onClear={() => setSearchQuery('')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterChip
            label="All Tickets"
            selected={statusFilter === 'all'}
            onPress={() => setStatusFilter('all')}
          />
          <FilterChip
            label={`Open (${stats.openCount})`}
            selected={statusFilter === 'open'}
            onPress={() => setStatusFilter('open')}
          />
          <FilterChip
            label={`In Progress (${stats.inProgressCount})`}
            selected={statusFilter === 'in_progress'}
            onPress={() => setStatusFilter('in_progress')}
          />
          <FilterChip
            label={`Resolved (${stats.resolvedCount})`}
            selected={statusFilter === 'resolved'}
            onPress={() => setStatusFilter('resolved')}
          />
        </ScrollView>
      </View>

      {/* Issue Tickets List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredIssues.length === 0 ? (
          <EmptyState
            iconText="🛠️"
            title="No Facility Tickets Found"
            description={
              searchQuery
                ? 'Try adjusting your search criteria.'
                : 'All maintenance requests for this filter have been handled.'
            }
          />
        ) : (
          filteredIssues.map((issue) => {
            const urgency = issue.data?.severity || 'medium';
            const category = issue.data?.issueCategory || 'general';
            const building = issue.data?.building || issue.location || 'Campus';
            const room = issue.data?.room || '';

            return (
              <TouchableOpacity
                key={issue.id}
                style={styles.issueCard}
                onPress={() => handleOpenActionModal(issue)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badgeGroup}>
                    <StatusBadge
                      status={
                        issue.status === 'open'
                          ? 'critical'
                          : issue.status === 'in_progress'
                          ? 'warning'
                          : 'success'
                      }
                      label={issue.status.replace('_', ' ').toUpperCase()}
                    />
                    <View
                      style={[
                        styles.urgencyBadge,
                        urgency === 'high' && styles.urgencyHigh,
                        urgency === 'medium' && styles.urgencyMedium,
                      ]}
                    >
                      <Text
                        style={[
                          styles.urgencyText,
                          urgency === 'high' && styles.urgencyTextHigh,
                        ]}
                      >
                        {urgency.toUpperCase()} URGENCY
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ticketId}>{issue.id}</Text>
                </View>

                <Text style={styles.issueTitle}>{issue.title}</Text>
                <Text style={styles.issueDesc} numberOfLines={2}>
                  {issue.description}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLocation}>
                    📍 {building} {room ? `· Room ${room}` : ''}
                  </Text>
                  <Text style={styles.metaCategory}>🔧 {category.toUpperCase()}</Text>
                </View>

                {issue.resolution && (
                  <View style={styles.resolutionSnippet}>
                    <Text style={styles.resolutionSnippetText} numberOfLines={1}>
                      Resolution: {issue.resolution}
                    </Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.reporterText}>
                    Reported by: {issue.ownerName}
                  </Text>
                  <Text style={styles.actionPrompt}>Manage Ticket →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Ticket Action Modal */}
      <Modal
        visible={!!selectedIssue}
        title="Manage Facility Ticket"
        onClose={() => setSelectedIssue(null)}
      >
        {selectedIssue && (
          <View style={styles.modalContent}>
            <View style={styles.modalMetaRow}>
              <StatusBadge
                status={
                  selectedIssue.status === 'open'
                    ? 'critical'
                    : selectedIssue.status === 'in_progress'
                    ? 'warning'
                    : 'success'
                }
                label={selectedIssue.status.toUpperCase()}
              />
              <Text style={styles.modalTicketId}>{selectedIssue.id}</Text>
            </View>

            <Text style={styles.modalTitle}>{selectedIssue.title}</Text>
            <Text style={styles.modalDesc}>{selectedIssue.description}</Text>

            <View style={styles.detailBox}>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Building/Room: </Text>
                {selectedIssue.data?.building || selectedIssue.location} {selectedIssue.data?.room ? `· Room ${selectedIssue.data?.room}` : ''}
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category: </Text>
                {selectedIssue.data?.issueCategory?.toUpperCase()}
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Urgency: </Text>
                {selectedIssue.data?.severity?.toUpperCase()}
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reporter: </Text>
                {selectedIssue.ownerName}
              </Text>
            </View>

            <Text style={styles.inputLabel}>Staff Resolution / Update Notes:</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Assigned to Electrical Team Lead. Replacement HDMI switch installed."
              value={resolutionNote}
              onChangeText={setResolutionNote}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.inputLabel, { marginTop: spacing[3] }]}>Update Ticket Status:</Text>
            <View style={styles.statusActionRow}>
              <Button
                title="Mark In Progress"
                variant="outline"
                size="md"
                onPress={() => handleStatusChange('in_progress')}
                disabled={isUpdating || selectedIssue.status === 'in_progress'}
                style={{ flex: 1 }}
              />
              <Button
                title="Mark Resolved"
                variant="primary"
                size="md"
                onPress={() => handleStatusChange('resolved')}
                disabled={isUpdating || selectedIssue.status === 'resolved'}
                style={{ flex: 1 }}
              />
            </View>
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
  issueCard: {
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
  urgencyBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.neutral[100],
  },
  urgencyHigh: {
    backgroundColor: colors.critical[50],
  },
  urgencyMedium: {
    backgroundColor: colors.warning[50],
  },
  urgencyText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  urgencyTextHigh: {
    color: colors.critical[700],
  },
  ticketId: {
    ...typography.caption,
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.neutral[400],
  },
  issueTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  issueDesc: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing[2.5],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[1.5],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    marginBottom: spacing[2],
  },
  metaLocation: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  metaCategory: {
    ...typography.caption,
    color: colors.neutral[500],
    fontSize: 10,
    fontWeight: '700',
  },
  resolutionSnippet: {
    backgroundColor: colors.success[50],
    borderRadius: radius.xs,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    marginBottom: spacing[2],
  },
  resolutionSnippetText: {
    ...typography.caption,
    color: colors.success[800],
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  reporterText: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  actionPrompt: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[600],
  },
  modalContent: {
    paddingTop: spacing[1],
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  modalTicketId: {
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
  detailBox: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3.5],
    gap: spacing[1],
  },
  detailRow: {
    ...typography.caption,
    color: colors.neutral[800],
  },
  detailLabel: {
    fontWeight: '700',
    color: colors.neutral[600],
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[700],
    marginBottom: spacing[1.5],
  },
  notesInput: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[3],
    ...typography.bodySm,
    color: colors.neutral[900],
    minHeight: 70,
    textAlignVertical: 'top',
  },
  statusActionRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
});
