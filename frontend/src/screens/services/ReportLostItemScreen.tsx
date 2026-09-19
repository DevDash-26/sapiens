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

export const ReportLostItemScreen: React.FC = () => {
  const { createRequest, navigate, goBack } = useNavigation();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError(null);
    if (!title.trim()) {
      setError('Please enter an item title/name.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a brief description of the lost item.');
      return;
    }
    if (!location.trim()) {
      setError('Please specify the last known location on campus.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      createRequest({
        type: 'lost',
        status: 'open',
        visibility: 'public',
        title: title.trim(),
        description: description.trim(),
        imageUrls: [],
        location: location.trim(),
        occurredAt: new Date().toISOString(),
        data: {
          itemCategory: category,
          color: color.trim() || undefined,
          brand: brand.trim() || undefined,
        },
        verificationHint: null,
        handoverNote: null,
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
        <Text style={styles.headerTitle}>Report a Lost Item</Text>
        <Text style={styles.headerSubtitle}>
          Provide details of your missing belonging. Our automated matcher will notify you if a matching item is handed in.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        )}

        <FormField
          label="Item Name / Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Black Casio Calculator fx-991"
          required
        />

        {/* Category Picker */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>Item Category *</Text>
          <View style={styles.categoryGrid}>
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
          label="Last Known Location on Campus"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Block B, Lecture Hall 2 (or Canteen)"
          required
        />

        <View style={styles.rowFields}>
          <FormField
            label="Primary Color"
            value={color}
            onChangeText={setColor}
            placeholder="e.g. Black / Navy"
            containerStyle={{ flex: 1, marginRight: spacing.sm }}
          />
          <FormField
            label="Brand / Model"
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Casio / Apple"
            containerStyle={{ flex: 1 }}
          />
        </View>

        <FormField
          label="Detailed Description & Distinguishing Features"
          value={description}
          onChangeText={setDescription}
          placeholder="Include identifiable stickers, scratches, case color, or markings..."
          multiline
          required
        />

        <Button
          title={loading ? 'Submitting report...' : 'Publish Lost Item Report'}
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
  categorySection: {
    marginBottom: spacing.md,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: spacing.xs + 2,
  },
  categoryGrid: {
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
  rowFields: {
    flexDirection: 'row',
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});
