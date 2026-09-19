import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert as NativeAlert,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import {
  Card,
  Button,
  StatusBadge,
  SearchBar,
  FilterChip,
  Modal,
  IconSymbol,
} from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

export type FacilityCategory =
  | 'all'
  | 'dining'
  | 'sports'
  | 'library'
  | 'it_support'
  | 'wellbeing'
  | 'finance_aid'
  | 'printing'
  | 'onboarding';

export interface FacilityItem {
  id: string;
  category: FacilityCategory;
  reqCode: string;
  title: string;
  subtitle: string;
  location: string;
  hours: string;
  isOpenNow: boolean;
  contactEmail?: string;
  contactPhone?: string;
  iconName: any;
  accentColor: string;
  summary: string;
  details: {
    overview: string;
    keyPoints: string[];
    ratesOrFees?: string;
    actionLabel?: string;
    actionScreen?: string;
    actionUrl?: string;
  };
}

const FACILITIES_DATA: FacilityItem[] = [
  // BR25 - Dining Information
  {
    id: 'fac-dining',
    category: 'dining',
    reqCode: 'BR25',
    title: 'The Campus Cafe & Food Court',
    subtitle: 'Daily student hot meals, fresh juices & espresso bar',
    location: 'Main Tower · Level 1 (Student Commons)',
    hours: 'Mon–Fri 7:30 AM – 7:00 PM · Sat 8:00 AM – 3:00 PM',
    isOpenNow: true,
    contactEmail: 'cafeteria@ucl.ac.uk',
    contactPhone: '+94 11 234 5678 (Ext 108)',
    iconName: 'home',
    accentColor: '#e12229',
    summary: 'Freshly prepared affordable student meals with certified Halal meat and vegetarian/vegan selections.',
    details: {
      overview:
        'The UCL Food Court offers affordable, nutritious hot meals and snacks for students, staff, and campus visitors. All poultry and meats are 100% Halal certified. Dietary allergens and nutritional labels are clearly posted daily.',
      keyPoints: [
        'Sri Lankan Rice & Curry (Chicken: LKR 450, Fish: LKR 400, Vegetarian: LKR 350)',
        'Daily Student Special Biryani Bowl: LKR 650 (includes raita and boiled egg)',
        'Healthy Grab-and-Go: Grilled Chicken wraps, paneer salads, fresh seasonal fruit cups',
        'Coffee & Bakery Bar: Espresso, iced lattes, pastries, and savory patties',
        'Digital Pre-orders: Order ahead via the counter phone line during peak lunchtime (12:00–1:30 PM)',
      ],
      ratesOrFees: 'Student Meals from LKR 350 to LKR 750',
      actionLabel: 'Report Canteen Feedback',
      actionScreen: 'submit_feedback',
    },
  },

  // BR24 - Sports & Recreation
  {
    id: 'fac-sports',
    category: 'sports',
    reqCode: 'BR24',
    title: 'UCL Fitness Center & Sports Arena',
    subtitle: 'Gymnasium, indoor badminton courts & recreational gear lending',
    location: 'Sports Complex · Level 4',
    hours: 'Mon–Sat 6:30 AM – 8:30 PM · Sun Closed',
    isOpenNow: true,
    contactEmail: 'sports@ucl.ac.uk',
    contactPhone: '+94 11 234 5678 (Ext 140)',
    iconName: 'sparkles',
    accentColor: '#059669',
    summary: 'Free student gymnasium, indoor badminton arenas, table tennis, and sports team practice grounds.',
    details: {
      overview:
        'The UCL Sports & Recreation Center promotes active, balanced student lifestyles. Free access is provided to all currently enrolled students with a valid UCL student ID card. Locker rooms and showers are provided.',
      keyPoints: [
        'Fully equipped gym: Treadmills, spin bikes, dumbbells, squat racks, and weight machines',
        'Certified fitness instructor available on floor: 4:00 PM – 8:00 PM daily',
        'Indoor Badminton & Table Tennis Arenas: 2 tournament-spec courts bookable via Classroom & Room Booking engine',
        'Equipment Lending Desk: Badminton rackets, shuttlecocks, basketballs, and footballs free to borrow with ID deposit',
        'University Team Practice: Cricket, Futsal, Basketball, Badminton, and Rowing clubs train weekly',
      ],
      ratesOrFees: 'Free for enrolled UCL students (Valid Student ID required)',
      actionLabel: 'Book Sports Arena Slot',
      actionScreen: 'classroom_availability',
    },
  },

  // BR26 - Printing & Stationery Services
  {
    id: 'fac-printing',
    category: 'printing',
    reqCode: 'BR26',
    title: 'Print Stations & Stationery Hub',
    subtitle: 'High-speed B&W / color printing, plotters & spiral binding',
    location: 'Library Level 2 & Computing Lab 301',
    hours: 'Mon–Fri 8:00 AM – 7:30 PM · Sat 8:30 AM – 4:30 PM',
    isOpenNow: true,
    contactEmail: 'printdesk@ucl.ac.uk',
    contactPhone: '+94 11 234 5678 (Ext 115)',
    iconName: 'document',
    accentColor: '#d97706',
    summary: 'Self-service network printing, high-resolution engineering plotters, and project report binding.',
    details: {
      overview:
        'Fast and reliable network printing stations are positioned in the Central Library and Computing Labs. Students can print directly from campus lab PCs or upload PDF documents wirelessly from their personal laptops and mobile phones.',
      keyPoints: [
        'Wireless Printing: Access print.ucl.ac.lk on campus Wi-Fi to submit print jobs from your phone or laptop',
        'Self-service tap-to-release with student RFID ID cards at any printer console',
        'A4 Black & White Printing / Copying: LKR 10 per page',
        'A4 Full Color Laser Printing: LKR 35 per page',
        'A3 Color Architectural / Engineering CAD Plotting: LKR 90 per page',
        'Stationery counter: Hardcover project binding, spiral binding, lamination, and presentation supplies',
      ],
      ratesOrFees: 'B&W LKR 10/pg · Color LKR 35/pg · Top-up via Student Portal or Library Counter',
      actionLabel: 'View IT Support Guide',
      actionScreen: 'campus_facilities_hub',
    },
  },

  // BR31 - Library Resources & Study Spaces
  {
    id: 'fac-library',
    category: 'library',
    reqCode: 'BR31',
    title: 'Central Library & Digital Learning Center',
    subtitle: 'Physical textbook repository, quiet study pods & IEEE/ACM digital databases',
    location: 'Central Tower · Level 2 & 3',
    hours: 'Mon–Fri 8:00 AM – 8:00 PM (Exam Periods: Open until 10:00 PM)',
    isOpenNow: true,
    contactEmail: 'library@ucl.ac.uk',
    contactPhone: '+94 11 234 5678 (Ext 112)',
    iconName: 'book',
    accentColor: '#2563eb',
    summary: 'Quiet study pods, textbook loans, collaborative study rooms, and access to world-class scientific databases.',
    details: {
      overview:
        'The UCL Central Library holds over 15,000 core academic textbooks, reference monographs, and access to over 50,000 peer-reviewed digital academic journals through subscribed scientific indexes.',
      keyPoints: [
        'Physical Book Borrowing: Undergraduates may borrow up to 4 books for 14 days (1 online renewal allowed)',
        'E-Resources & Journal Access: Free access to IEEE Xplore, ScienceDirect, ACM Digital Library, and ProQuest',
        '120 Ergonomic Quiet Study Desks with power outlets and high-speed Wi-Fi',
        '6 Silent Individual Study Pods & 4 Collaborative Group Discussion Rooms',
        'Reference Desk: Librarians available for literature review assistance, citation guidance, and plagiarism checks',
      ],
      ratesOrFees: 'Free for all active students and faculty',
      actionLabel: 'Book Group Discussion Room',
      actionScreen: 'classroom_availability',
    },
  },

  // BR30 - IT Support & Campus Wi-Fi
  {
    id: 'fac-itsupport',
    category: 'it_support',
    reqCode: 'BR30',
    title: 'UCL IT Helpdesk & Digital Services',
    subtitle: 'Wi-Fi setup, portal credentials, Moodle LMS & software licensing',
    location: 'Ground Floor · Room G-04',
    hours: 'Mon–Fri 8:00 AM – 6:00 PM · Sat 8:30 AM – 2:00 PM',
    isOpenNow: true,
    contactEmail: 'itsupport@ucl.ac.uk',
    contactPhone: '+94 11 234 5678 (Ext 101)',
    iconName: 'tool',
    accentColor: '#4f46e5',
    summary: 'Hardware troubleshooting, campus Wi-Fi onboarding, LMS portal access, and free student software licenses.',
    details: {
      overview:
        'The IT Services Helpdesk delivers technical assistance for campus digital infrastructure, including university network onboarding, email access, LMS troubleshooting, and enterprise software distribution.',
      keyPoints: [
        'Campus Wi-Fi Setup: Connect to "UCL-Secure-Student" (WPA2-Enterprise, PEAP / MSCHAPv2)',
        'Credentials: Username is your student email (e.g. STU1001@ucl.ac.lk) and your university password',
        'Eduroam Roaming: Seamless worldwide academic Wi-Fi roaming enabled for partner universities',
        'Free Student Software: Office 365 ProPlus (5 devices), GitHub Student Developer Pack, JetBrains IDEs, and MATLAB',
        'Portal & Password Resets: Walk in with Student ID or email itsupport@ucl.ac.uk for immediate MFA / password recovery',
      ],
      ratesOrFees: 'All software and technical support provided free of charge',
      actionLabel: 'Report IT / Lab Hardware Issue',
      actionScreen: 'report_facility_issue',
    },
  },

  // BR29 - Wellbeing & Counselling Support
  {
    id: 'fac-wellbeing',
    category: 'wellbeing',
    reqCode: 'BR29',
    title: 'Student Wellbeing & Counselling Sanctuary',
    subtitle: 'Confidential mental health guidance, stress relief & 24/7 crisis support',
    location: 'Quiet Wing · Level 2, Room 208',
    hours: 'Mon–Fri 9:00 AM – 5:30 PM (Appointments & Walk-ins)',
    isOpenNow: true,
    contactEmail: 'counsellor@ucl.ac.uk',
    contactPhone: '+94 77 123 4567 (24/7 Helpline: 1926)',
    iconName: 'person',
    accentColor: '#0891b2',
    summary: 'Confidential mental health support, licensed psychologist counseling, exam stress workshops, and crisis lines.',
    details: {
      overview:
        'Universal College Lanka prioritizes student mental health and psychological wellbeing. All counseling sessions are strictly confidential and completely separate from student academic records.',
      keyPoints: [
        'Free 1-on-1 Confidential Counseling: Licensed clinical psychologists available for personal, emotional, or academic concerns',
        '24/7 Student Crisis Hotline: Call 1926 (National Crisis Support) or +94 77 123 4567 (UCL On-Call Counsellor)',
        'Exam Anxiety & Mindfulness Workshops: Weekly group sessions during midterms and finals in Room 208',
        'Peer Listener Network: Trained senior students available for informal peer check-ins and adjustment advice',
        'Disability & Accessibility Support: Accommodations for physical, learning, or mental health circumstances',
      ],
      ratesOrFees: '100% Free & Strictly Confidential',
      actionLabel: 'Request Confidential Support',
      actionScreen: 'request_academic_support',
    },
  },

  // BR23 - Financial Support & Scholarships
  {
    id: 'fac-finance',
    category: 'finance_aid',
    reqCode: 'BR23',
    title: 'Scholarships & Student Financial Aid',
    subtitle: 'Merit fee waivers, hardship bursaries & 0% interest installment plans',
    location: 'Student Finance Office · Level 1, Room 102',
    hours: 'Mon–Fri 8:30 AM – 5:00 PM',
    isOpenNow: true,
    contactEmail: 'finance@ucl.ac.uk',
    contactPhone: '+94 11 234 5678 (Ext 105)',
    iconName: 'school',
    accentColor: '#16a34a',
    summary: 'Academic merit scholarships, sports bursaries, emergency hardship grants, and flexible semester tuition plans.',
    details: {
      overview:
        'The Student Financial Aid Office provides financial counsel, administers academic scholarships, and facilitates manageable tuition payment arrangements so that no qualified student is denied education due to economic hardship.',
      keyPoints: [
        'Academic Merit Scholarship: Up to 50% tuition reduction for 3 As at GCE A/Levels or Foundation Distinction (GPA 3.8+)',
        'Sports & Leadership Bursary: Up to 25% waiver for national-level athletes or student society presidents',
        'Emergency Student Hardship Fund: One-off discretionary grants up to LKR 100,000 for unexpected family financial shocks',
        'Semester Installment Plans: Divide semester fees into 3 equal monthly payments with zero penalty or interest surcharge',
        'Application Deadlines: Submit bursary forms before Week 2 of each semester to the Student Finance Desk',
      ],
      ratesOrFees: 'Scholarships cover 10% to 50% of annual course tuition',
      actionLabel: 'Submit Financial Inquiry',
      actionScreen: 'submit_feedback',
    },
  },

  // BR14 - Student Onboarding & First-Year Transition
  {
    id: 'fac-onboarding',
    category: 'onboarding',
    reqCode: 'BR14',
    title: 'First-Year Transition & Campus Orientation',
    subtitle: 'Student ID card pickup, campus building directory & starter checklist',
    location: 'Student Affairs Desk · Ground Floor Lobby',
    hours: 'Mon–Fri 8:00 AM – 6:00 PM · Sat 9:00 AM – 1:00 PM',
    isOpenNow: true,
    contactEmail: 'admissions@ucl.ac.uk',
    contactPhone: '+94 11 234 5678 (Ext 100)',
    iconName: 'checkmark',
    accentColor: '#7c3aed',
    summary: 'Comprehensive onboarding checklist, campus floor layout, student ID pickup, and mentor assignments for new joiners.',
    details: {
      overview:
        'Welcome to Universal College Lanka! This onboarding guide ensures new and transfer students make a seamless transition into university life, settle into their academic routines, and locate essential campus resources.',
      keyPoints: [
        'Step 1: Collect your official UCL RFID Student ID Card and Lanyard from Admissions (Ground Floor)',
        'Step 2: Connect your devices to "UCL-Secure-Student" Wi-Fi using your assigned student ID & initial password',
        'Step 3: Log in to UCL Moodle LMS (lms.ucl.ac.lk) to access lecture slides, timetables, and assignment submission links',
        'Step 4: Activate Library borrowing privileges at Central Library (Level 2) and receive 100 free print credits',
        'Step 5: Attend Society Welcome Fair during Orientation Week to sign up for IEEE, Rotaract, and student sports clubs',
        'Campus Layout Guide: G Floor (Lobby/Auditorium), L1 (Cafeteria/Finance), L2 (Library/Counselor), L3 (Computing Labs), L4 (Sports Arena), L5 (Lecture Theaters)',
      ],
      ratesOrFees: 'First-year orientation package is complimentary for all freshmen',
      actionLabel: 'Explore Student Societies',
      actionScreen: 'societies_directory',
    },
  },
];

