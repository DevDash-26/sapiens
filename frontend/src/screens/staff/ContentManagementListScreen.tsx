import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { SearchBar, FilterChip, EmptyState, Button, StatusBadge } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { Content, ContentType, ContentStatus } from '../../types/contract';

const TYPE_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All Types' },
  { id: 'announcement', label: 'Notices' },
  { id: 'event', label: 'Events' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'info', label: 'Info Hub' },
  { id: 'opportunity', label: 'Opportunities' },
  { id: 'highlight', label: 'Highlights' },
];

const STATUS_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All Statuses' },
  { id: 'published', label: 'Published' },
  { id: 'pending_review', label: 'Pending Review' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'draft', label: 'Draft' },
];

export const ContentManagementListScreen: React.FC = () => {
  const { goBack, navigate, contents, deleteContent } = useNavigation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const authorMatch = item.author.name.toLowerCase().includes(q);
        const deptMatch = item.source.department.toLowerCase().includes(q);
        if (!titleMatch && !authorMatch && !deptMatch) return false;
      }
      return true;
    });
  }, [contents, selectedType, selectedStatus, searchQuery]);

  const handleDelete = (id: string, title: string) => {
    deleteContent(id);
  };

  const handlePreview = (item: Content) => {
    if (item.type === 'announcement') {
      navigate('announcement_detail', { noticeId: item.id });
    } else if (item.type === 'event' || item.type === 'guest_lecture') {
      navigate('event_detail', { eventId: item.id });
    } else {
      navigate('announcements_feed');
    }
  };

  return (
    <View style={styles.container}>
      {/* Content Quick Action Bar */}
      <View style={styles.actionStrip}>
        <TouchableOpacity
          style={styles.actionStripBtn}
          onPress={() => navigate('announcement_composer')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionStripBtnText}>+ Compose Notice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionStripBtn, styles.actionStripBtnSecondary]}
          onPress={() => navigate('staff_event_management', { openCreate: true })}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionStripBtnText, styles.actionStripBtnSecondaryText]}>+ Create Event</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Bar */}
      <View style={styles.filterSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, author, department..."
          onClear={() => setSearchQuery('')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {TYPE_FILTERS.map((t) => (
            <FilterChip
              key={t.id}
              label={t.label}
              selected={selectedType === t.id}
              onPress={() => setSelectedType(t.id)}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusChipScroll}
        >
          {STATUS_FILTERS.map((s) => (
            <FilterChip
              key={s.id}
              label={s.label}
              selected={selectedStatus === s.id}
              onPress={() => setSelectedStatus(s.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredContents.length === 0 ? (
          <EmptyState
            title="No Content Found"
            description="No items match your active search filters. Try selecting a different category or status."
            action={{
              label: 'Compose Announcement',
              onPress: () => navigate('announcement_composer'),
            }}
          />
        ) : (
          filteredContents.map((item) => {
            return (
              <View key={item.id} style={styles.contentRowCard}>
                <View style={styles.rowTop}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
                  </View>

                  <StatusBadge status={item.status} />
                </View>

                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.summaryText} numberOfLines={2}>
                  {item.summary}
                </Text>

                <View style={styles.metaStrip}>
                  <Text style={styles.metaItem}>
                    👤 {item.author.name} ({item.source.department})
                  </Text>
                  <Text style={styles.metaItem}>
                    🎯 {item.audience.all ? 'Uni-wide' : `${item.audience.faculties.join(',')} Y${item.audience.years.join(',')}`}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionFooter}>
                  <Text style={styles.versionText}>v{item.version} · {item.source.verified ? '✓ Verified' : 'Student Org'}</Text>
                  <View style={styles.actionBtnGroup}>
                    <TouchableOpacity
                      style={styles.previewBtn}
                      onPress={() => handlePreview(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.previewBtnText}>Live View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item.id, item.title)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.deleteBtnText}>Unpublish</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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
    backgroundColor: colors.neutral[50],
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  actionStrip: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
    backgroundColor: colors.neutral[0],
  },
  actionStripBtn: {
    flex: 1,
    backgroundColor: colors.primary[600],
    paddingVertical: spacing[2.5],
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionStripBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionStripBtnSecondary: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  actionStripBtnSecondaryText: {
    color: colors.neutral[800],
  },
  filterSection: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
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
  contentRowCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  typeBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2.5],
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.neutral[700],
  },
  contentTitle: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: 2,
  },
  summaryText: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing[3],
  },
  metaStrip: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.sm,
    padding: spacing[2.5],
    gap: 4,
    marginBottom: spacing[3],
  },
  metaItem: {
    ...typography.caption,
    fontSize: 11,
    color: colors.neutral[600],
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[2.5],
  },
  versionText: {
    ...typography.caption,
    color: colors.neutral[400],
    fontSize: 11,
  },
  actionBtnGroup: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  previewBtn: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.sm,
  },
  previewBtnText: {
    ...typography.caption,
    color: colors.primary[800],
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: colors.critical[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.sm,
  },
  deleteBtnText: {
    ...typography.caption,
    color: colors.critical[700],
    fontWeight: '700',
  },
});
