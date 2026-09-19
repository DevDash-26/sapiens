import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, Button, FormField, StatusBadge } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

type FacilityCategory = 'it' | 'electrical' | 'plumbing' | 'furniture' | 'cleaning' | 'other';
type SeverityLevel = 'low' | 'medium' | 'high';

const BUILDINGS = ['Block A', 'Block B', 'Block C', 'Admin Block', 'Library', 'Sports Complex'];

const CATEGORIES: Array<{ id: FacilityCategory; label: string; icon: string }> = [
  { id: 'it', label: 'IT & AV Equipment', icon: '💻' },
  { id: 'electrical', label: 'Electrical & AC', icon: '⚡' },
  { id: 'plumbing', label: 'Plumbing & Water', icon: '🚰' },
  { id: 'furniture', label: 'Furniture & Fixtures', icon: '🪑' },
  { id: 'cleaning', label: 'Cleaning & Janitorial', icon: '🧹' },
  { id: 'other', label: 'General / Other', icon: '🛠️' },
];

const SEVERITIES: Array<{ id: SeverityLevel; label: string; desc: string; color: string }> = [
  { id: 'low', label: 'Low', desc: 'Cosmetic / Non-disruptive', color: colors.neutral[600] },
  { id: 'medium', label: 'Medium', desc: 'Impacting study/classes', color: colors.warning[600] },
  { id: 'high', label: 'High / Urgent', desc: 'Safety risk / Total stoppage', color: colors.critical[600] },
];

