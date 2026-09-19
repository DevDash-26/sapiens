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
import { ListRow } from '../../components/common/ListRow';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterChip } from '../../components/common/FilterChip';
import { EmptyState } from '../../components/common/EmptyState';
import { useNavigation } from '../../contexts/NavigationContext';

type OriginFilter = 'all' | 'official' | 'student' | 'guest_lecture';

export const EventsFeedScreen: React.FC = () => {
  const { navigate, contents, activeRole } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');

  const canCreateEvent = ['super_admin', 'admin', 'manager', 'academic_staff', 'society_rep'].includes(activeRole);

  // Filter only event and guest_lecture types
  const eventItems = contents.filter(
    (c) => (c.type === 'event' || c.type === 'guest_lecture') && c.status === 'published'
  );

  const filteredEvents = eventItems.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchVenue = (item.venue || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchVenue) return false;
    }

    if (originFilter === 'official') {
      if (item.origin !== 'official') return false;
    } else if (originFilter === 'student') {
      if (item.origin !== 'student') return false;
    } else if (originFilter === 'guest_lecture') {
      if (item.type !== 'guest_lecture') return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      {canCreateEvent && (
        <View style={styles.coordinatorBar}>
          <View style={styles.coordinatorInfo}>
            <Text style={styles.coordinatorTitle}>Event Coordinator Portal</Text>
            <Text style={styles.coordinatorSub}>Schedule new campus events, workshops & lectures</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigate('staff_event_management', { openCreate: true })}
            activeOpacity={0.8}
          >
            <Text style={styles.createBtnText}>+ New Event</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.filterHeader}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by event title, speaker, or venue..."
          style={styles.searchBar}
        />

        <View style={styles.chipsSection}>
          <Text style={styles.filterLabel}>EVENT TYPE & ORGANISER:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <FilterChip
              label="All Events"
              count={eventItems.length}
              active={originFilter === 'all'}
              onPress={() => setOriginFilter('all')}
            />
            <FilterChip
              label="Official University"
              active={originFilter === 'official'}
              onPress={() => setOriginFilter('official')}
            />
            <FilterChip
              label="Student Societies"
              active={originFilter === 'student'}
              onPress={() => setOriginFilter('student')}
            />
            <FilterChip
              label="Guest Lectures"
              active={originFilter === 'guest_lecture'}
              onPress={() => setOriginFilter('guest_lecture')}
            />
          </ScrollView>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No events found"
            description="There are currently no events matching your search criteria."
            actionTitle="Show all events"
            onActionPress={() => {
              setSearchQuery('');
              setOriginFilter('all');
            }}
          />
        ) : (
          filteredEvents.map((event) => {
            const isGuest = event.type === 'guest_lecture';
            const isOfficial = event.origin === 'official';
            const badgeLabel = isGuest
              ? 'GUEST LECTURE'
              : isOfficial
              ? 'OFFICIAL'
              : 'SOCIETY';
            const badgeVariant = isGuest
              ? 'academic'
              : isOfficial
              ? 'verified'
              : 'neutral';

            const dateStr = event.startsAt ? 'Thu, 24 Sep · 10:00 AM' : 'Upcoming';
            const subtitle = `${event.venue || 'Campus Main'} · ${event.summary}`;

            return (
              <ListRow
                key={event.id}
                title={event.title}
                subtitle={subtitle}
                meta={`${dateStr} · ${event.interestedCount} RSVP`}
                badgeLabel={badgeLabel}
                badgeVariant={badgeVariant}
                onPress={() => navigate('event_detail', { eventId: event.id })}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  coordinatorBar: {
    backgroundColor: colors.primary.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coordinatorInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  coordinatorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary.dark,
  },
  coordinatorSub: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 1,
  },
  createBtn: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  createBtnText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '700',
  },
  filterHeader: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  searchBar: {
    marginBottom: spacing.sm,
  },
  chipsSection: {
    marginTop: spacing.xs,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
});
