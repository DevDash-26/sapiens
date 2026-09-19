import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, Button, FormField } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

type BookCondition = 'new' | 'good' | 'worn';
type OfferType = 'give_away' | 'swap' | 'sell';

const CONDITIONS: Array<{ id: BookCondition; label: string; desc: string }> = [
  { id: 'new', label: 'Like New', desc: 'No markings, pristine pages' },
  { id: 'good', label: 'Good Condition', desc: 'Minor highlighting or light shelf wear' },
  { id: 'worn', label: 'Well Used / Worn', desc: 'Annotated pages, durable binding' },
];

const OFFERS: Array<{ id: OfferType; label: string; desc: string; icon: string }> = [
  { id: 'give_away', label: 'Free Giveaway', desc: 'Pass forward to a junior student for LKR 0', icon: '🎁' },
  { id: 'swap', label: 'Book Swap', desc: 'Exchange for another semester subject textbook', icon: '🔄' },
  { id: 'sell', label: 'For Sale', desc: 'Set an affordable student price in LKR', icon: '🏷️' },
];

export const ListTextbookScreen: React.FC = () => {
  const { goBack, navigate, createRequest } = useNavigation();

  const [title, setTitle] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('');
  const [isbn, setIsbn] = useState<string>('');
  const [condition, setCondition] = useState<BookCondition>('good');
  const [offer, setOffer] = useState<OfferType>('give_away');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('Library / Block B Lounge');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = () => {
    setError(null);
    if (!title.trim()) {
      setError('Please provide the textbook title and author.');
      return;
    }
    if (!courseCode.trim()) {
      setError('Please provide the relevant course code (e.g. SE201, CS102).');
      return;
    }
    if (offer === 'sell' && (!price.trim() || isNaN(Number(price)) || Number(price) <= 0)) {
      setError('Please specify a valid selling price in LKR.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      createRequest({
        type: 'textbook',
        status: 'open',
        visibility: 'public',
        title: title.trim(),
        description: description.trim() || 'Available for student exchange on campus.',
        imageUrls: [],
        location: location.trim() || 'Campus Library',
        occurredAt: null,
        data: {
          isbn: isbn.trim() || undefined,
          courseCode: courseCode.trim().toUpperCase(),
          condition,
          offer,
          price: offer === 'sell' ? Number(price) : 0,
        },
        verificationHint: null,
        handoverNote: null,
        assigneeUid: null,
        resolution: null,
      });

      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Header title="Listing Published" showBack onBack={goBack} />
        <View style={styles.successContent}>
          <View style={styles.successIconBox}>
            <Text style={styles.successEmoji}>📚</Text>
          </View>
          <Text style={styles.successTitle}>Textbook Listed!</Text>
          <Text style={styles.successBody}>
            "{title}" is now visible to all students on the UCL Peer Textbook Exchange board.
          </Text>

          <View style={styles.ticketSummaryBox}>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Course:</Text>
              <Text style={styles.ticketValue}>{courseCode.toUpperCase()}</Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Offer:</Text>
              <Text style={styles.ticketValue}>
                {offer === 'sell' ? `LKR ${price}` : offer === 'give_away' ? 'Free (Giveaway)' : 'Book Swap'}
              </Text>
            </View>
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Condition:</Text>
              <Text style={styles.ticketValue}>{CONDITIONS.find((c) => c.id === condition)?.label}</Text>
            </View>
          </View>

          <View style={styles.successActions}>
            <Button
              title="Browse Textbook Exchange"
              variant="primary"
              size="lg"
              onPress={() => navigate('browse_textbooks')}
              style={{ marginBottom: spacing[3] }}
            />
            <Button
              title="Track in My Requests"
              variant="secondary"
              size="md"
              onPress={() => navigate('my_requests')}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="List a Textbook"
        showBack
        onBack={goBack}
        rightAction={{
          label: 'Exchange',
          onPress: () => navigate('browse_textbooks'),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>Peer Study Material Exchange</Text>
          <Text style={styles.infoBannerText}>
            Give away, swap, or resell recommended textbooks and study guides to fellow UCL students.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Offer Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing Type</Text>
          <View style={styles.offerList}>
            {OFFERS.map((item) => {
              const isSelected = offer === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.offerCard, isSelected && styles.offerCardSelected]}
                  onPress={() => setOffer(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.offerIcon}>{item.icon}</Text>
                  <View style={styles.offerInfo}>
                    <Text style={[styles.offerLabel, isSelected && styles.offerLabelSelected]}>
                      {item.label}
                    </Text>
                    <Text style={styles.offerDesc}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Book Title & Course */}
        <FormField
          label="Book Title & Edition"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Clean Architecture (Robert C. Martin)"
        />

        <View style={styles.twoColumn}>
          <View style={{ flex: 1, marginRight: spacing[2] }}>
            <FormField
              label="Course Code"
              value={courseCode}
              onChangeText={setCourseCode}
              placeholder="e.g. SE201"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormField
              label="ISBN (Optional)"
              value={isbn}
              onChangeText={setIsbn}
              placeholder="e.g. 978-0134494"
            />
          </View>
        </View>

        {/* If Selling, Price Input */}
        {offer === 'sell' && (
          <FormField
            label="Price (LKR)"
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 2500"
            keyboardType="numeric"
            helper="Keep prices student-friendly!"
          />
        )}

        {/* Condition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Condition</Text>
          <View style={styles.conditionGrid}>
            {CONDITIONS.map((cond) => {
              const isSelected = condition === cond.id;
              return (
                <TouchableOpacity
                  key={cond.id}
                  style={[styles.condCard, isSelected && styles.condCardSelected]}
                  onPress={() => setCondition(cond.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.condLabel, isSelected && styles.condLabelSelected]}>
                    {cond.label}
                  </Text>
                  <Text style={styles.condDesc}>{cond.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes & Description */}
        <FormField
          label="Additional Details / Markings"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe notes, CD-ROM inclusion, previous owner markings..."
          multiline
          numberOfLines={3}
        />

        {/* Handover Location */}
        <FormField
          label="Preferred Campus Handover Location"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Library Front Counter / Canteen Block A"
        />

        {/* Submit */}
        <View style={styles.actionContainer}>
          <Button
            title={loading ? 'Publishing Listing...' : 'Publish to Exchange'}
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
  offerList: {
    gap: spacing[2.5],
  },
  offerCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3.5],
    alignItems: 'center',
  },
  offerCardSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  offerIcon: {
    fontSize: 24,
    marginRight: spacing[3],
  },
  offerInfo: {
    flex: 1,
  },
  offerLabel: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '600',
    marginBottom: spacing[0.5],
  },
  offerLabelSelected: {
    color: colors.primary[800],
    fontWeight: '700',
  },
  offerDesc: {
    ...typography.bodySm,
    color: colors.neutral[500],
    lineHeight: 18,
  },
  twoColumn: {
    flexDirection: 'row',
  },
  conditionGrid: {
    gap: spacing[2],
  },
  condCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
  },
  condCardSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  condLabel: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '600',
    marginBottom: spacing[0.5],
  },
  condLabelSelected: {
    color: colors.primary[800],
    fontWeight: '700',
  },
  condDesc: {
    ...typography.bodySm,
    color: colors.neutral[500],
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
    backgroundColor: colors.accent[50],
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
