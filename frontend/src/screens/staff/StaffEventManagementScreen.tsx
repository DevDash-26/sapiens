import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Button, FormField, StatusBadge, EmptyState } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { ContentCategory } from '../../types/contract';

const EVENT_CATEGORIES: Array<{ id: ContentCategory; label: string }> = [
  { id: 'academic', label: 'Academic & Hackathons' },
  { id: 'career', label: 'Career & Placement' },
  { id: 'social', label: 'Social & Welcome' },
  { id: 'cultural', label: 'Cultural & Arts' },
  { id: 'sports', label: 'Sports & Rec' },
];

export const StaffEventManagementScreen: React.FC = () => {
  const { goBack, navigate, contents, createContent, currentUser, params } = useNavigation();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ContentCategory>('academic');
  const [venue, setVenue] = useState<string>('Auditorium');
  const [startsAt, setStartsAt] = useState<string>('2026-09-28T09:00:00.000Z');
  const [endsAt, setEndsAt] = useState<string>('2026-09-28T14:00:00.000Z');
  const [capacity, setCapacity] = useState<string>('150');
  const [summary, setSummary] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-open create modal if opened via + New Event intent
  useEffect(() => {
    if (params?.openCreate) {
      setShowCreateModal(true);
    }
  }, [params?.openCreate]);

  // All campus events
  const campusEvents = useMemo(() => {
    return contents.filter((c) => c.type === 'event' || c.type === 'guest_lecture');
  }, [contents]);

  const handleCreateEvent = () => {
    setError(null);
    if (!title.trim()) {
      setError('Please provide an event title.');
      return;
    }
    if (!venue.trim()) {
      setError('Please specify the campus venue.');
      return;
    }

    setLoading(true);
    try {
      createContent({
        type: 'event',
        category,
        title: title.trim(),
        summary: summary.trim() || title.trim(),
        body: body.trim() || 'Campus event scheduled at Universal College Lanka.',
        imageUrl: null,
        tags: ['event', category, 'campus'],
        audience: { all: true, faculties: [], programmes: [], years: [] },
        priority: 'normal',
        pinned: false,
        status: 'published',
        publishAt: new Date().toISOString(),
        expiresAt: endsAt,
        startsAt,
        endsAt,
        allDay: false,
        venue: venue.trim(),
        origin: 'official',
        societyId: null,
        capacity: parseInt(capacity, 10) || 150,
        link: null,
        details: {},
        author: {
          uid: currentUser.id,
          name: currentUser.displayName,
          role: currentUser.role,
        },
        source: {
          department: currentUser.department || 'Facilities & Operations',
          verified: true,
        },
      });

      setShowCreateModal(false);
      setTitle('');
      setSummary('');
      setBody('');
    } catch (err: any) {
      setError(err?.message || 'Failed to publish event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Prominent Action Banner for Coordinators */}
        <View style={styles.actionHeaderCard}>
          <View style={styles.actionHeaderLeft}>
            <Text style={styles.actionHeaderTitle}>Event Coordination & Publishing</Text>
            <Text style={styles.actionHeaderSub}>
              Schedule campus hackathons, workshops & guest lectures with live RSVP capacity tracking.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.actionCreateBtn}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.actionCreateBtnText}>+ Create Event</Text>
          </TouchableOpacity>
        </View>

        {/* Top Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{campusEvents.length}</Text>
            <Text style={styles.statLabel}>Active Events</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: colors.primary[700] }]}>
              {campusEvents.reduce((acc, curr) => acc + curr.interestedCount, 0)}
            </Text>
            <Text style={styles.statLabel}>Total RSVPs</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Published Events & RSVPs</Text>

        {campusEvents.length === 0 ? (
          <EmptyState
            iconText="📅"
            title="No Events Scheduled Yet"
            description="Your campus calendar currently has no published events. As an event coordinator or manager, you can schedule and publish one right now."
            action={{
              label: '+ Schedule First Event',
              onPress: () => setShowCreateModal(true),
            }}
          />
        ) : (
          campusEvents.map((evt) => {
            const cap = evt.capacity || 100;
            const pct = Math.min(100, Math.round((evt.interestedCount / cap) * 100));

            return (
              <View key={evt.id} style={styles.eventCard}>
                <View style={styles.eventCardHeader}>
                  <View style={styles.titleCol}>
                    <Text style={styles.eventTitle}>{evt.title}</Text>
                    <Text style={styles.eventVenue}>📍 {evt.venue || 'Campus Main Quad'}</Text>
                  </View>
                  <StatusBadge status={evt.status} />
                </View>

                <Text style={styles.eventSummary} numberOfLines={2}>
                  {evt.summary}
                </Text>

                {/* RSVP Progress Meter */}
                <View style={styles.meterContainer}>
                  <View style={styles.meterHeader}>
                    <Text style={styles.meterLabel}>
                      RSVP Interest: <Text style={{ fontWeight: '800' }}>{evt.interestedCount}</Text> / {cap} seats
                    </Text>
                    <Text style={styles.meterPct}>{pct}% Capacity</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                </View>

                <View style={styles.eventFooter}>
                  <Text style={styles.publisherText}>By {evt.source.department}</Text>
                  <View style={styles.footerActionRow}>
                    <Button
                      title="Live View"
                      variant="outline"
                      size="sm"
                      onPress={() => navigate('event_detail', { eventId: evt.id })}
                    />
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Official Event</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <FormField
                label="Event Title"
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. AI Product Engineering Hackathon 2026"
              />

              {/* Category */}
              <View style={styles.categorySection}>
                <Text style={styles.fieldLabel}>Event Category:</Text>
                <View style={styles.categoryChipRow}>
                  {EVENT_CATEGORIES.map((c) => {
                    const isSel = category === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.categoryChip, isSel && styles.categoryChipSel]}
                        onPress={() => setCategory(c.id)}
                      >
                        <Text style={[styles.categoryChipText, isSel && styles.categoryChipTextSel]}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <FormField
                label="Campus Venue"
                value={venue}
                onChangeText={setVenue}
                placeholder="e.g. Auditorium / Main Quad"
              />

              <View style={styles.twoCol}>
                <View style={{ flex: 1, marginRight: spacing[2] }}>
                  <FormField
                    label="Capacity Limit"
                    value={capacity}
                    onChangeText={setCapacity}
                    keyboardType="numeric"
                    placeholder="150"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Target Faculty"
                    value="All Faculties"
                    editable={false}
                  />
                </View>
              </View>

              <FormField
                label="1-Line Summary"
                value={summary}
                onChangeText={setSummary}
                placeholder="Brief highlight shown on event cards..."
              />

              <FormField
                label="Full Agenda & Description"
                value={body}
                onChangeText={setBody}
                placeholder="Schedule, guest speaker bios, kit instructions..."
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title={loading ? 'Creating...' : 'Publish Event to Calendar'}
                variant="primary"
                size="lg"
                onPress={handleCreateEvent}
                disabled={loading}
              />
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
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  actionHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
  },
  actionHeaderLeft: {
    flex: 1,
    marginRight: spacing[3],
  },
  actionHeaderTitle: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: 2,
  },
  actionHeaderSub: {
    ...typography.caption,
    color: colors.neutral[600],
    lineHeight: 16,
  },
  actionCreateBtn: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[3.5],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  actionCreateBtnText: {
    ...typography.labelSm,
    color: '#ffffff',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[2.5],
    marginBottom: spacing[4],
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3.5],
    alignItems: 'center',
  },
  statNum: {
    ...typography.headlineMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  sectionHeading: {
    ...typography.labelSm,
    color: colors.neutral[700],
    fontWeight: '700',
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  titleCol: {
    flex: 1,
    marginRight: spacing[2],
  },
  eventTitle: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: 2,
  },
  eventVenue: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  eventSummary: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing[3],
  },
  meterContainer: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.sm,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[1.5],
  },
  meterLabel: {
    ...typography.caption,
    color: colors.neutral[700],
  },
  meterPct: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.primary[700],
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[600],
    borderRadius: 3,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[2.5],
  },
  publisherText: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  footerActionRow: {
    flexDirection: 'row',
    gap: spacing[2],
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
    marginBottom: spacing[3],
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
  categorySection: {
    marginBottom: spacing[3],
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  categoryChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
  },
  categoryChip: {
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.sm,
  },
  categoryChipSel: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.neutral[700],
  },
  categoryChipTextSel: {
    color: colors.neutral[0],
    fontWeight: '700',
  },
  twoCol: {
    flexDirection: 'row',
  },
  modalActions: {
    marginTop: spacing[4],
  },
  errorBox: {
    backgroundColor: colors.critical[50],
    borderWidth: 1,
    borderColor: colors.critical[200],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  errorText: {
    ...typography.bodySm,
    color: colors.critical[700],
  },
});
