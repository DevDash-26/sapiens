import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert as NativeAlert,
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
import { FAQ } from '../../types/contract';

const FAQ_CATEGORIES = [
  'all',
  'academic',
  'admissions',
  'exams',
  'it',
  'library',
  'finance',
];

export const FAQManagementScreen: React.FC = () => {
  const { goBack, faqs, createFAQ, updateFAQ, deleteFAQ } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeFAQ, setActiveFAQ] = useState<FAQ | null>(null);

  // Form State
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState('academic');
  const [formKeywords, setFormKeywords] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formDept, setFormDept] = useState('Registrar Office');

  const filteredFAQs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const handleOpenCreate = () => {
    setActiveFAQ(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormCategory('academic');
    setFormKeywords('transcript, records, registrar');
    setFormStatus('published');
    setFormDept('Registrar Office');
    setModalMode('create');
  };

  const handleOpenEdit = (faq: FAQ) => {
    setActiveFAQ(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category);
    setFormKeywords(faq.keywords.join(', '));
    setFormStatus(faq.status);
    setFormDept(faq.source?.department || 'Academic Affairs');
    setModalMode('edit');
  };

  const handleSave = () => {
    if (!formQuestion.trim() || !formAnswer.trim()) {
      NativeAlert.alert('Incomplete FAQ', 'Please provide both a question and a clear official answer.');
      return;
    }

    const keywordList = formKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (modalMode === 'create') {
      createFAQ({
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        category: formCategory,
        keywords: keywordList,
        order: faqs.length + 1,
        status: formStatus,
        source: {
          department: formDept.trim() || 'Registrar Office',
          verified: true,
        },
      });
    } else if (modalMode === 'edit' && activeFAQ) {
      updateFAQ(activeFAQ.id, {
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        category: formCategory,
        keywords: keywordList,
        status: formStatus,
        source: {
          department: formDept.trim() || activeFAQ.source?.department || 'Registrar Office',
          verified: true,
        },
      });
    }

    setModalMode(null);
  };

  const handleDelete = (faqId: string) => {
    deleteFAQ(faqId);
    setModalMode(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Action Strip */}
      <View style={styles.actionStrip}>
        <View style={styles.actionStripLeft}>
          <Text style={styles.actionStripTitle}>FAQ & Knowledgebase Admin</Text>
          <Text style={styles.actionStripSub}>Authoritative corpus grounding the OpenAI Assistant</Text>
        </View>
        <TouchableOpacity
          style={styles.actionStripBtn}
          onPress={handleOpenCreate}
          activeOpacity={0.8}
        >
          <Text style={styles.actionStripBtnText}>+ Add FAQ</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Category Filter */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search question, keyword, topic..."
          onClear={() => setSearchQuery('')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FAQ_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat === 'all' ? 'All Topics' : cat.toUpperCase()}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* FAQ Cards */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredFAQs.length === 0 ? (
          <EmptyState
            iconText="❓"
            title="No FAQs Found"
            description="No FAQs match your search query or selected topic category."
          />
        ) : (
          filteredFAQs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.card}
              onPress={() => handleOpenEdit(faq)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badgeGroup}>
                  <StatusBadge
                    status={faq.status === 'published' ? 'success' : 'neutral'}
                    label={faq.status.toUpperCase()}
                  />
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{faq.category.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.faqId}>{faq.id}</Text>
              </View>

              <Text style={styles.questionText}>{faq.question}</Text>
              <Text style={styles.answerText} numberOfLines={2}>{faq.answer}</Text>

              <View style={styles.feedbackMetricsRow}>
                <Text style={styles.metricText}>👍 {faq.helpfulCount} helpful</Text>
                <Text style={styles.metricText}>👎 {faq.unhelpfulCount} unhelpful</Text>
                <Text style={styles.verifiedBy}>✓ {faq.source?.department || 'Verified'}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.keywordsPreview} numberOfLines={1}>
                  🏷️ {faq.keywords.join(' · ')}
                </Text>
                <Text style={styles.editAction}>Edit →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={!!modalMode}
        title={modalMode === 'create' ? 'Create Official Campus FAQ' : 'Edit Campus FAQ'}
        onClose={() => setModalMode(null)}
      >
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.fieldLabel}>QUESTION *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. How do I request an official academic transcript?"
            value={formQuestion}
            onChangeText={setFormQuestion}
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing[3] }]}>
            OFFICIAL ANSWER (STUDENT-FACING) *
          </Text>
          <TextInput
            style={[styles.input, { minHeight: 90, textAlignVertical: 'top' }]}
            placeholder="Provide accurate, step-by-step instructions with room numbers and deadlines..."
            value={formAnswer}
            onChangeText={setFormAnswer}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing[3] }]}>CATEGORY</Text>
          <View style={styles.categoryPickerRow}>
            {['academic', 'admissions', 'exams', 'it', 'library', 'finance'].map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.categoryPickerBtn,
                  formCategory === c && styles.categoryPickerBtnActive,
                ]}
                onPress={() => setFormCategory(c)}
              >
                <Text
                  style={[
                    styles.categoryPickerText,
                    formCategory === c && styles.categoryPickerTextActive,
                  ]}
                >
                  {c.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { marginTop: spacing[3] }]}>
            KEYWORDS (COMMA SEPARATED FOR AI SEARCH)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. transcript, exam results, registrar, gpa"
            value={formKeywords}
            onChangeText={setFormKeywords}
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing[3] }]}>
            VERIFYING DEPARTMENT
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Registrar Office / Examination Unit"
            value={formDept}
            onChangeText={setFormDept}
          />

          <View style={styles.modalBtnRow}>
            {modalMode === 'edit' && activeFAQ && (
              <Button
                title="Delete"
                variant="outline"
                size="md"
                onPress={() => handleDelete(activeFAQ.id)}
                style={{ flex: 1, borderColor: colors.critical[500] }}
              />
            )}
            <Button
              title="Cancel"
              variant="outline"
              size="md"
              onPress={() => setModalMode(null)}
              style={{ flex: 1 }}
            />
            <Button
              title="Save FAQ"
              variant="primary"
              size="md"
              onPress={handleSave}
              style={{ flex: 1.5 }}
            />
          </View>
        </ScrollView>
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
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2.5],
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  actionStripLeft: {
    flex: 1,
    marginRight: spacing[2],
  },
  actionStripTitle: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: 2,
  },
  actionStripSub: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  actionStripBtn: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
  },
  actionStripBtnText: {
    ...typography.caption,
    color: '#ffffff',
    fontWeight: '700',
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
  categoryChip: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  categoryChipText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  faqId: {
    ...typography.caption,
    fontFamily: 'monospace',
    fontSize: 10,
    color: colors.neutral[400],
  },
  questionText: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  answerText: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing[2],
  },
  feedbackMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[1],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    marginBottom: spacing[1],
  },
  metricText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.neutral[600],
  },
  verifiedBy: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary[700],
    fontWeight: '600',
    marginLeft: 'auto',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[1.5],
  },
  keywordsPreview: {
    ...typography.caption,
    color: colors.neutral[400],
    fontSize: 10,
    flex: 1,
    marginRight: spacing[2],
  },
  editAction: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[600],
  },
  modalScroll: {
    maxHeight: 440,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[700],
    letterSpacing: 0.5,
    marginBottom: spacing[1.5],
  },
  input: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[3],
    ...typography.bodySm,
    color: colors.neutral[900],
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  categoryPickerBtn: {
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  categoryPickerBtnActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  categoryPickerText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  categoryPickerTextActive: {
    color: colors.primary[700],
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
});
