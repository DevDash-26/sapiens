import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'Academics',
    question: 'How do I register for semester examinations?',
    answer: 'Examination registration is automated through the student academic portal. Make sure your financial clearances are completed before the examination registration deadline.',
  },
  {
    id: '2',
    category: 'Finance',
    question: 'Where can I view tuition payment receipts and balance?',
    answer: 'Head to the Finance section in your student profile. Installment plans and payment verification are handled by the finance staff.',
  },
  {
    id: '3',
    category: 'Campus & Safety',
    question: 'How will I receive emergency alerts?',
    answer: 'Critical safety announcements are broadcast directly to your registered mobile phone number via Text.lk SMS, alongside in-app emergency banners.',
  },
  {
    id: '4',
    category: 'Clubs & Societies',
    question: 'How do I join a university society or club?',
    answer: 'Explore the clubs section on the portal. You can register for clubs, attend events, and contact society representatives directly.',
  },
];

export const FAQScreen: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Frequently Asked Questions</Text>
      <Text style={styles.subtext}>Find instant answers to common campus inquiries.</Text>

      {FAQS_DATA.map((faq) => {
        const isExpanded = expandedId === faq.id;
        return (
          <TouchableOpacity
            key={faq.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => toggleExpand(faq.id)}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{faq.category}</Text>
            </View>
            <View style={styles.questionRow}>
              <Text style={styles.questionText}>{faq.question}</Text>
              <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
            </View>
            {isExpanded && <Text style={styles.answerText}>{faq.answer}</Text>}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    color: '#9e1217',
    fontWeight: '600',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    paddingRight: 8,
  },
  chevron: {
    fontSize: 12,
    color: '#94a3b8',
  },
  answerText: {
    marginTop: 10,
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
});
