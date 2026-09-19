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

export const AcademicSupportQueueScreen: React.FC = () => {
  const { goBack, requests, updateRequestStatus } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [assignedTutor, setAssignedTutor] = useState('');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter for academic support requests
  const academicRequests = useMemo(() => {
    return requests.filter((r) => r.type === 'academic_support');
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return academicRequests.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.data?.courseCode && item.data.courseCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.data?.kind && item.data.kind.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [academicRequests, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const openCount = academicRequests.filter((r) => r.status === 'open').length;
    const inProgressCount = academicRequests.filter((r) => r.status === 'in_progress').length;
    const resolvedCount = academicRequests.filter((r) => r.status === 'resolved').length;
    return { openCount, inProgressCount, resolvedCount };
  }, [academicRequests]);

  const handleOpenModal = (req: Request) => {
    setSelectedRequest(req);
    setAssignedTutor(req.assigneeUid ? 'Dr. Kasun Silva' : '');
    setFeedbackNote(req.resolution || '');
  };

  const handleUpdateStatus = (newStatus: RequestStatus) => {
    if (!selectedRequest) return;
    setIsUpdating(true);
    setTimeout(() => {
      const combinedNote = assignedTutor
        ? `[Tutor: ${assignedTutor}] ${feedbackNote.trim()}`
        : feedbackNote.trim();

      updateRequestStatus(selectedRequest.id, newStatus, combinedNote);
      setIsUpdating(false);
      setSelectedRequest(null);
    }, 400);
  };

  return (
    <View style={styles.container}>
      {/* KPI Header */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderColor: colors.primary[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.primary[700] }]}>{stats.openCount}</Text>
          <Text style={styles.kpiLabel}>Pending Requests</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.warning[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.warning[700] }]}>{stats.inProgressCount}</Text>
          <Text style={styles.kpiLabel}>In Mentorship</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.success[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.success[700] }]}>{stats.resolvedCount}</Text>
          <Text style={styles.kpiLabel}>Completed</Text>
        </View>
      </View>

      {/* Search & Filter Chips */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search course code, student, kind..."
          onClear={() => setSearchQuery('')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterChip
            label="All Requests"
            selected={statusFilter === 'all'}
            onPress={() => setStatusFilter('all')}
          />
          <FilterChip
            label={`Pending (${stats.openCount})`}
            selected={statusFilter === 'open'}
            onPress={() => setStatusFilter('open')}
          />
          <FilterChip
            label={`Active (${stats.inProgressCount})`}
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

      {/* Request Cards List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredRequests.length === 0 ? (
          <EmptyState
            iconText="📚"
            title="No Academic Support Requests"
            description="There are currently no matching peer tutoring or study support requests in this queue."
          />
        ) : (
          filteredRequests.map((req) => {
            const courseCode = req.data?.courseCode || 'General';
            const kind = req.data?.kind || 'study_group';
            const direction = req.data?.direction || 'request';
            const preferredTimes = req.data?.preferredTimes || 'Flexible';

            return (
              <TouchableOpacity
                key={req.id}
                style={styles.card}
                onPress={() => handleOpenModal(req)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badgeGroup}>
                    <StatusBadge
                      status={
                        req.status === 'open'
                          ? 'warning'
                          : req.status === 'in_progress'
                          ? 'neutral'
                          : 'success'
                      }
                      label={req.status.replace('_', ' ').toUpperCase()}
                    />
                    <View style={styles.kindBadge}>
                      <Text style={styles.kindBadgeText}>
                        {kind.replace('_', ' ').toUpperCase()} ({direction.toUpperCase()})
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.courseBadge}>{courseCode}</Text>
                </View>

                <Text style={styles.reqTitle}>{req.title}</Text>
                <Text style={styles.reqDesc} numberOfLines={2}>
                  {req.description}
                </Text>

                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>⏱️ Preferred Availability:</Text>
                  <Text style={styles.timeVal}>{preferredTimes}</Text>
                </View>

                {req.resolution && (
                  <View style={styles.resolutionBox}>
                    <Text style={styles.resolutionText} numberOfLines={1}>
                      Notes: {req.resolution}
                    </Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.studentName}>Student: {req.ownerName}</Text>
                  <Text style={styles.actionPrompt}>Assign / Respond →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={!!selectedRequest}
        title="Academic Support Assignment"
        onClose={() => setSelectedRequest(null)}
      >
        {selectedRequest && (
          <View style={styles.modalContent}>
            <View style={styles.modalTopRow}>
              <StatusBadge
                status={selectedRequest.status === 'open' ? 'warning' : 'success'}
                label={selectedRequest.status.toUpperCase()}
              />
              <Text style={styles.modalCourseCode}>
                {selectedRequest.data?.courseCode}
              </Text>
            </View>

            <Text style={styles.modalTitle}>{selectedRequest.title}</Text>
            <Text style={styles.modalDesc}>{selectedRequest.description}</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Student: </Text>
                {selectedRequest.ownerName}
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Support Kind: </Text>
                {selectedRequest.data?.kind?.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.infoRow}>
                <Text style={styles.infoLabel}>Availability: </Text>
                {selectedRequest.data?.preferredTimes}
              </Text>
            </View>

            <Text style={styles.fieldHeading}>Assign Faculty Tutor / Mentor:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Dr. Kasun Silva / Peer Mentor Ravi"
              value={assignedTutor}
              onChangeText={setAssignedTutor}
            />

            <Text style={[styles.fieldHeading, { marginTop: spacing[3] }]}>
              Session Notes & Meeting Link:
            </Text>
            <TextInput
              style={[styles.textInput, { minHeight: 65, textAlignVertical: 'top' }]}
              placeholder="e.g. Thursday 3:00 PM in Lab 2. Zoom link shared via email."
              value={feedbackNote}
              onChangeText={setFeedbackNote}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Mark In Progress"
                variant="outline"
                size="md"
                onPress={() => handleUpdateStatus('in_progress')}
                disabled={isUpdating || selectedRequest.status === 'in_progress'}
                style={{ flex: 1 }}
              />
              <Button
                title="Resolve & Complete"
                variant="primary"
                size="md"
                onPress={() => handleUpdateStatus('resolved')}
                disabled={isUpdating || selectedRequest.status === 'resolved'}
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
  kindBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  kindBadgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary[700],
  },
  courseBadge: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[800],
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  reqTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  reqDesc: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing[2],
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    paddingTop: spacing[1.5],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  timeLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    marginRight: spacing[1.5],
  },
  timeVal: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  resolutionBox: {
    backgroundColor: colors.success[50],
    borderRadius: radius.xs,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    marginBottom: spacing[2],
  },
  resolutionText: {
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
  studentName: {
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
  modalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  modalCourseCode: {
    ...typography.labelSm,
    fontWeight: '700',
    color: colors.primary[700],
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
  infoBox: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3.5],
    gap: spacing[1],
  },
  infoRow: {
    ...typography.caption,
    color: colors.neutral[800],
  },
  infoLabel: {
    fontWeight: '700',
    color: colors.neutral[600],
  },
  fieldHeading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[700],
    marginBottom: spacing[1.5],
  },
  textInput: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[3],
    ...typography.bodySm,
    color: colors.neutral[900],
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
  },
});
