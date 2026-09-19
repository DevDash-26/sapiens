import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Button, FormField } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { ContentCategory, Faculty, Programme, YearGroup } from '../../types/contract';

const CATEGORIES: Array<{ id: ContentCategory; label: string }> = [
  { id: 'academic', label: 'Academic & Exams' },
  { id: 'admin', label: 'Administrative & Registrar' },
  { id: 'finance', label: 'Fee & Scholarships' },
  { id: 'general', label: 'Campus General' },
];

const FACULTIES: Faculty[] = ['FOC', 'FOB', 'FOE'];
const PROGRAMMES: Programme[] = ['BSC-SE', 'BSC-CS', 'BBA', 'BENG-CE'];
const YEARS: YearGroup[] = [1, 2, 3, 4];

export const AnnouncementComposerScreen: React.FC = () => {
  const { goBack, navigate, createContent, currentUser } = useNavigation();

  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ContentCategory>('academic');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [summary, setSummary] = useState<string>('');
  const [body, setBody] = useState<string>('');

  // Audience Target Matrix
  const [isUniWide, setIsUniWide] = useState<boolean>(false);
  const [selectedFaculties, setSelectedFaculties] = useState<Faculty[]>(['FOC']);
  const [selectedProgrammes, setSelectedProgrammes] = useState<Programme[]>(['BSC-SE']);
  const [selectedYears, setSelectedYears] = useState<YearGroup[]>([2]);

  const [department, setDepartment] = useState<string>(
    currentUser.department || 'Faculty of Computing'
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedDoc, setPublishedDoc] = useState<any | null>(null);

  const toggleFaculty = (f: Faculty) => {
    setSelectedFaculties((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const toggleProgramme = (p: Programme) => {
    setSelectedProgrammes((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const toggleYear = (y: YearGroup) => {
    setSelectedYears((prev) =>
      prev.includes(y) ? prev.filter((item) => item !== y) : [...prev, y]
    );
  };

  const handlePublish = () => {
    setError(null);
    if (!title.trim()) {
      setError('Please provide an announcement headline.');
      return;
    }
    if (!summary.trim()) {
      setError('Please provide a 1-line summary for cards.');
      return;
    }
    if (!body.trim()) {
      setError('Please provide the full notice text body.');
      return;
    }

    setLoading(true);
    try {
      const newContent = createContent({
        type: 'announcement',
        category,
        title: title.trim(),
        summary: summary.trim(),
        body: body.trim(),
        imageUrl: null,
        tags: ['official', category, ...selectedFaculties],
        audience: {
          all: isUniWide,
          faculties: isUniWide ? [] : selectedFaculties,
          programmes: isUniWide ? [] : selectedProgrammes,
          years: isUniWide ? [] : selectedYears,
        },
        priority,
        pinned: priority === 'high',
        status: 'published',
        publishAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
        startsAt: null,
        endsAt: null,
        allDay: false,
        venue: null,
        origin: 'official',
        societyId: null,
        capacity: null,
        link: null,
        details: {},
        author: {
          uid: currentUser.id,
          name: currentUser.displayName,
          role: currentUser.role,
        },
        source: {
          department: department.trim() || currentUser.department || 'Facilities & Operations',
          verified: true,
        },
      });

      setLoading(false);
      setPublishedDoc(newContent);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to publish announcement.');
    }
  };

  const handleComposeAnother = () => {
    setPublishedDoc(null);
    setTitle('');
    setSummary('');
    setBody('');
    setError(null);
  };

  if (publishedDoc) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.successIconBox}>
            <Text style={styles.successEmoji}>📢</Text>
          </View>
          <Text style={styles.successTitle}>Official Notice Published!</Text>
          <Text style={styles.successBody}>
            "{publishedDoc.title}" is now live in the student announcements feed and sent to matching student cohorts.
          </Text>

          <View style={styles.ticketSummaryBox}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Scope:</Text>
              <Text style={styles.ticketValue}>
                {publishedDoc.audience.all
                  ? 'University-Wide (All Students)'
                  : `${publishedDoc.audience.faculties.join(', ')} · ${publishedDoc.audience.programmes.join(', ')} (Y${publishedDoc.audience.years.join(',')})`}
              </Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Priority:</Text>
              <Text style={styles.ticketValue}>{publishedDoc.priority.toUpperCase()}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Publisher:</Text>
              <Text style={styles.ticketValue}>{publishedDoc.source.department}</Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <Button
              title="View in Announcements Feed"
              variant="primary"
              size="lg"
              onPress={() => navigate('announcements_feed')}
              style={{ marginBottom: spacing[3] }}
            />
            <Button
              title="+ Compose Another Notice"
              variant="outline"
              size="md"
              onPress={handleComposeAnother}
              style={{ marginBottom: spacing[3] }}
            />
            <Button
              title="Return to Staff Console"
              variant="secondary"
              size="md"
              onPress={() => navigate('staff_dashboard')}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Attribution Bar */}
        <View style={styles.authorBar}>
          <Text style={styles.authorLabel}>Publishing as:</Text>
          <Text style={styles.authorName}>
            {currentUser.displayName} ({department})
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Category & Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category & Channel</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Priority Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority & Push Notification</Text>
          <View style={styles.priorityRow}>
            <TouchableOpacity
              style={[styles.priorityBtn, priority === 'normal' && styles.priorityBtnActive]}
              onPress={() => setPriority('normal')}
              activeOpacity={0.8}
            >
              <Text style={[styles.priorityText, priority === 'normal' && styles.priorityTextActive]}>
                Standard Feed Notice
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.priorityBtn, priority === 'high' && styles.priorityBtnUrgent]}
              onPress={() => setPriority('high')}
              activeOpacity={0.8}
            >
              <Text style={[styles.priorityText, priority === 'high' && styles.priorityTextUrgent]}>
                🚨 High Priority (Push & Pin)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <FormField
          label="Announcement Headline"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Database Systems lab relocated to Lab 3"
        />

        {/* 1-Line Summary */}
        <FormField
          label={`1-Line Card Summary (${summary.length}/160 chars)`}
          value={summary}
          onChangeText={setSummary}
          maxLength={160}
          placeholder="e.g. From Monday 21 Sep, Year 2 SE practicals will be held in Lab 3."
          helper="Displayed on mobile feed cards before expanding."
        />

        {/* Markdown Body */}
        <FormField
          label="Full Announcement Body (Markdown supported)"
          value={body}
          onChangeText={setBody}
          placeholder="Enter complete instructions, requirements, room directions..."
          multiline
          numberOfLines={6}
        />

        {/* Target Audience Matrix */}
        <View style={styles.audienceSection}>
          <View style={styles.audienceHeader}>
            <Text style={styles.sectionTitle}>Target Cohort & Audience</Text>
            <View style={styles.switchBox}>
              <Text style={styles.switchLabel}>Uni-wide:</Text>
              <Switch value={isUniWide} onValueChange={setIsUniWide} />
            </View>
          </View>

          {!isUniWide ? (
            <View style={styles.targetingBox}>
              {/* Faculties */}
              <Text style={styles.subLabel}>Target Faculties:</Text>
              <View style={styles.subChipRow}>
                {FACULTIES.map((f) => {
                  const sel = selectedFaculties.includes(f);
                  return (
                    <TouchableOpacity
                      key={f}
                      style={[styles.subChip, sel && styles.subChipSelected]}
                      onPress={() => toggleFaculty(f)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.subChipText, sel && styles.subChipTextSelected]}>{f}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Programmes */}
              <Text style={styles.subLabel}>Programmes:</Text>
              <View style={styles.subChipRow}>
                {PROGRAMMES.map((p) => {
                  const sel = selectedProgrammes.includes(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.subChip, sel && styles.subChipSelected]}
                      onPress={() => toggleProgramme(p)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.subChipText, sel && styles.subChipTextSelected]}>{p}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Year Groups */}
              <Text style={styles.subLabel}>Year Groups:</Text>
              <View style={styles.subChipRow}>
                {YEARS.map((y) => {
                  const sel = selectedYears.includes(y);
                  return (
                    <TouchableOpacity
                      key={y}
                      style={[styles.subChip, sel && styles.subChipSelected]}
                      onPress={() => toggleYear(y)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.subChipText, sel && styles.subChipTextSelected]}>
                        Year {y}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.uniWideBanner}>
              <Text style={styles.uniWideText}>
                🌍 This announcement will be visible to all faculties, programmes, and year groups.
              </Text>
            </View>
          )}
        </View>

        {/* Submit */}
        <View style={styles.actionContainer}>
          <Button
            title={loading ? 'Publishing to Student Hub...' : 'Publish Announcement Now'}
            variant="primary"
            size="lg"
            onPress={handlePublish}
            disabled={loading}
          />
        </View>
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
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  authorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    padding: spacing[3],
    borderRadius: radius.md,
    marginBottom: spacing[4],
  },
  authorLabel: {
    ...typography.caption,
    color: colors.primary[800],
    marginRight: spacing[1.5],
  },
  authorName: {
    ...typography.labelSm,
    color: colors.primary[950],
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: colors.critical[50],
    borderWidth: 1,
    borderColor: colors.critical[200],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    ...typography.bodySm,
    color: colors.critical[700],
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.labelSm,
    color: colors.neutral[800],
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  categoryChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.full,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  categoryChipText: {
    ...typography.labelSm,
    color: colors.neutral[700],
  },
  categoryChipTextSelected: {
    color: colors.neutral[0],
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  priorityBtn: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
  },
  priorityBtnActive: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  priorityBtnUrgent: {
    borderColor: colors.critical[500],
    backgroundColor: colors.critical[50],
  },
  priorityText: {
    ...typography.labelSm,
    color: colors.neutral[700],
  },
  priorityTextActive: {
    color: colors.primary[800],
    fontWeight: '700',
  },
  priorityTextUrgent: {
    color: colors.critical[800],
    fontWeight: '700',
  },
  audienceSection: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  audienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  switchLabel: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  targetingBox: {
    gap: spacing[2],
    marginTop: spacing[2],
  },
  subLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '700',
  },
  subChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
  },
  subChip: {
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.sm,
  },
  subChipSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  subChipText: {
    ...typography.caption,
    color: colors.neutral[700],
    fontWeight: '600',
  },
  subChipTextSelected: {
    color: colors.neutral[0],
  },
  uniWideBanner: {
    backgroundColor: colors.neutral[50],
    padding: spacing[3],
    borderRadius: radius.sm,
    marginTop: spacing[2],
  },
  uniWideText: {
    ...typography.caption,
    color: colors.neutral[700],
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: spacing[3],
  },
  // Success state
  successContent: {
    flex: 1,
    padding: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  successEmoji: {
    fontSize: 34,
  },
  successTitle: {
    ...typography.headlineMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  successBody: {
    ...typography.bodyMd,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing[5],
    lineHeight: 22,
  },
  ticketSummaryBox: {
    width: '100%',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[1.5],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  ticketLabel: {
    ...typography.bodySm,
    color: colors.neutral[500],
  },
  ticketValue: {
    ...typography.labelSm,
    color: colors.neutral[800],
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  successActions: {
    width: '100%',
  },
});
