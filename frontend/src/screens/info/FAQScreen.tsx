import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, SearchBar, FilterChip, EmptyState, Button } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { FAQ } from '../../types/contract';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'academic', label: 'Academic & Exams' },
  { id: 'general', label: 'General & Campus ID' },
  { id: 'services', label: 'Room & Facilities' },
  { id: 'it_support', label: 'IT & Wi-Fi' },
  { id: 'finance', label: 'Finance & Aid' },
];

export const FAQScreen: React.FC = () => {
  const { goBack, navigate, faqs, voteFAQ } = useNavigation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['faq_01']));
  const [votedMap, setVotedMap] = useState<Record<string, 'up' | 'down'>>({});

  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      if (selectedCategory !== 'all' && faq.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const qMatch = faq.question.toLowerCase().includes(q);
        const aMatch = faq.answer.toLowerCase().includes(q);
        const kMatch = faq.keywords.some((k) => k.toLowerCase().includes(q));
        if (!qMatch && !aMatch && !kMatch) return false;
      }
      return true;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleVote = (id: string, isHelpful: boolean) => {
    if (votedMap[id]) return;
    setVotedMap((prev) => ({ ...prev, [id]: isHelpful ? 'up' : 'down' }));
    voteFAQ(id, isHelpful);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Frequently Asked Questions"
        showBack
        onBack={goBack}
        rightAction={{
          label: '🤖 Ask AI',
          onPress: () => navigate('ai_assistant'),
        }}
      />

      {/* Search Bar & Category Chips */}
      <View style={styles.filterSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search campus policies, procedures..."
          onClear={() => setSearchQuery('')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {FAQ_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.label}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* AI Prompt Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => navigate('ai_assistant')}
          activeOpacity={0.8}
        >
          <View style={styles.aiBannerLeft}>
            <Text style={styles.aiBannerTitle}>Can't find what you're looking for?</Text>
            <Text style={styles.aiBannerSubtitle}>
              Ask our grounded AI Assistant for instant personalized answers.
            </Text>
          </View>
          <Text style={styles.aiBannerArrow}>Ask AI →</Text>
        </TouchableOpacity>

        {filteredFAQs.length === 0 ? (
          <EmptyState
            title="No FAQs Found"
            description="No matching answers found for your query. Try searching with different terms or ask the AI assistant."
            action={{
              label: 'Ask AI Campus Assistant',
              onPress: () => navigate('ai_assistant'),
            }}
          />
        ) : (
          filteredFAQs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);
            const userVote = votedMap[faq.id];

            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.questionRow}
                  onPress={() => toggleExpand(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.questionText}>{faq.question}</Text>
                  <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.answerSection}>
                    <Text style={styles.answerText}>{faq.answer}</Text>

                    {/* Source & Verified Attribution */}
                    <View style={styles.metaRow}>
                      <Text style={styles.sourceText}>
                        ✓ Verified by {faq.source.department}
                      </Text>

                      {/* Vote Helpful Buttons */}
                      <View style={styles.voteRow}>
                        <Text style={styles.votePrompt}>Helpful?</Text>
                        <TouchableOpacity
                          style={[styles.voteBtn, userVote === 'up' && styles.voteBtnActive]}
                          onPress={() => handleVote(faq.id, true)}
                          disabled={!!userVote}
                        >
                          <Text style={styles.voteText}>👍 {faq.helpfulCount}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.voteBtn, userVote === 'down' && styles.voteBtnActive]}
                          onPress={() => handleVote(faq.id, false)}
                          disabled={!!userVote}
                        >
                          <Text style={styles.voteText}>👎 {faq.unhelpfulCount}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
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
  filterSection: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  chipScroll: {
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary[600],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  aiBannerLeft: {
    flex: 1,
    marginRight: spacing[2],
  },
  aiBannerTitle: {
    ...typography.labelSm,
    color: colors.neutral[0],
    fontWeight: '700',
    marginBottom: 2,
  },
  aiBannerSubtitle: {
    ...typography.caption,
    color: colors.primary[100],
  },
  aiBannerArrow: {
    ...typography.labelSm,
    color: colors.neutral[0],
    fontWeight: '800',
  },
  faqCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    marginBottom: spacing[3],
    overflow: 'hidden',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },
  questionText: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '700',
    flex: 1,
    marginRight: spacing[2],
    lineHeight: 18,
  },
  expandIcon: {
    fontSize: 20,
    color: colors.primary[600],
    fontWeight: '800',
  },
  answerSection: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[3],
  },
  answerText: {
    ...typography.bodySm,
    color: colors.neutral[700],
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[2.5],
  },
  sourceText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary[700],
    fontWeight: '600',
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  votePrompt: {
    ...typography.caption,
    fontSize: 11,
    color: colors.neutral[400],
  },
  voteBtn: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: radius.sm,
  },
  voteBtnActive: {
    backgroundColor: colors.primary[100],
  },
  voteText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.neutral[700],
    fontWeight: '600',
  },
});