export const ReportFacilityIssueScreen: React.FC = () => {
  const { goBack, navigate, createRequest } = useNavigation();

  const [selectedBuilding, setSelectedBuilding] = useState<string>('Block B');
  const [room, setRoom] = useState<string>('');
  const [category, setCategory] = useState<FacilityCategory>('it');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [photoAttached, setPhotoAttached] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = () => {
    setError(null);
    if (!title.trim()) {
      setError('Please provide a brief title for the facility issue.');
      return;
    }
    if (!room.trim()) {
      setError('Please specify the room number or specific location (e.g. LH2, 2nd Fl Restroom).');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description of the defect or issue.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newReq = createRequest({
        type: 'facility_issue',
        status: 'open',
        visibility: 'private',
        title: title.trim(),
        description: description.trim(),
        imageUrls: photoAttached ? ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'] : [],
        location: `${selectedBuilding}, ${room.trim()}`,
        occurredAt: null,
        data: {
          building: selectedBuilding,
          room: room.trim(),
          issueCategory: category,
          severity,
        },
        verificationHint: null,
        handoverNote: null,
        assigneeUid: 'usr_mgr_01',
        resolution: null,
      });

      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Header title="Report Submitted" showBack onBack={goBack} />
        <View style={styles.successContent}>
          <View style={styles.successIconBox}>
            <Text style={styles.successEmoji}>🛠️</Text>
          </View>
          <Text style={styles.successTitle}>Facility Ticket Logged</Text>
          <Text style={styles.successBody}>
            Your report for {selectedBuilding} ({room}) has been queued and dispatched to the UCL Campus Facilities & Operations desk.
          </Text>
          <View style={styles.ticketSummaryBox}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Category:</Text>
              <Text style={styles.ticketValue}>{CATEGORIES.find((c) => c.id === category)?.label}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Priority:</Text>
              <Text style={styles.ticketValue}>{severity.toUpperCase()}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Tracking ID:</Text>
              <Text style={styles.ticketValue}>REQ-FAC-{Math.floor(1000 + Math.random() * 9000)}</Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <Button
              title="Track in My Requests"
              variant="primary"
              size="lg"
              onPress={() => navigate('my_requests')}
              style={{ marginBottom: spacing[3] }}
            />
            <Button
              title="Return to Services Hub"
              variant="secondary"
              size="md"
              onPress={() => navigate('services_hub')}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Report Facility Issue"
        showBack
        onBack={goBack}
        rightAction={{
          label: 'My Tickets',
          onPress: () => navigate('my_requests'),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>Campus Maintenance & Safety</Text>
          <Text style={styles.infoBannerText}>
            Reports are monitored by the Facilities Management team. For immediate electrical or flooding hazards, contact Campus Security at +94 11 222 3300.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Building Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campus Building</Text>
          <View style={styles.chipGrid}>
            {BUILDINGS.map((bldg) => {
              const isSelected = selectedBuilding === bldg;
              return (
                <TouchableOpacity
                  key={bldg}
                  style={[styles.buildingChip, isSelected && styles.buildingChipSelected]}
                  onPress={() => setSelectedBuilding(bldg)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buildingChipText, isSelected && styles.buildingChipTextSelected]}>
                    {bldg}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Room / Specific Location */}
        <FormField
          label="Room / Specific Location"
          value={room}
          onChangeText={setRoom}
          placeholder="e.g. Lecture Hall 2, Lab 1 Row 3, 2nd Fl Washroom"
          helper="Be as precise as possible to assist technicians."
        />

        {/* Issue Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issue Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Severity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Urgency / Severity Level</Text>
          <View style={styles.severityContainer}>
            {SEVERITIES.map((sev) => {
              const isSelected = severity === sev.id;
              return (
                <TouchableOpacity
                  key={sev.id}
                  style={[
                    styles.severityOption,
                    isSelected && { borderColor: sev.color, backgroundColor: `${sev.color}10` },
                  ]}
                  onPress={() => setSeverity(sev.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.severityHeader}>
                    <View
                      style={[
                        styles.severityDot,
                        { backgroundColor: sev.color },
                        isSelected && styles.severityDotActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.severityLabel,
                        isSelected && { color: sev.color, fontWeight: '700' },
                      ]}
                    >
                      {sev.label}
                    </Text>
                  </View>
                  <Text style={styles.severityDesc}>{sev.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Issue Summary & Description */}
        <FormField
          label="Issue Summary"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. HDMI projector signal cable broken in LH2"
        />

        <FormField
          label="Detailed Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the symptoms, when it started, or how to reproduce..."
          multiline
          numberOfLines={4}
        />

        {/* Photo Attachment Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Evidence (Optional)</Text>
          <TouchableOpacity
            style={[styles.uploadBox, photoAttached && styles.uploadBoxActive]}
            onPress={() => setPhotoAttached(!photoAttached)}
            activeOpacity={0.8}
          >
            <Text style={styles.uploadIcon}>{photoAttached ? '✅' : '📷'}</Text>
            <Text style={styles.uploadTitle}>
              {photoAttached ? '1 Photo Attached (Tap to Remove)' : 'Attach Photo of Defect'}
            </Text>
            <Text style={styles.uploadSubtitle}>
              {photoAttached ? 'IMG_20260919_DEFECT.JPG (1.2 MB)' : 'JPEG or PNG up to 2 MB'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <View style={styles.actionContainer}>
          <Button
            title={loading ? 'Logging Ticket...' : 'Submit Facility Report'}
            variant="primary"
            size="lg"
            onPress={handleSubmit}
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
  infoBanner: {
    backgroundColor: colors.primary[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
    borderRadius: radius.md,
    padding: spacing[3.5],
    marginBottom: spacing[4],
  },
  infoBannerTitle: {
    ...typography.labelSm,
    color: colors.primary[900],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  infoBannerText: {
    ...typography.bodySm,
    color: colors.primary[800],
    lineHeight: 18,
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  buildingChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.full,
  },
  buildingChipSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  buildingChipText: {
    ...typography.labelSm,
    color: colors.neutral[700],
  },
  buildingChipTextSelected: {
    color: colors.neutral[0],
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2.5],
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
  },
  categoryCardSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: spacing[1],
  },
  categoryLabel: {
    ...typography.labelSm,
    color: colors.neutral[800],
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: colors.primary[700],
    fontWeight: '700',
  },
  severityContainer: {
    gap: spacing[2],
  },
  severityOption: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
  },
  severityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginRight: spacing[2],
  },
  severityDotActive: {
    transform: [{ scale: 1.2 }],
  },
  severityLabel: {
    ...typography.labelSm,
    color: colors.neutral[900],
  },
  severityDesc: {
    ...typography.bodySm,
    color: colors.neutral[500],
  },
  uploadBox: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    padding: spacing[4],
    alignItems: 'center',
  },
  uploadBoxActive: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: spacing[1],
  },
  uploadTitle: {
    ...typography.labelSm,
    color: colors.neutral[800],
    fontWeight: '600',
  },
  uploadSubtitle: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: spacing[0.5],
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
  },
  successActions: {
    width: '100%',
  },
});
