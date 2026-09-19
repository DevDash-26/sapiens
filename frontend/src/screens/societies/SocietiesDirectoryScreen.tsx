import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { ListRow } from '../../components/common/ListRow';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterChip } from '../../components/common/FilterChip';
import { EmptyState } from '../../components/common/EmptyState';
import { useNavigation } from '../../contexts/NavigationContext';

export const SocietiesDirectoryScreen: React.FC = () => {
  const { navigate, societies } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredSocieties = societies.filter((soc) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = soc.name.toLowerCase().includes(q);
      const matchDesc = soc.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    if (categoryFilter !== 'all') {
      if (soc.category !== categoryFilter) return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.filterHeader}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search societies by club name or keyword..."
          style={styles.searchBar}
        />

        <View style={styles.chipsSection}>
          <Text style={styles.filterLabel}>CLUB CATEGORY:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <FilterChip
              label="All Societies"
              count={societies.length}
              active={categoryFilter === 'all'}
              onPress={() => setCategoryFilter('all')}
            />
            <FilterChip
              label="Technology"
              active={categoryFilter === 'technology'}
              onPress={() => setCategoryFilter('technology')}
            />
            <FilterChip
              label="Community"
              active={categoryFilter === 'community'}
              onPress={() => setCategoryFilter('community')}
            />
            <FilterChip
              label="Sports"
              active={categoryFilter === 'sports'}
              onPress={() => setCategoryFilter('sports')}
            />
            <FilterChip
              label="Arts"
              active={categoryFilter === 'arts'}
              onPress={() => setCategoryFilter('arts')}
            />
          </ScrollView>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSocieties.length === 0 ? (
          <EmptyState
            title="No societies found"
            description="Try changing your search keywords or resetting categories."
            actionTitle="Reset search"
            onActionPress={() => {
              setSearchQuery('');
              setCategoryFilter('all');
            }}
          />
        ) : (
          filteredSocieties.map((soc) => {
            const isMember = soc.viewer?.membership === 'approved';
            const isPending = soc.viewer?.membership === 'pending';

            const badgeLabel = isMember
              ? 'MEMBER'
              : isPending
              ? 'PENDING'
              : soc.category.toUpperCase();

            const badgeVariant = isMember
              ? 'active'
              : isPending
              ? 'warning'
              : 'academic';

            return (
              <ListRow
                key={soc.id}
                title={soc.name}
                subtitle={soc.description}
                meta={`${soc.memberCount} members · ${soc.joinMode === 'open' ? 'Open Join' : 'Approval Required'}`}
                badgeLabel={badgeLabel}
                badgeVariant={badgeVariant}
                onPress={() =>
                  navigate('society_detail', { societyId: soc.id })
                }
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
