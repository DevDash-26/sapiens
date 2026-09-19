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

const CANNED_RESPONSES = [
  'Thank you for bringing this to our attention. Our administrative team has updated the policy guidelines accordingly.',
  'We have logged this inquiry and escalated it to the relevant faculty department for follow-up.',
  'This question has been addressed in our official campus FAQ directory. Thank you for your feedback.',
];

export const FeedbackInboxScreen: React.FC = () => {
  const { goBack, requests, updateRequestStatus } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Request | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter for feedback requests
  const feedbackItems = useMemo(() => {
    return requests.filter((r) => r.type === 'feedback');
  }, [requests]);

  const filteredItems = useMemo(() => {
    return feedbackItems.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.data?.kind && item.data.kind.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [feedbackItems, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const openCount = feedbackItems.filter((r) => r.status === 'open').length;
    const inProgressCount = feedbackItems.filter((r) => r.status === 'in_progress').length;
    const resolvedCount = feedbackItems.filter((r) => r.status === 'resolved').length;
    return { openCount, inProgressCount, resolvedCount };
  }, [feedbackItems]);

  const handleOpenModal = (item: Request) => {
    setSelectedFeedback(item);
    setReplyText(item.resolution || '');
  };

  const handleApplyCanned = (canned: string) => {
    setReplyText(canned);
  };

  const handleUpdateStatus = (newStatus: RequestStatus) => {
    if (!selectedFeedback) return;
    setIsUpdating(true);
    setTimeout(() => {
      updateRequestStatus(selectedFeedback.id, newStatus, replyText.trim());
      setIsUpdating(false);
      setSelectedFeedback(null);
    }, 400);
  };

  return (
    <View style={styles.container}>
      {/* KPI Counters */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderColor: colors.warning[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.warning[700] }]}>{stats.openCount}</Text>
          <Text style={styles.kpiLabel}>New Inquiries</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.primary[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.primary[700] }]}>{stats.inProgressCount}</Text>
          <Text style={styles.kpiLabel}>Under Review</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: colors.success[200] }]}>
          <Text style={[styles.kpiVal, { color: colors.success[700] }]}>{stats.resolvedCount}</Text>
          <Text style={styles.kpiLabel}>Answered / Closed</Text>
        </View>
      </View>

      {/* Search & Filter Chips */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search feedback keywords, suggestions..."
          onClear={() => setSearchQuery('')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <FilterChip
            label="All Inquiries"
            selected={statusFilter === 'all'}
            onPress={() => setStatusFilter('all')}
          />
          <FilterChip
            label={`New (${stats.openCount})`}
            selected={statusFilter === 'open'}
            onPress={() => setStatusFilter('open')}
          />
          <FilterChip
            label={`Under Review (${stats.inProgressCount})`}
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

      {/* Feedback List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredItems.length === 0 ? (
          <EmptyState
            iconText="💬"
            title="No Inquiries in this Queue"
            description="All student suggestions and questions have been answered."
          />
        ) : (
          filteredItems.map((item) => {
            const kind = item.data?.kind || 'suggestion';
            const isAnonymous = item.data?.anonymous || false;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => handleOpenModal(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badgeGroup}>
                    <StatusBadge
                      status={
                        item.status === 'open'
                          ? 'warning'
                          : item.status === 'in_progress'
                          ? 'neutral'
                          : 'success'
                      }
                      label={item.status.replace('_', ' ').toUpperCase()}
                    />
                    <View style={styles.kindBadge}>
                      <Text style={styles.kindBadgeText}>
                        {kind.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                {item.resolution && (
                  <View style={styles.replyPreview}>
                    <Text style={styles.replyPreviewText} numberOfLines={1}>
                      Staff Reply: {item.resolution}
                    </Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.senderText}>
                    {isAnonymous ? '👤 Anonymous Student' : `👤 ${item.ownerName}`}
                  </Text>
                  <Text style={styles.actionPrompt}>Reply & Resolve →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Response Modal */}
      <Modal
        visible={!!selectedFeedback}
        title="Student Inquiry Response"
        onClose={() => setSelectedFeedback(null)}
      >
        {selectedFeedback && (
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <StatusBadge
                status={selectedFeedback.status === 'open' ? 'warning' : 'success'}
                label={selectedFeedback.status.toUpperCase()}
              />
              <Text style={styles.modalSenderBadge}>
                {selectedFeedback.data?.anonymous
                  ? 'Anonymous Student'
                  : selectedFeedback.ownerName}
              </Text>
            </View>

            <Text style={styles.modalTitle}>{selectedFeedback.title}</Text>
            <Text style={styles.modalDesc}>{selectedFeedback.description}</Text>

            <Text style={styles.cannedHeading}>Quick Standard Responses:</Text>
            <View style={styles.cannedList}>
              {CANNED_RESPONSES.map((canned, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.cannedChip}
                  onPress={() => handleApplyCanned(canned)}
                >
                  <Text style={styles.cannedText} numberOfLines={1}>
                    ⚡ {canned}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.cannedHeading, { marginTop: spacing[3] }]}>
              Official Staff Response / Action Taken:
            </Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Type official reply sent directly to the student..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Mark In Review"
                variant="outline"
                size="md"
                onPress={() => handleUpdateStatus('in_progress')}
                disabled={isUpdating || selectedFeedback.status === 'in_progress'}
                style={{ flex: 1 }}
              />
              <Button
                title="Resolve & Reply"
                variant="primary"
                size="md"
                onPress={() => handleUpdateStatus('resolved')}
                disabled={isUpdating || selectedFeedback.status === 'resolved'}
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
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  kindBadgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  dateText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[400],
  },
  cardTitle: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  cardDesc: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing[2.5],
  },
  replyPreview: {
    backgroundColor: colors.success[50],
    borderRadius: radius.xs,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    marginBottom: spacing[2],
  },
  replyPreviewText: {
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
  senderText: {
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
  modalSenderBadge: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral[600],
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
  cannedHeading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[700],
    marginBottom: spacing[1.5],
  },
  cannedList: {
    gap: spacing[1.5],
    marginBottom: spacing[2],
  },
  cannedChip: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cannedText: {
    ...typography.caption,
    color: colors.neutral[800],
  },
  replyInput: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[3],
    ...typography.bodySm,
    color: colors.neutral[900],
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
  },
});
