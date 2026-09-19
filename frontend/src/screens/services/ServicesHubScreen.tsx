import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';
import { ListRow } from '../../components/common/ListRow';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useNavigation } from '../../contexts/NavigationContext';

export const ServicesHubScreen: React.FC = () => {
  const { navigate, requests, bookings, currentUser } = useNavigation();

  const openLostFoundCount = requests.filter(
    (r) => (r.type === 'lost' || r.type === 'found') && r.status === 'open'
  ).length;

  const myActiveRequestsCount = requests.filter(
    (r) => r.ownerUid === currentUser.id && r.status !== 'closed' && r.status !== 'resolved'
  ).length;

  const myActiveBookingsCount = bookings.filter(
    (b) => b.uid === currentUser.id && b.status === 'confirmed'
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Campus Services Hub</Text>
        <Text style={styles.subtitle}>
          One-stop portal for campus requests, room reservations, lost & found, textbook exchange, and student assistance.
        </Text>
      </View>

      {/* Quick Access Tracker Banner */}
      <View style={styles.quickBannerRow}>
        <View style={styles.quickCard}>
          <Text style={styles.quickNum}>{myActiveRequestsCount}</Text>
          <Text style={styles.quickLabel}>My Active Tickets</Text>
        </View>
        <View style={styles.quickCard}>
          <Text style={styles.quickNum}>{myActiveBookingsCount}</Text>
          <Text style={styles.quickLabel}>My Room Bookings</Text>
        </View>
      </View>

      <SectionHeader title="Personal Tracking & Portals" />

      {/* My Requests (Screen 26) */}
      <ListRow
        title="My Requests & Ticket Tracking"
        subtitle="Unified tracking dashboard for your facility issues, academic support, feedback, and lost items."
        badgeLabel="TRACKING"
        badgeVariant="academic"
        meta={`${myActiveRequestsCount} active`}
        onPress={() => navigate('my_requests')}
      />

      {/* My Bookings (Screen 30) */}
      <ListRow
        title="My Room Reservations"
        subtitle="View confirmed room bookings, cancel reservations, or check upcoming slots."
        badgeLabel="RESERVATIONS"
        badgeVariant="verified"
        meta={`${myActiveBookingsCount} booked`}
        onPress={() => navigate('my_bookings')}
      />

      <SectionHeader title="Campus Requests & Utilities" />

      {/* Classroom Availability (Screen 28) */}
      <ListRow
        title="Classroom & Study Room Booking"
        subtitle="Live clash-free room schedule browser with instant reservation."
        badgeLabel="BR8"
        badgeVariant="academic"
        onPress={() => navigate('classroom_availability')}
      />

      {/* Report Facility Issue (Screen 21) */}
      <ListRow
        title="Report Campus Facility Issue"
        subtitle="Log electrical, IT, plumbing, or classroom equipment faults directly to Estates team."
        badgeLabel="MAINTENANCE"
        badgeVariant="warning"
        onPress={() => navigate('report_facility_issue')}
      />

      {/* Academic Support (Screen 22) */}
      <ListRow
        title="Request Academic Peer Support"
        subtitle="Peer tutoring, student study groups, and faculty mentoring request portal."
        badgeLabel="ACADEMIC"
        badgeVariant="neutral"
        onPress={() => navigate('request_academic_support')}
      />

      {/* Textbook Exchange (Screen 25) */}
      <ListRow
        title="Textbook & Material Exchange"
        subtitle="Browse and list textbooks for free giveaways, peer swaps, or student sales."
        badgeLabel="BR27"
        badgeVariant="neutral"
        onPress={() => navigate('browse_textbooks')}
      />

      {/* Lost & Found Registry (Screen 17) */}
      <ListRow
        title="Lost & Found Registry"
        subtitle="Report lost belongings, browse found items, and submit verified ownership claims."
        badgeLabel="BR7"
        badgeVariant="verified"
        meta={`${openLostFoundCount} open`}
        onPress={() => navigate('lost_found_feed')}
      />

      {/* Submit Feedback (Screen 23) */}
      <ListRow
        title="Submit Feedback / Question"
        subtitle="Share suggestions, raise grievances, or report outdated campus information."
        badgeLabel="BR17"
        badgeVariant="neutral"
        onPress={() => navigate('submit_feedback')}
      />

      <SectionHeader title="Campus Facilities & Student Life" />

      {/* Campus Facilities Hub (BR14, BR23–26, BR29–31) */}
      <ListRow
        title="Campus Facilities & Student Life Hub"
        subtitle="Canteen menus, library research databases, IT Wi-Fi setup, gym access, printing, and scholarships."
        badgeLabel="ESSENTIALS"
        badgeVariant="verified"
        meta="8 services"
        onPress={() => navigate('campus_facilities_hub')}
      />

      {/* Opportunities Board (BR18–20) */}
      <ListRow
        title="Opportunities & Career Board"
        subtitle="Internships, student jobs, community volunteering, and alumni mentorship connections."
        badgeLabel="CAREERS"
        badgeVariant="academic"
        onPress={() => navigate('opportunities_board')}
      />

      {/* Student Highlights (BR32) */}
      <ListRow
        title="Student Life Milestone Highlights"
        subtitle="Celebrate campus achievements, graduation galleries, hackathon wins, and university milestones."
        badgeLabel="SPOTLIGHT"
        badgeVariant="neutral"
        onPress={() => navigate('student_highlights')}
      />

      <SectionHeader title="Information & Directories" />

      {/* Societies & Clubs (Screen 14) */}
      <ListRow
        title="Student Societies & Clubs"
        subtitle="Explore 20+ active student organizations, register for memberships, and view meetings."
        badgeLabel="DIRECTORY"
        badgeVariant="academic"
        onPress={() => navigate('societies_directory')}
      />

      {/* Academic Calendar (Screen 13) */}
      <ListRow
        title="Academic Calendar & Milestones"
        subtitle="View semester exam schedules, add/drop deadlines, and university holidays."
        badgeLabel="OFFICIAL"
        badgeVariant="neutral"
        onPress={() => navigate('academic_calendar')}
      />

      {/* Staff Directory (BR22) */}
      <ListRow
        title="Staff & Department Directory"
        subtitle="Search academic lecturers, course coordinators, student counsellors, and administrative staff."
        badgeLabel="DIRECTORY"
        badgeVariant="neutral"
        onPress={() => navigate('staff_directory')}
      />

      {/* FAQ Knowledgebase (BR10) */}
      <ListRow
        title="Frequently Asked Questions (FAQ)"
        subtitle="Find instant answers to common student questions about exams, timetables, and campus facilities."
        badgeLabel="KNOWLEDGE"
        badgeVariant="neutral"
        onPress={() => navigate('faq')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  header: {
    marginBottom: spacing[4],
  },
  title: {
    ...typography.headlineMd,
    color: colors.neutral[900],
    fontWeight: '800',
    marginBottom: spacing[1],
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.neutral[500],
    lineHeight: 20,
  },
  quickBannerRow: {
    flexDirection: 'row',
    gap: spacing[2.5],
    marginBottom: spacing[4],
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.neutral.card,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
  },
  quickNum: {
    ...typography.headlineSm,
    color: colors.primary[700],
    fontWeight: '800',
    marginBottom: spacing[0.5],
  },
  quickLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '600',
  },
});
