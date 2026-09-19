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

type ScopeFilter = 'all' | 'targeted' | 'university';
type CategoryFilter = 'all' | 'academic' | 'finance' | 'general' | 'library';

export const AnnouncementsFeedScreen: React.FC = () => {
  const { navigate, contents, currentUser, activeRole } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const canPublishNotice = ['super_admin', 'admin', 'manager', 'academic_staff', 'finance_staff'].includes(activeRole);

  // Filter only announcement/info items
  const baseItems = contents.filter(
    (c) =>
      (c.type === 'announcement' || c.type === 'info') &&
      c.status === 'published'
  );

  const filteredItems = baseItems.filter((item) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchDept = item.source.department.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchDept) return false;
    }

    // Scope filter
    if (scopeFilter === 'targeted') {
      if (item.audience.all) return false;
      const facMatch =
        item.audience.faculties.length === 0 ||
        (currentUser.faculty &&
          item.audience.faculties.includes(currentUser.faculty));
      if (!facMatch) return false;
    } else if (scopeFilter === 'university') {
      if (!item.audience.all) return false;
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (item.category !== categoryFilter) return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      {canPublishNotice && (
        <View style={styles.publisherBar}>
          <View style={styles.publisherInfo}>
            <Text style={styles.publisherTitle}>Official Notice Publisher</Text>
            <Text style={styles.publisherSub}>Target and broadcast notices to student cohorts</Text>
          </View>
          <TouchableOpacity
            style={styles.composeBtn}
            onPress={() => navigate('announcement_composer')}
            activeOpacity={0.8}
          >
            <Text style={styles.composeBtnText}>+ Compose Notice</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.filterHeader}>
        {/* Search Input */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Filter by keyword, school, or topic..."
          style={styles.searchBar}
        />

        {/* Scope Filter Chips */}
        <View style={styles.chipsSection}>
          <Text style={styles.filterLabel}>AUDIENCE SCOPE:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <FilterChip
              label="All Notices"
              count={baseItems.length}
              active={scopeFilter === 'all'}
              onPress={() => setScopeFilter('all')}
            />
            <FilterChip
              label="Targeted to me"
              active={scopeFilter === 'targeted'}
              onPress={() => setScopeFilter('targeted')}
            />
            <FilterChip
              label="University-wide"
              active={scopeFilter === 'university'}
              onPress={() => setScopeFilter('university')}
            />
          </ScrollView>
        </View>

        {/* Category Filter Chips */}
        <View style={styles.chipsSection}>
          <Text style={styles.filterLabel}>CATEGORY:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <FilterChip
              label="All"
              active={categoryFilter === 'all'}
              onPress={() => setCategoryFilter('all')}
            />
            <FilterChip
              label="Academic"
              active={categoryFilter === 'academic'}
              onPress={() => setCategoryFilter('academic')}
            />
            <FilterChip
              label="Finance"
              active={categoryFilter === 'finance'}
              onPress={() => setCategoryFilter('finance')}
            />
            <FilterChip
              label="Library"
              active={categoryFilter === 'library'}
              onPress={() => setCategoryFilter('library')}
            />
          </ScrollView>
        </View>
      </View>

      {/* Announcements List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <EmptyState
            title="No announcements match criteria"
            description="Try changing your search query or adjusting audience scope."
            actionTitle="Reset filters"
            onActionPress={() => {
              setSearchQuery('');
              setScopeFilter('all');
              setCategoryFilter('all');
            }}
          />
        ) : (
          filteredItems.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              subtitle={item.summary}
              meta={item.audience.all ? 'University-wide' : 'Targeted Cohort'}
              badgeLabel={item.source.department}
              badgeVariant={item.audience.all ? 'verified' : 'targeted'}
              onPress={() =>
                navigate('announcement_detail', { announcementId: item.id })
              }
            />
          ))
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
  publisherBar: {
    backgroundColor: colors.primary.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  publisherInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  publisherTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary.dark,
  },
  publisherSub: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 1,
  },
  composeBtn: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  composeBtnText: {
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
    marginBottom: spacing.xs,
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
