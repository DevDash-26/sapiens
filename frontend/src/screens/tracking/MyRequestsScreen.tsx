import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, SearchBar, FilterChip, EmptyState, Button, StatusBadge } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { Request, RequestType, RequestStatus } from '../../types/contract';

const TYPE_FILTERS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'all', label: 'All Requests', icon: '📋' },
  { id: 'lost_found', label: 'Lost & Found', icon: '🔍' },
  { id: 'facility_issue', label: 'Facility Issues', icon: '🛠️' },
  { id: 'academic_support', label: 'Academic Support', icon: '🎓' },
  { id: 'feedback', label: 'Feedback & Inquiries', icon: '📬' },
  { id: 'textbook', label: 'Textbooks', icon: '📚' },
];

const STATUS_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All Statuses' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved / Closed' },
];

export const MyRequestsScreen: React.FC = () => {
  const { goBack, navigate, requests, currentUser } = useNavigation();

  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  // Filter requests belonging to the current user
  const myAllRequests = useMemo(() => {
    return requests.filter((r) => r.ownerUid === currentUser.id);
  }, [requests, currentUser.id]);

  // Metric counts
  const openCount = myAllRequests.filter((r) => r.status === 'open').length;
  const inProgressCount = myAllRequests.filter((r) => r.status === 'in_progress').length;
  const resolvedCount = myAllRequests.filter((r) => r.status === 'resolved' || r.status === 'closed').length;

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return myAllRequests.filter((req) => {
      // Type filter
      if (selectedTypeFilter !== 'all') {
        if (selectedTypeFilter === 'lost_found') {
          if (req.type !== 'lost' && req.type !== 'found') return false;
        } else if (req.type !== selectedTypeFilter) {
          return false;
        }
      }

      // Status filter
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'resolved') {
          if (req.status !== 'resolved' && req.status !== 'closed') return false;
        } else if (req.status !== selectedStatusFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = req.title.toLowerCase().includes(q);
        const descMatch = req.description.toLowerCase().includes(q);
        const locationMatch = req.location?.toLowerCase().includes(q) || false;
        if (!titleMatch && !descMatch && !locationMatch) return false;
      }

      return true;
    });
  }, [myAllRequests, selectedTypeFilter, selectedStatusFilter, searchQuery]);

  const getTypeLabel = (type: RequestType) => {
    switch (type) {
      case 'lost':
        return { label: 'Lost Item', icon: '🔍', color: colors.warning[700], bg: colors.warning[50] };
      case 'found':
        return { label: 'Found Item', icon: '🎁', color: colors.success[700], bg: colors.success[50] };
      case 'facility_issue':
        return { label: 'Facility Defect', icon: '🛠️', color: colors.critical[700], bg: colors.critical[50] };
      case 'academic_support':
        return { label: 'Academic Support', icon: '🎓', color: colors.primary[700], bg: colors.primary[50] };
      case 'feedback':
        return { label: 'Feedback / Q&A', icon: '📬', color: colors.accent[700], bg: colors.accent[50] };
      case 'textbook':
        return { label: 'Textbook Listing', icon: '📚', color: colors.neutral[800], bg: colors.neutral[100] };
      default:
        return { label: 'General Request', icon: '📋', color: colors.neutral[700], bg: colors.neutral[100] };
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Requests & Tracking"
        showBack
        onBack={goBack}
        rightAction={{
          label: '+ New',
          onPress: () => setShowNewModal(true),
        }}
      />

      {/* Summary KPI Strip */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiNumber}>{openCount}</Text>
          <Text style={styles.kpiLabel}>Open / Queued</Text>
        </View>
        <View style={[styles.kpiCard, styles.kpiCardActive]}>
          <Text style={[styles.kpiNumber, { color: colors.warning[600] }]}>{inProgressCount}</Text>
          <Text style={styles.kpiLabel}>In Progress</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiNumber, { color: colors.success[600] }]}>{resolvedCount}</Text>
          <Text style={styles.kpiLabel}>Resolved</Text>
        </View>
      </View>

      {/* Search & Filter Chips */}
      <View style={styles.filterSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by ticket title, location..."
          onClear={() => setSearchQuery('')}
        />

        {/* Type Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {TYPE_FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              label={`${f.icon} ${f.label}`}
              selected={selectedTypeFilter === f.id}
              onPress={() => setSelectedTypeFilter(f.id)}
            />
          ))}
        </ScrollView>

        {/* Status Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusChipScroll}
        >
          {STATUS_FILTERS.map((s) => (
            <FilterChip
              key={s.id}
              label={s.label}
              selected={selectedStatusFilter === s.id}
              onPress={() => setSelectedStatusFilter(s.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredRequests.length === 0 ? (
          <EmptyState
            title="No Requests Found"
            description="You don't have any submitted requests matching the selected filters. Use the button below to submit a new report or inquiry."
            action={{
              label: 'Create a Request',
              onPress: () => setShowNewModal(true),
            }}
          />
        ) : (
          filteredRequests.map((req) => {
            const typeInfo = getTypeLabel(req.type);

            return (
              <TouchableOpacity
                key={req.id}
                style={styles.requestCard}
                onPress={() => navigate('request_detail', { requestId: req.id })}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: typeInfo.bg }]}>
                    <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
                    <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
                      {typeInfo.label}
                    </Text>
                  </View>

                  <StatusBadge status={req.status} />
                </View>

                <Text style={styles.reqTitle}>{req.title}</Text>
                <Text style={styles.reqDesc} numberOfLines={2}>
                  {req.description}
                </Text>

                {req.resolution && (
                  <View style={styles.resolutionBox}>
                    <Text style={styles.resolutionLabel}>Staff Note:</Text>
                    <Text style={styles.resolutionText} numberOfLines={2}>
                      {req.resolution}
                    </Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.metaCol}>
                    {req.location && (
                      <Text style={styles.locationText}>📍 {req.location}</Text>
                    )}
                    <Text style={styles.dateText}>🕒 {formatDate(req.createdAt)}</Text>
                  </View>

                  <Text style={styles.viewTimelineLink}>View Timeline →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* New Request Modal */}
      <Modal
        visible={showNewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit a Request or Report</Text>
              <TouchableOpacity onPress={() => setShowNewModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Select the service category to start a tracked request:
            </Text>

            <View style={styles.optionsGrid}>
              <TouchableOpacity
                style={styles.optionTile}
                onPress={() => {
                  setShowNewModal(false);
                  navigate('report_facility_issue');
                }}
              >
                <Text style={styles.optionEmoji}>🛠️</Text>
                <Text style={styles.optionTitle}>Facility Issue</Text>
                <Text style={styles.optionDesc}>Broken equipment, plumbing, AC, IT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionTile}
                onPress={() => {
                  setShowNewModal(false);
                  navigate('request_academic_support');
                }}
              >
                <Text style={styles.optionEmoji}>🎓</Text>
                <Text style={styles.optionTitle}>Academic Support</Text>
                <Text style={styles.optionDesc}>Study groups & peer tutoring</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionTile}
                onPress={() => {
                  setShowNewModal(false);
                  navigate('report_lost_item');
                }}
              >
                <Text style={styles.optionEmoji}>🔍</Text>
                <Text style={styles.optionTitle}>Report Lost Item</Text>
                <Text style={styles.optionDesc}>Post item missing on campus</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionTile}
                onPress={() => {
                  setShowNewModal(false);
                  navigate('report_found_item');
                }}
              >
                <Text style={styles.optionEmoji}>🎁</Text>
                <Text style={styles.optionTitle}>Report Found Item</Text>
                <Text style={styles.optionDesc}>Hand over item to security desk</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionTile}
                onPress={() => {
                  setShowNewModal(false);
                  navigate('list_textbook');
                }}
              >
                <Text style={styles.optionEmoji}>📚</Text>
                <Text style={styles.optionTitle}>List Textbook</Text>
                <Text style={styles.optionDesc}>Free giveaway, swap or sell</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionTile}
                onPress={() => {
                  setShowNewModal(false);
                  navigate('submit_feedback');
                }}
              >
                <Text style={styles.optionEmoji}>📬</Text>
                <Text style={styles.optionTitle}>Submit Feedback</Text>
                <Text style={styles.optionDesc}>Suggestions, complaints, Q&A</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  kpiContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    gap: spacing[2.5],
    backgroundColor: colors.neutral[0],
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
  },
  kpiCardActive: {
    borderColor: colors.warning[200],
    backgroundColor: colors.warning[50],
  },
  kpiNumber: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[0.5],
  },
  kpiLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  filterSection: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  chipScroll: {
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
    gap: spacing[2],
  },
  statusChipScroll: {
    paddingBottom: spacing[2],
    gap: spacing[1.5],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  requestCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2.5],
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: spacing[1.5],
  },
  typeBadgeText: {
    ...typography.caption,
    fontWeight: '700',
  },
  reqTitle: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  reqDesc: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing[3],
  },
  resolutionBox: {
    backgroundColor: colors.success[50],
    borderLeftWidth: 3,
    borderLeftColor: colors.success[600],
    padding: spacing[2.5],
    borderRadius: radius.sm,
    marginBottom: spacing[3],
  },
  resolutionLabel: {
    ...typography.caption,
    color: colors.success[800],
    fontWeight: '700',
    marginBottom: spacing[0.5],
  },
  resolutionText: {
    ...typography.bodySm,
    color: colors.success[900],
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[2.5],
  },
  metaCol: {
    gap: spacing[0.5],
  },
  locationText: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  dateText: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  viewTimelineLink: {
    ...typography.labelSm,
    color: colors.primary[700],
    fontWeight: '700',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalSheet: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    width: '100%',
    maxWidth: 480,
    padding: spacing[5],
    paddingBottom: spacing[8],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  modalTitle: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 20,
    color: colors.neutral[500],
    padding: spacing[1],
  },
  modalSubtitle: {
    ...typography.bodySm,
    color: colors.neutral[500],
    marginBottom: spacing[4],
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2.5],
  },
  optionTile: {
    width: '48%',
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
  },
  optionEmoji: {
    fontSize: 26,
    marginBottom: spacing[1],
  },
  optionTitle: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '700',
    marginBottom: spacing[0.5],
  },
  optionDesc: {
    ...typography.caption,
    color: colors.neutral[500],
    lineHeight: 14,
  },
});
