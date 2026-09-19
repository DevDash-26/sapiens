import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, SearchBar, FilterChip, EmptyState, Button, StatusBadge } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';
import { Request } from '../../types/contract';

export const BrowseTextbookExchangeScreen: React.FC = () => {
  const { goBack, navigate, requests, currentUser } = useNavigation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOfferFilter, setSelectedOfferFilter] = useState<string>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<Request | null>(null);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  // All textbook requests
  const textbookListings = useMemo(() => {
    return requests.filter((r) => r.type === 'textbook' && r.status === 'open');
  }, [requests]);

  // Extract unique course codes
  const courseCodes = useMemo(() => {
    const codes = new Set<string>();
    textbookListings.forEach((b) => {
      if (b.data?.courseCode) codes.add(b.data.courseCode);
    });
    return Array.from(codes);
  }, [textbookListings]);

  // Filtered list
  const filteredListings = useMemo(() => {
    return textbookListings.filter((book) => {
      // Offer filter
      if (selectedOfferFilter !== 'all' && book.data?.offer !== selectedOfferFilter) {
        return false;
      }
      // Course filter
      if (selectedCourseFilter !== 'all' && book.data?.courseCode !== selectedCourseFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = book.title.toLowerCase().includes(q);
        const descMatch = book.description.toLowerCase().includes(q);
        const courseMatch = book.data?.courseCode?.toLowerCase().includes(q);
        const isbnMatch = book.data?.isbn?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !courseMatch && !isbnMatch) {
          return false;
        }
      }
      return true;
    });
  }, [textbookListings, selectedOfferFilter, selectedCourseFilter, searchQuery]);

  const handleSendContact = () => {
    setContactSuccess(true);
    setTimeout(() => {
      setSelectedBook(null);
      setContactSuccess(false);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Textbook Exchange"
        showBack
        onBack={goBack}
        rightAction={{
          label: '+ List Book',
          onPress: () => navigate('list_textbook'),
        }}
      />

      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, author, course (SE201)..."
          onClear={() => setSearchQuery('')}
        />

        {/* Offer Type Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipScroll}
        >
          <FilterChip
            label="All Listings"
            selected={selectedOfferFilter === 'all'}
            onPress={() => setSelectedOfferFilter('all')}
          />
          <FilterChip
            label="🎁 Free (Giveaway)"
            selected={selectedOfferFilter === 'give_away'}
            onPress={() => setSelectedOfferFilter('give_away')}
          />
          <FilterChip
            label="🔄 Swap"
            selected={selectedOfferFilter === 'swap'}
            onPress={() => setSelectedOfferFilter('swap')}
          />
          <FilterChip
            label="🏷️ For Sale"
            selected={selectedOfferFilter === 'sell'}
            onPress={() => setSelectedOfferFilter('sell')}
          />
          {courseCodes.map((code) => (
            <FilterChip
              key={code}
              label={code}
              selected={selectedCourseFilter === code}
              onPress={() =>
                setSelectedCourseFilter(selectedCourseFilter === code ? 'all' : code)
              }
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredListings.length} {filteredListings.length === 1 ? 'book available' : 'books available'}
          </Text>
          <TouchableOpacity onPress={() => navigate('list_textbook')}>
            <Text style={styles.sellLink}>Have a book to pass on? List it →</Text>
          </TouchableOpacity>
        </View>

        {filteredListings.length === 0 ? (
          <EmptyState
            title="No Textbooks Found"
            description="No listings match your search filters. Try adjusting your search or list a textbook for fellow students!"
            action={{
              label: 'List a Textbook',
              onPress: () => navigate('list_textbook'),
            }}
          />
        ) : (
          filteredListings.map((book) => {
            const offer = book.data?.offer || 'give_away';
            const price = book.data?.price || 0;
            const course = book.data?.courseCode || 'General';
            const condition = book.data?.condition || 'good';
            const isOwner = book.ownerUid === currentUser.id;

            return (
              <View key={book.id} style={styles.bookCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.courseTag}>
                    <Text style={styles.courseTagText}>{course}</Text>
                  </View>

                  <View
                    style={[
                      styles.priceTag,
                      offer === 'give_away' && styles.priceTagFree,
                      offer === 'swap' && styles.priceTagSwap,
                    ]}
                  >
                    <Text
                      style={[
                        styles.priceTagText,
                        offer === 'give_away' && styles.priceTagFreeText,
                        offer === 'swap' && styles.priceTagSwapText,
                      ]}
                    >
                      {offer === 'give_away'
                        ? 'FREE GIVEAWAY'
                        : offer === 'swap'
                        ? 'BOOK SWAP'
                        : `LKR ${price.toLocaleString()}`}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bookTitle}>{book.title}</Text>
                {book.data?.isbn && (
                  <Text style={styles.isbnText}>ISBN: {book.data.isbn}</Text>
                )}

                <Text style={styles.bookDesc} numberOfLines={2}>
                  {book.description}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.conditionChip}>
                    <Text style={styles.conditionChipText}>
                      Condition: {condition === 'new' ? 'Like New' : condition === 'good' ? 'Good' : 'Worn'}
                    </Text>
                  </View>
                  <Text style={styles.locationText}>📍 {book.location || 'Library'}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.listerInfo}>
                    <Text style={styles.listerLabel}>Lister</Text>
                    <Text style={styles.listerName}>
                      {isOwner ? `${book.ownerName} (You)` : book.ownerName}
                    </Text>
                  </View>

                  {!isOwner && (
                    <Button
                      title="Contact Lister"
                      variant="outline"
                      size="sm"
                      onPress={() => setSelectedBook(book)}
                    />
                  )}
                  {isOwner && (
                    <Button
                      title="Manage"
                      variant="secondary"
                      size="sm"
                      onPress={() => navigate('request_detail', { requestId: book.id })}
                    />
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Contact Lister Modal */}
      {selectedBook && (
        <Modal
          visible={!!selectedBook}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedBook(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Connect with Lister</Text>
                <TouchableOpacity onPress={() => setSelectedBook(null)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalBookTitle}>{selectedBook.title}</Text>
                <Text style={styles.modalOwner}>Listed by {selectedBook.ownerName}</Text>

                <View style={styles.handoverBox}>
                  <Text style={styles.handoverTitle}>📍 Campus Handover Point</Text>
                  <Text style={styles.handoverText}>{selectedBook.location || 'Main Library Lounge'}</Text>
                </View>

                <View style={styles.messageBox}>
                  <Text style={styles.messageLabel}>Pre-formatted Message to {selectedBook.ownerName}:</Text>
                  <Text style={styles.messagePreview}>
                    "Hi {selectedBook.ownerName}, I saw your listing for {selectedBook.title} on UCL Campus Hub. I'd love to arrange the meetup at {selectedBook.location || 'campus library'}."
                  </Text>
                </View>

                {contactSuccess ? (
                  <View style={styles.contactSuccessBox}>
                    <Text style={styles.contactSuccessText}>✓ Notification sent to {selectedBook.ownerName}!</Text>
                  </View>
                ) : (
                  <Button
                    title="Send Exchange Request"
                    variant="primary"
                    size="lg"
                    onPress={handleSendContact}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  searchSection: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterChipScroll: {
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  resultsCount: {
    ...typography.labelSm,
    color: colors.neutral[600],
  },
  sellLink: {
    ...typography.labelSm,
    color: colors.primary[700],
    fontWeight: '600',
  },
  bookCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  courseTag: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[0.5],
    borderRadius: radius.sm,
  },
  courseTagText: {
    ...typography.caption,
    color: colors.primary[800],
    fontWeight: '700',
  },
  priceTag: {
    backgroundColor: colors.accent[50],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent[200],
  },
  priceTagText: {
    ...typography.caption,
    color: colors.accent[900],
    fontWeight: '700',
  },
  priceTagFree: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
  },
  priceTagFreeText: {
    color: colors.success[700],
  },
  priceTagSwap: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
  },
  priceTagSwapText: {
    color: colors.warning[800],
  },
  bookTitle: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  isbnText: {
    ...typography.caption,
    color: colors.neutral[500],
    marginBottom: spacing[1],
  },
  bookDesc: {
    ...typography.bodySm,
    color: colors.neutral[600],
    lineHeight: 18,
    marginBottom: spacing[3],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    marginBottom: spacing[3],
  },
  conditionChip: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: radius.sm,
  },
  conditionChipText: {
    ...typography.caption,
    color: colors.neutral[700],
  },
  locationText: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listerInfo: {
    flex: 1,
  },
  listerLabel: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  listerName: {
    ...typography.bodySm,
    color: colors.neutral[800],
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalSheet: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 420,
    padding: spacing[5],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  modalTitle: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 20,
    color: colors.neutral[500],
    padding: spacing[1],
  },
  modalBody: {
    marginTop: spacing[1],
  },
  modalBookTitle: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  modalOwner: {
    ...typography.bodySm,
    color: colors.neutral[500],
    marginBottom: spacing[4],
  },
  handoverBox: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  handoverTitle: {
    ...typography.labelSm,
    color: colors.neutral[800],
    fontWeight: '600',
    marginBottom: spacing[0.5],
  },
  handoverText: {
    ...typography.bodySm,
    color: colors.neutral[600],
  },
  messageBox: {
    backgroundColor: colors.primary[50],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  messageLabel: {
    ...typography.caption,
    color: colors.primary[900],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  messagePreview: {
    ...typography.bodySm,
    color: colors.primary[800],
    lineHeight: 18,
    fontStyle: 'italic',
  },
  contactSuccessBox: {
    backgroundColor: colors.success[50],
    padding: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  contactSuccessText: {
    ...typography.labelSm,
    color: colors.success[700],
    fontWeight: '700',
  },
});
