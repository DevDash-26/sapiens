import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert as NativeAlert,
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

const OPPORTUNITY_CATEGORIES = [
  'all',
  'internship',
  'volunteering',
  'alumni',
  'job',
];

export const OpportunitiesBoardScreen: React.FC = () => {
  const { goBack, contents } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Content | null>(null);
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});

  const opportunities = useMemo(() => {
    return contents.filter((c) => c.type === 'opportunity');
  }, [contents]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.details?.company && item.details.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.details?.organisation && item.details.organisation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [opportunities, selectedCategory, searchQuery]);

  const handleApply = (opp: Content) => {
    setAppliedMap((prev) => ({ ...prev, [opp.id]: true }));
    if (opp.link) {
      Linking.openURL(opp.link).catch(() => {});
    } else {
      NativeAlert.alert(
        'Application Registered',
        'Your profile has been shared with the UCL Career Guidance Unit. An email confirmation has been dispatched.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Opportunities Board (BR18–20)"
        subtitle="Internships, Volunteering & Alumni Mentorship"
        showBack
        onBack={goBack}
      />

      {/* Career Banner */}
      <View style={styles.careerBanner}>
        <View style={styles.careerTextCol}>
          <Text style={styles.careerTag}>CAREER & DEVELOPMENT</Text>
          <Text style={styles.careerTitle}>Industry Placements & Volunteering</Text>
          <Text style={styles.careerDesc}>
            Vetted internships with tech partners, community service, and alumni mentorship.
          </Text>
        </View>
        <Text style={styles.careerIcon}>🚀</Text>
      </View>

      {/* Search & Category Filter Chips */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by role, company, skills..."
          onClear={() => setSearchQuery('')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {OPPORTUNITY_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={
                cat === 'all'
                  ? 'All Opportunities'
                  : cat === 'alumni'
                  ? 'Alumni Connect'
                  : cat.toUpperCase()
              }
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Opportunities List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredOpportunities.length === 0 ? (
          <EmptyState
            iconText="💼"
            title="No Opportunities Found"
            description="No active listings match your current search filters."
          />
        ) : (
          filteredOpportunities.map((item) => {
            const isApplied = appliedMap[item.id] || false;
            const company = item.details?.company || item.details?.organisation || item.details?.mentor || 'UCL Partner';
            const location = item.details?.location || item.details?.format || 'Colombo / Remote';
            const stipend = item.details?.stipend || item.details?.commitment;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => setSelectedOpportunity(item)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badgeGroup}>
                    <StatusBadge
                      status={
                        item.category === 'internship'
                          ? 'primary'
                          : item.category === 'volunteering'
                          ? 'success'
                          : 'warning'
                      }
                      label={item.category.toUpperCase()}
                    />
                    <Text style={styles.companyBadge}>{company}</Text>
                  </View>
                  <Text style={styles.locationBadge}>{location}</Text>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSummary}>{item.summary}</Text>

                <View style={styles.perksRow}>
                  {stipend && (
                    <Text style={styles.perkItem}>💵 {stipend}</Text>
                  )}
                  {item.details?.deadline && (
                    <Text style={styles.perkItem}>
                      ⏱️ Closes {new Date(item.details.deadline).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                <View style={styles.verifiedRow}>
                  <Text style={styles.verifiedSource}>
                    ✓ Verified by {item.source?.department || 'Career Services'}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.interestCount}>
                    👥 {item.interestedCount} Students Applied
                  </Text>
                  <TouchableOpacity
                    style={[styles.applyActionBtn, isApplied && styles.applyActionBtnActive]}
                    onPress={() => handleApply(item)}
                  >
                    <Text style={[styles.applyActionText, isApplied && styles.applyActionTextActive]}>
                      {isApplied ? '✓ Applied' : 'Apply Now →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Opportunity Detail Modal */}
      <Modal
        visible={!!selectedOpportunity}
        title="Opportunity Details"
        onClose={() => setSelectedOpportunity(null)}
      >
        {selectedOpportunity && (
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalBadgeRow}>
              <StatusBadge status="primary" label={selectedOpportunity.category.toUpperCase()} />
              <Text style={styles.modalSourceDept}>
                {selectedOpportunity.source?.department}
              </Text>
            </View>

            <Text style={styles.modalTitle}>{selectedOpportunity.title}</Text>
            <Text style={styles.modalLead}>{selectedOpportunity.summary}</Text>

            <View style={styles.modalDescBox}>
              <Text style={styles.modalDescText}>{selectedOpportunity.body}</Text>
            </View>

            {selectedOpportunity.details && (
              <View style={styles.modalDetailGrid}>
                <Text style={styles.modalDetailHeading}>Position Specifications:</Text>
                {Object.entries(selectedOpportunity.details).map(([k, v]) => (
                  <Text key={k} style={styles.modalDetailRow}>
                    • <Text style={{ fontWeight: '700' }}>{k.toUpperCase()}: </Text>
                    {String(v)}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.modalBtnRow}>
              <Button
                title={appliedMap[selectedOpportunity.id] ? '✓ Application Submitted' : 'Submit Application'}
                variant="primary"
                size="lg"
                onPress={() => handleApply(selectedOpportunity)}
                disabled={appliedMap[selectedOpportunity.id]}
                style={{ width: '100%' }}
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
  careerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[900],
    padding: spacing[4],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    borderRadius: radius.md,
  },
  careerTextCol: {
    flex: 1,
    marginRight: spacing[2],
  },
  careerTag: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary[400],
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  careerTitle: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.neutral[0],
    fontWeight: '800',
    marginBottom: 2,
  },
  careerDesc: {
    ...typography.caption,
    color: colors.neutral[400],
    lineHeight: 15,
  },
  careerIcon: {
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
    padding: spacing[4],
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
  companyBadge: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  locationBadge: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
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
    marginBottom: spacing[2],
  },
  perksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[3],
    paddingVertical: spacing[1.5],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    marginBottom: spacing[1.5],
  },
  perkItem: {
    ...typography.caption,
    color: colors.neutral[800],
    fontWeight: '600',
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
  interestCount: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  applyActionBtn: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary[600],
  },
  applyActionBtnActive: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[600],
  },
  applyActionText: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '700',
  },
  applyActionTextActive: {
    color: colors.success[700],
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
  modalSourceDept: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  modalTitle: {
    ...typography.headlineSm,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  modalLead: {
    ...typography.bodySm,
    color: colors.primary[800],
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: spacing[3],
  },
  modalDescBox: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  modalDescText: {
    ...typography.bodySm,
    color: colors.neutral[700],
    lineHeight: 22,
  },
  modalDetailGrid: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
    gap: spacing[1],
  },
  modalDetailHeading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: 2,
  },
  modalDetailRow: {
    ...typography.caption,
    color: colors.neutral[700],
  },
  modalBtnRow: {
    marginBottom: spacing[2],
  },
});