const CATEGORY_CHIPS: Array<{ key: FacilityCategory; label: string; count?: number }> = [
  { key: 'all', label: 'All Services (8)' },
  { key: 'dining', label: 'Dining (BR25)' },
  { key: 'library', label: 'Library (BR31)' },
  { key: 'it_support', label: 'IT Support (BR30)' },
  { key: 'sports', label: 'Sports & Gym (BR24)' },
  { key: 'wellbeing', label: 'Wellbeing (BR29)' },
  { key: 'finance_aid', label: 'Finance & Aid (BR23)' },
  { key: 'printing', label: 'Printing (BR26)' },
  { key: 'onboarding', label: 'First-Year (BR14)' },
];

export const CampusFacilitiesHubScreen: React.FC = () => {
  const { navigate, goBack } = useNavigation();

  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);

  const filteredFacilities = useMemo(() => {
    return FACILITIES_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.details.keyPoints.some((p) => p.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleActionPress = (facility: FacilityItem) => {
    if (facility.details.actionScreen) {
      setSelectedFacility(null);
      navigate(facility.details.actionScreen as any);
    } else if (facility.details.actionUrl) {
      if (Platform.OS === 'web') {
        window.open(facility.details.actionUrl, '_blank');
      } else {
        Linking.openURL(facility.details.actionUrl).catch(() => {});
      }
    }
  };

  const handleContactPress = (type: 'email' | 'phone', val: string) => {
    if (type === 'email') {
      Linking.openURL(`mailto:${val}`).catch(() => {
        NativeAlert.alert('Email Contact', val);
      });
    } else {
      Linking.openURL(`tel:${val.replace(/[^0-9+]/g, '')}`).catch(() => {
        NativeAlert.alert('Phone Contact', val);
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextCol}>
            <View style={styles.heroBadgeRow}>
              <StatusBadge label="OFFICIAL CAMPUS DIRECTORY" variant="verified" />
              <Text style={styles.heroCode}>BR14 · BR23–26 · BR29–31</Text>
            </View>
            <Text style={styles.heroTitle}>Campus Life & Essential Facilities</Text>
            <Text style={styles.heroSub}>
              Authoritative operating hours, student menus, Wi-Fi credentials, library resources, gym access, and wellbeing support.
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search facilities, menus, Wi-Fi, scholarships, gym..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Category Horizontal Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {CATEGORY_CHIPS.map((chip) => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              active={selectedCategory === chip.key}
              onPress={() => setSelectedCategory(chip.key)}
            />
          ))}
        </ScrollView>

        {/* Facility Cards List */}
        <View style={styles.listSection}>
          {filteredFacilities.length === 0 ? (
            <Card padding="lg" style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No facilities found</Text>
              <Text style={styles.emptySub}>
                Try searching with different keywords like "dining", "print", "wi-fi", or "scholarship".
              </Text>
              <Button
                title="Reset Filters"
                variant="outline"
                size="sm"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                style={{ marginTop: spacing[3], alignSelf: 'center' }}
              />
            </Card>
          ) : (
            filteredFacilities.map((facility) => (
              <TouchableOpacity
                key={facility.id}
                activeOpacity={0.85}
                onPress={() => setSelectedFacility(facility)}
              >
                <Card style={styles.facilityCard} padding="md">
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.titleGroup}>
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.reqBadge,
                            { backgroundColor: `${facility.accentColor}18` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.reqBadgeText,
                              { color: facility.accentColor },
                            ]}
                          >
                            {facility.reqCode}
                          </Text>
                        </View>
                        <StatusBadge
                          label={facility.isOpenNow ? 'OPEN TODAY' : 'CHECK SCHEDULE'}
                          variant={facility.isOpenNow ? 'verified' : 'neutral'}
                        />
                      </View>
                      <Text style={styles.facilityTitle}>{facility.title}</Text>
                      <Text style={styles.facilitySubtitle}>{facility.subtitle}</Text>
                    </View>
                  </View>

                  <Text style={styles.facilitySummary}>{facility.summary}</Text>

                  {/* Metadata Chips */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <IconSymbol name="building" size={14} color={colors.neutral[500]} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {facility.location}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <IconSymbol name="calendar" size={14} color={colors.neutral[500]} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {facility.hours}
                      </Text>
                    </View>
                  </View>

                  {/* Card Footer */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterHint}>
                      Tap for full operating guide, prices & contacts →
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <Modal
          visible={!!selectedFacility}
          onClose={() => setSelectedFacility(null)}
          title={selectedFacility.title}
        >
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeaderBox}>
              <View style={styles.modalBadgeRow}>
                <View
                  style={[
                    styles.reqBadge,
                    { backgroundColor: `${selectedFacility.accentColor}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.reqBadgeText,
                      { color: selectedFacility.accentColor, fontWeight: '800' },
                    ]}
                  >
                    REQUIREMENT {selectedFacility.reqCode}
                  </Text>
                </View>
                <StatusBadge label="VERIFIED OPERATIONAL" variant="verified" />
              </View>

              <Text style={styles.modalSubtitle}>{selectedFacility.subtitle}</Text>
            </View>

            {/* Quick Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardLabel}>LOCATION</Text>
                <Text style={styles.infoCardVal}>{selectedFacility.location}</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardLabel}>OPERATING HOURS</Text>
                <Text style={styles.infoCardVal}>{selectedFacility.hours}</Text>
              </View>
            </View>

            {/* Overview */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Facility Overview</Text>
              <Text style={styles.modalSectionBody}>
                {selectedFacility.details.overview}
              </Text>
            </View>

            {/* Key Points / Menu / Details */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Key Offerings & Guidelines</Text>
              <View style={styles.pointsList}>
                {selectedFacility.details.keyPoints.map((point, idx) => (
                  <View key={idx} style={styles.pointRow}>
                    <Text style={[styles.bullet, { color: selectedFacility.accentColor }]}>
                      •
                    </Text>
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Rates or Fees */}
            {selectedFacility.details.ratesOrFees && (
              <View style={styles.ratesCard}>
                <Text style={styles.ratesLabel}>STUDENT RATES / ELIGIBILITY</Text>
                <Text style={styles.ratesVal}>
                  {selectedFacility.details.ratesOrFees}
                </Text>
              </View>
            )}

            {/* Official Contact Buttons */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Official Facility Contacts</Text>
              <View style={styles.contactBtnRow}>
                {selectedFacility.contactEmail && (
                  <TouchableOpacity
                    style={styles.contactActionBtn}
                    onPress={() =>
                      handleContactPress('email', selectedFacility.contactEmail!)
                    }
                  >
                    <IconSymbol name="mail" size={16} color={colors.primary[700]} />
                    <Text style={styles.contactBtnText}>
                      {selectedFacility.contactEmail}
                    </Text>
                  </TouchableOpacity>
                )}
                {selectedFacility.contactPhone && (
                  <TouchableOpacity
                    style={styles.contactActionBtn}
                    onPress={() =>
                      handleContactPress('phone', selectedFacility.contactPhone!)
                    }
                  >
                    <IconSymbol name="tool" size={16} color={colors.primary[700]} />
                    <Text style={styles.contactBtnText}>
                      {selectedFacility.contactPhone}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Modal Primary Action */}
            {selectedFacility.details.actionLabel && (
              <Button
                title={selectedFacility.details.actionLabel}
                variant="primary"
                size="lg"
                onPress={() => handleActionPress(selectedFacility)}
                style={styles.modalPrimaryBtn}
              />
            )}
          </ScrollView>
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
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  heroBanner: {
    backgroundColor: colors.neutral[900],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3.5],
  },
  heroTextCol: {
    gap: spacing[1],
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  heroCode: {
    ...typography.caption,
    color: colors.neutral[400],
    fontWeight: '700',
  },
  heroTitle: {
    ...typography.headlineSm,
    color: colors.neutral.white,
    fontWeight: '800',
  },
  heroSub: {
    ...typography.bodySm,
    color: colors.neutral[300],
    lineHeight: 19,
    marginTop: spacing[0.5],
  },
  searchSection: {
    marginBottom: spacing[3],
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingBottom: spacing[3],
  },
  listSection: {
    gap: spacing[3],
  },
  facilityCard: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  titleGroup: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1.5],
  },
  reqBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  reqBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  facilityTitle: {
    ...typography.headlineSm,
    color: colors.neutral[900],
    fontWeight: '800',
    fontSize: 17,
  },
  facilitySubtitle: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 2,
  },
  facilitySummary: {
    ...typography.bodySm,
    color: colors.neutral[700],
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  metaRow: {
    gap: spacing[1.5],
    paddingTop: spacing[2.5],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    marginBottom: spacing[2.5],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  metaText: {
    ...typography.caption,
    color: colors.neutral[600],
    flex: 1,
  },
  cardFooter: {
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  cardFooterHint: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary[700],
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.neutral[800],
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  emptySub: {
    ...typography.bodySm,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  modalScroll: {
    maxHeight: 520,
  },
  modalHeaderBox: {
    marginBottom: spacing[4],
  },
  modalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  modalSubtitle: {
    ...typography.bodySm,
    color: colors.neutral[600],
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.sm,
    padding: spacing[2.5],
  },
  infoCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral[500],
    marginBottom: 2,
  },
  infoCardVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[900],
    lineHeight: 16,
  },
  modalSection: {
    marginBottom: spacing[4],
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.neutral[900],
    marginBottom: spacing[1.5],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalSectionBody: {
    ...typography.bodySm,
    color: colors.neutral[700],
    lineHeight: 21,
  },
  pointsList: {
    gap: spacing[1.5],
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  pointText: {
    ...typography.bodySm,
    color: colors.neutral[700],
    flex: 1,
    lineHeight: 20,
  },
  ratesCard: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: radius.sm,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  ratesLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary[800],
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  ratesVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary[900],
  },
  contactBtnRow: {
    gap: spacing[2],
  },
  contactActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.neutral[100],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.sm,
  },
  contactBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[700],
  },
  modalPrimaryBtn: {
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
});
