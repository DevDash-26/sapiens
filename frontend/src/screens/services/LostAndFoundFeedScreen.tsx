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
import { Tabs } from '../../components/common/Tabs';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useNavigation } from '../../contexts/NavigationContext';

type TabType = 'lost' | 'found';

export const LostAndFoundFeedScreen: React.FC = () => {
  const { navigate, requests } = useNavigation();

  const [activeTab, setActiveTab] = useState<TabType>('lost');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const lostItems = requests.filter((r) => r.type === 'lost');
  const foundItems = requests.filter((r) => r.type === 'found');

  const currentTabItems = activeTab === 'lost' ? lostItems : foundItems;

  const filteredItems = currentTabItems.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    if (categoryFilter !== 'all') {
      if (item.data?.itemCategory !== categoryFilter) return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Lost & Found Registry</Text>
            <Text style={styles.subtitle}>
              Report missing items or submit verified claims for found items (BR7).
            </Text>
          </View>
        </View>

        {/* Action Buttons: Report Lost / Report Found */}
        <View style={styles.actionButtonsRow}>
          <Button
            title="+ Report Lost Item"
            onPress={() => navigate('report_lost_item')}
            variant="outline"
            size="sm"
            style={{ flex: 1 }}
          />
          <Button
            title="+ Report Found Item"
            onPress={() => navigate('report_found_item')}
            variant="primary"
            size="sm"
            style={{ flex: 1, marginLeft: spacing.sm }}
          />
        </View>

        {/* Two-Tab Segment (Lost vs Found) */}
        <Tabs<TabType>
          tabs={[
            { id: 'lost', label: 'Lost Items', count: lostItems.length },
            { id: 'found', label: 'Found Items', count: foundItems.length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          style={styles.tabs}
        />

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab} items by name, color, or location...`}
          style={styles.searchBar}
        />

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <FilterChip
            label="All Categories"
            count={currentTabItems.length}
            active={categoryFilter === 'all'}
            onPress={() => setCategoryFilter('all')}
          />
          <FilterChip
            label="Electronics"
            active={categoryFilter === 'electronics'}
            onPress={() => setCategoryFilter('electronics')}
          />
          <FilterChip
            label="ID / Wallets"
            active={categoryFilter === 'id_card_wallet'}
            onPress={() => setCategoryFilter('id_card_wallet')}
          />
          <FilterChip
            label="Other Items"
            active={categoryFilter === 'other'}
            onPress={() => setCategoryFilter('other')}
          />
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} items found`}
            description="No reports match your current search or category filter."
            actionTitle="Reset filters"
            onActionPress={() => {
              setSearchQuery('');
              setCategoryFilter('all');
            }}
          />
        ) : (
          filteredItems.map((item) => {
            const isResolved = item.status === 'resolved';
            const badgeLabel = isResolved
              ? 'RESOLVED'
              : activeTab === 'found'
              ? 'FOUND'
              : 'LOST';

            const badgeVariant = isResolved
              ? 'active'
              : activeTab === 'found'
              ? 'verified'
              : 'critical';

            return (
              <ListRow
                key={item.id}
                title={item.title}
                subtitle={`${item.location || 'Campus'} · ${item.description}`}
                meta={`Reported by ${item.ownerName}`}
                badgeLabel={badgeLabel}
                badgeVariant={badgeVariant}
                onPress={() =>
                  navigate('item_detail_claim', { requestId: item.id })
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
  header: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  titleRow: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.neutral.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  tabs: {
    marginBottom: spacing.sm,
  },
  searchBar: {
    marginBottom: spacing.xs,
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
