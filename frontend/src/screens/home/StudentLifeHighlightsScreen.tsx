import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import {
  Header,
  Button,
  StatusBadge,
  SearchBar,
  FilterChip,
  Modal,
  EmptyState,
} from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { Content } from '../../types/contract';

const HIGHLIGHT_CATEGORIES = [
  'all',
  'achievement',
  'past_event',
  'sports',
  'competitions',
];

export const StudentLifeHighlightsScreen: React.FC = () => {
  const { goBack, contents } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedHighlight, setSelectedHighlight] = useState<Content | null>(null);
  const [clappedItems, setClappedItems] = useState<Record<string, number>>({});

  const highlights = useMemo(() => {
    return contents.filter((c) => c.type === 'highlight');
  }, [contents]);

  const filteredHighlights = useMemo(() => {
    return highlights.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [highlights, selectedCategory, searchQuery]);

  const handleClap = (id: string, e?: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    setClappedItems((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleShare = async (item: Content, e?: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    try {
      await Share.share({
        title: item.title,
        message: `${item.title} — ${item.summary} | UCL Campus Hub: ${item.shareUrl}`,
      });
    } catch (err) {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Student Life Highlights (BR32)"
        subtitle="Achievements, Competitions & Campus Life"
        showBack
        onBack={goBack}
      />

      {/* Hero Showcase Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroTextCol}>
          <Text style={styles.heroPreTitle}>CAMPUS PROOF OF LIFE</Text>
          <Text style={styles.heroTitle}>Celebrating UCL Student Excellence</Text>
          <Text style={styles.heroDesc}>
            Discover hackathon victories, society showcases, and campus community milestones.
          </Text>
        </View>
        <Text style={styles.heroTrophy}>🏆</Text>
      </View>

      {/* Search & Category Filter Chips */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search achievements, hackathons, sports..."
          onClear={() => setSearchQuery('')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {HIGHLIGHT_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat === 'all' ? 'All Highlights' : cat.replace('_', ' ').toUpperCase()}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Highlights List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredHighlights.length === 0 ? (
          <EmptyState
            iconText="🌟"
            title="No Highlights Found"
            description="No student achievement recaps match your search query."
          />
        ) : (
          filteredHighlights.map((item) => {
            const claps = (item.interestedCount || 0) + (clappedItems[item.id] || 0);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => setSelectedHighlight(item)}
                activeOpacity={0.8}
              >
                {/* Visual Header Strip */}
                <View style={styles.visualStrip}>
                  <Text style={styles.stripEmoji}>
                    {item.category === 'achievement'
                      ? '🥇'
                      : item.category === 'sports'
                      ? '🏸'
                      : '🎪'}
                  </Text>
                  <View style={styles.stripTag}>
                    <Text style={styles.stripTagText}>
                      {item.category.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.stripDate}>
                    {new Date(item.publishAt || item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSummary}>{item.summary}</Text>

                  {item.details?.award && (
                    <View style={styles.awardBadgeBox}>
                      <Text style={styles.awardBadgeText}>
                        🎖️ {item.details.award} · {item.details.prize}
                      </Text>
                    </View>
                  )}

                  <View style={styles.verifiedRow}>
                    <Text style={styles.verifiedSource}>
                      ✓ Verified by {item.source?.department || 'Student Affairs'}
                    </Text>
                  </View>

                  {/* Footer Interactive Actions */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.clapBtn}
                      onPress={(e) => handleClap(item.id, e)}
                    >
                      <Text style={styles.clapEmoji}>👏</Text>
                      <Text style={styles.clapCount}>{claps} Cheers</Text>
                    </TouchableOpacity>

                    <View style={styles.footerRight}>
                      <TouchableOpacity
                        style={styles.shareBtn}
                        onPress={(e) => handleShare(item, e)}
                      >
                        <Text style={styles.shareText}>📤 Share</Text>
                      </TouchableOpacity>
                      <Text style={styles.readMoreText}>Read Story →</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Story Detail Modal */}
      <Modal
        visible={!!selectedHighlight}
        title="Student Life Story"
        onClose={() => setSelectedHighlight(null)}
      >
        {selectedHighlight && (
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalBadgeRow}>
              <StatusBadge status="success" label={selectedHighlight.category.toUpperCase()} />
              <Text style={styles.modalDate}>
                {new Date(selectedHighlight.publishAt || selectedHighlight.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.modalTitle}>{selectedHighlight.title}</Text>
            <Text style={styles.modalSummaryLead}>{selectedHighlight.summary}</Text>

            <View style={styles.modalBodyText}>
              <Text style={styles.modalBodyContent}>{selectedHighlight.body}</Text>
            </View>

            {selectedHighlight.details && Object.keys(selectedHighlight.details).length > 0 && (
              <View style={styles.modalDetailsBox}>
                <Text style={styles.modalDetailsHeading}>Recognition & Key Metrics:</Text>
                {Object.entries(selectedHighlight.details).map(([k, v]) => (
                  <Text key={k} style={styles.modalDetailRow}>
                    • <Text style={{ fontWeight: '700' }}>{k.toUpperCase()}: </Text>
                    {String(v)}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.modalActionRow}>
              <Button
                title={`👏 Send Cheer (${(selectedHighlight.interestedCount || 0) + (clappedItems[selectedHighlight.id] || 0)})`}
                variant="primary"
                size="md"
                onPress={() => handleClap(selectedHighlight.id)}
                style={{ flex: 1.2 }}
              />
              <Button
                title="Share Story"
                variant="outline"
                size="md"
                onPress={() => handleShare(selectedHighlight)}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
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
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary[900],
    padding: spacing[4],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    borderRadius: radius.md,
  },
  heroTextCol: {
    flex: 1,
    marginRight: spacing[2],
  },
  heroPreTitle: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary[300],
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroTitle: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.neutral[0],
    fontWeight: '800',
    marginBottom: 2,
  },
  heroDesc: {
    ...typography.caption,
    color: colors.neutral[300],
    lineHeight: 15,
  },
  heroTrophy: {
    fontSize: 32,
  },
  searchSection: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
  },
  filterScroll: {
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
    gap: spacing[3.5],
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
  visualStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[3.5],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  stripEmoji: {
    fontSize: 18,
    marginRight: spacing[2],
  },
  stripTag: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  stripTagText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  stripDate: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
    marginLeft: 'auto',
  },
  cardBody: {
    padding: spacing[4],
  },
  cardTitle: {
    ...typography.bodyMd,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: spacing[1],
    lineHeight: 20,
  },
  cardSummary: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing[2.5],
  },
  awardBadgeBox: {
    backgroundColor: colors.warning[50],
    borderRadius: radius.xs,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1.5],
    marginBottom: spacing[2],
    borderLeftWidth: 3,
    borderLeftColor: colors.warning[600],
  },
  awardBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.warning[900],
    fontSize: 11,
  },
  verifiedRow: {
    marginBottom: spacing[2],
  },
  verifiedSource: {
    ...typography.caption,
    color: colors.primary[700],
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
  clapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  clapEmoji: {
    fontSize: 14,
    marginRight: spacing[1],
  },
  clapCount: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[800],
    fontSize: 11,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2.5],
  },
  shareBtn: {
    paddingVertical: spacing[1],
  },
  shareText: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  readMoreText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[600],
  },
  modalScroll: {
    maxHeight: 440,
  },
  modalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  modalDate: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  modalTitle: {
    ...typography.headlineSm,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: spacing[1.5],
  },
  modalSummaryLead: {
    ...typography.bodySm,
    color: colors.primary[800],
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: spacing[2.5],
  },
  modalBodyText: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  modalBodyContent: {
    ...typography.bodySm,
    color: colors.neutral[700],
    lineHeight: 22,
  },
  modalDetailsBox: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
    gap: spacing[1],
  },
  modalDetailsHeading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: 2,
  },
  modalDetailRow: {
    ...typography.caption,
    color: colors.neutral[700],
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
});
