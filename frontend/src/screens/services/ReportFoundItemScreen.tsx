import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { useNavigation } from '../../contexts/NavigationContext';
import { ItemCategory } from '../../types/contract';

const ITEM_CATEGORIES: Array<{ id: ItemCategory; label: string }> = [
  { id: 'electronics', label: 'Electronics' },
  { id: 'id_card_wallet', label: 'ID Card / Wallet' },
  { id: 'keys', label: 'Keys' },
  { id: 'bags', label: 'Bags / Backpacks' },
  { id: 'books', label: 'Books / Notes' },
  { id: 'other', label: 'Other Items' },
];

type HandedToType = 'security_desk' | 'library' | 'self';

export const ReportFoundItemScreen: React.FC = () => {
  const { createRequest, navigate, goBack } = useNavigation();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState('');
  const [handedTo, setHandedTo] = useState<HandedToType>('security_desk');
  const [verificationHint, setVerificationHint] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError(null);
    if (!title.trim()) {
      setError('Please enter an item name.');
      return;
    }
    if (!location.trim()) {
      setError('Please specify where on campus this item was found.');
      return;
    }
    if (!verificationHint.trim()) {
      setError(
        'A Private Verification Detail is required to prevent false claims (e.g. sticker on back, card digits).'
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      createRequest({
        type: 'found',
        status: 'open',
        visibility: 'public',
        title: title.trim(),
        description: description.trim() || 'Found on campus. Handed over to desk.',
        imageUrls: [],
        location: location.trim(),
        occurredAt: new Date().toISOString(),
        data: {
          itemCategory: category,
          color: color.trim() || undefined,
          handedTo,
        },
        verificationHint: verificationHint.trim(),
        handoverNote:
          handedTo === 'security_desk'
            ? 'Item handed over to Block A Main Security Desk.'
            : handedTo === 'library'
            ? 'Item handed over to Library Helpdesk counter.'
            : 'Reporter currently holds the item.',
        assigneeUid: null,
        resolution: null,
      });

      navigate('lost_found_feed');
    }, 500);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={goBack}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>← Back to Lost & Found</Text>
      </TouchableOpacity>

      <Card padding="lg" style={styles.card}>
        <Text style={styles.headerTitle}>Report a Found Item</Text>
        <Text style={styles.headerSubtitle}>
          Thank you for reporting a found item. Your report helps reunite students with their belongings securely.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        )}

        <FormField
          label="Item Found"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Blue Hydro Flask / Leather Wallet"
          required
        />

        {/* Category Picker */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionLabel}>Item Category *</Text>
          <View style={styles.chipGrid}>
            {ITEM_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    isSelected && styles.catChipSelected,
                  ]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      isSelected && styles.catChipTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <FormField
          label="Where was it found on campus?"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Block B Lecture Hall 2 / Canteen Table"
          required
        />

        {/* Handed Over To Selection */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionLabel}>Where is the item currently held? *</Text>
          <View style={styles.handedGrid}>
            <TouchableOpacity
              style={[
                styles.handedCard,
                handedTo === 'security_desk' && styles.handedCardSelected,
              ]}
              onPress={() => setHandedTo('security_desk')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.handedTitle,
                  handedTo === 'security_desk' && styles.handedTitleSelected,
                ]}
              >
                Security Desk
              </Text>
              <Text style={styles.handedSub}>Main Security Counter (Block A)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.handedCard,
                handedTo === 'library' && styles.handedCardSelected,
              ]}
              onPress={() => setHandedTo('library')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.handedTitle,
                  handedTo === 'library' && styles.handedTitleSelected,
                ]}
              >
                Library Desk
              </Text>
              <Text style={styles.handedSub}>Main Library Circulation Counter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Private Verification Detail (BR7 requirement) */}
        <View style={styles.verificationBox}>
          <Text style={styles.verificationHeader}>
            PRIVATE VERIFICATION DETAIL (MANDATORY)
          </Text>
          <Text style={styles.verificationDesc}>
            This detail is NEVER shown publicly. Only a claimant who describes this exact feature correctly will be approved as the true owner.
          </Text>
          <FormField
            label="Secret Identifying Feature"
            value={verificationHint}
            onChangeText={setVerificationHint}
            placeholder="e.g. Has a small penguin sticker on base, or student ID number inside..."
            multiline
            required
          />
        </View>

        <FormField
          label="Public Notes & General Description"
          value={description}
          onChangeText={setDescription}
          placeholder="General information safe to show publicly..."
          multiline
        />

        <Button
          title={loading ? 'Submitting report...' : 'Publish Found Item Listing'}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={styles.submitBtn}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },
  card: {
    backgroundColor: colors.neutral.white,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.neutral.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral.textMuted,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  errorBox: {
    backgroundColor: colors.status.error.bg,
    borderColor: colors.status.error.border,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBoxText: {
    color: colors.status.error.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionGroup: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: spacing.xs + 2,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.control,
    backgroundColor: colors.neutral.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
  },
  catChipSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.text,
  },
  catChipTextSelected: {
    color: colors.neutral.white,
  },
  handedGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  handedCard: {
    flex: 1,
    padding: spacing.sm + 2,
    borderRadius: radius.control,
    backgroundColor: colors.neutral.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.neutral.borderStrong,
  },
  handedCardSelected: {
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.DEFAULT,
  },
  handedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral.text,
  },
  handedTitleSelected: {
    color: colors.primary.DEFAULT,
  },
  handedSub: {
    fontSize: 11,
    color: colors.neutral.textMuted,
    marginTop: 2,
  },
  verificationBox: {
    backgroundColor: colors.primary.surface,
    borderColor: colors.primary.border,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  verificationHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  verificationDesc: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});
