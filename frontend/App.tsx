import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { AuthRBACProvider } from './src/contexts/AuthRBACContext';
import {
  NavigationProvider,
  useNavigation,
} from './src/contexts/NavigationContext';
import {
  Header,
  BottomTabBar,
  IconSymbol,
} from './src/components';
import { canAccessScreen } from './src/utils/rbacGuard';
import {
  // Phase 1 (1–10)
  SplashScreen,
  LoginScreen,
  SignUpScreen,
  OnboardingScreen,
  HomeScreen,
  AnnouncementsFeedScreen,
  AnnouncementDetailScreen,
  AlertsFeedScreen,
  ScheduleChangeNoticeScreen,
  NotificationsCenterScreen,
  // Phase 2 (11–20)
  EventsFeedScreen,
  EventDetailScreen,
  AcademicCalendarScreen,
  SocietiesDirectoryScreen,
  SocietyDetailScreen,
  ServicesHubScreen,
  LostAndFoundFeedScreen,
  ReportLostItemScreen,
  ReportFoundItemScreen,
  ItemDetailClaimScreen,
  // Phase 3 (21–30)
  ReportFacilityIssueScreen,
  RequestAcademicSupportScreen,
  SubmitFeedbackScreen,
  ListTextbookScreen,
  BrowseTextbookExchangeScreen,
  MyRequestsScreen,
  RequestDetailTimelineScreen,
  ClassroomAvailabilityScreen,
  RoomBookingRequestScreen,
  MyBookingsScreen,
  // Phase 4 (31–40)
  AIAssistantScreen,
  FAQScreen,
  StaffDirectoryScreen,
  ProfileSettingsScreen,
  SystemStatesScreen,
  StaffConsoleHomeScreen,
  AnnouncementComposerScreen,
  ContentManagementListScreen,
  StaffEventManagementScreen,
  StaffSocietyManagementScreen,
  // Phase 5 (41–50)
  EmergencyAlertBroadcastScreen,
  ScheduleChangeBroadcastScreen,
  FacilityIssueQueueScreen,
  AcademicSupportQueueScreen,
  FeedbackInboxScreen,
  RoomBookingApprovalQueueScreen,
  LostAndFoundAdminScreen,
  UserRoleManagementScreen,
  FAQManagementScreen,
  StaffDirectoryManagementScreen,
  // Phase 6 (51–53)
  StudentLifeHighlightsScreen,
  OpportunitiesBoardScreen,
  AdminOverviewDashboardScreen,
  CampusFacilitiesHubScreen,
  // Portal Dashboards
  AdminDashboard,
  DataTransfer,
  StaffDashboard,
  AlumniDashboard,
} from './src/screens';
import { colors } from './src/theme/colors';
import { spacing } from './src/theme/spacing';
import { radius } from './src/theme/radius';
import { ScreenId } from './src/types/navigation';
import { Role } from './src/types/contract';

const MainAppContainer: React.FC = () => {
  const {
    currentScreen,
    navigate,
    goBack,
    currentUser,
    activeRole,
    setRoleOverride,
    unreadNotifsCount,
    activeAlertsCount,
  } = useNavigation();

  const isAuthScreen =
    currentScreen === 'splash' ||
    currentScreen === 'login' ||
    currentScreen === 'signup' ||
    currentScreen === 'onboarding';

  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'home':
        return 'UCL Campus Hub';
      case 'announcements_feed':
        return 'Campus Notices';
      case 'announcement_detail':
        return 'Notice Details';
      case 'alerts_feed':
        return 'Safety & Alerts';
      case 'schedule_change_notice':
        return 'Schedule Change';
      case 'notifications_center':
        return 'Notifications';
      case 'events_feed':
        return 'Events & Workshops';
      case 'event_detail':
        return 'Event Details';
      case 'academic_calendar':
        return 'Academic Calendar';
      case 'societies_directory':
        return 'Student Societies';
      case 'society_detail':
        return 'Society Profile';
      case 'services_hub':
        return 'Campus Services';
      case 'lost_found_feed':
        return 'Lost & Found';
      case 'report_lost_item':
        return 'Report Lost Item';
      case 'report_found_item':
        return 'Report Found Item';
      case 'item_detail_claim':
        return 'Item Details & Claim';
      case 'report_facility_issue':
        return 'Report Facility Defect';
      case 'request_academic_support':
        return 'Academic Support';
      case 'submit_feedback':
        return 'Submit Feedback';
      case 'list_textbook':
        return 'List a Textbook';
      case 'browse_textbooks':
        return 'Textbook Exchange';
      case 'my_requests':
        return 'My Requests & Tracking';
      case 'request_detail':
        return 'Request Timeline';
      case 'classroom_availability':
        return 'Classroom Availability';
      case 'room_booking_request':
        return 'Book a Room';
      case 'my_bookings':
        return 'My Room Reservations';
      case 'ai_assistant':
        return 'AI Campus Assistant';
      case 'faq':
        return 'Frequently Asked Questions';
      case 'staff_directory':
        return 'Staff Directory';
      case 'profile_settings':
        return 'Profile & Settings';
      case 'system_states':
        return 'System States';
      case 'staff_dashboard':
        return 'Staff Console';
      case 'announcement_composer':
        return 'Compose Notice';
      case 'content_management':
        return 'Content Management';
      case 'staff_event_management':
        return 'Event Operations';
      case 'staff_society_management':
        return 'Society Operations';
      case 'emergency_broadcast':
        return 'Emergency Broadcast';
      case 'schedule_change_broadcast':
        return 'Schedule Broadcast';
      case 'facility_queue':
        return 'Facility Defect Queue';
      case 'academic_support_queue':
        return 'Academic Support Queue';
      case 'feedback_inbox':
        return 'Feedback Inbox';
      case 'room_booking_queue':
        return 'Room Booking Queue';
      case 'lost_found_admin':
        return 'Lost & Found Admin';
      case 'user_role_management':
        return 'User & Access Roles';
      case 'faq_management':
        return 'FAQ Management';
      case 'staff_directory_management':
        return 'Staff Directory Admin';
      case 'student_highlights':
        return 'Student Life Highlights';
      case 'opportunities_board':
        return 'Opportunities Board';
      case 'admin_overview':
        return 'Admin Overview Dashboard';
      case 'campus_facilities_hub':
        return 'Campus Facilities & Life';
      case 'data_transfer':
        return 'Bulk Data Transfer (NFR5)';
      default:
        return 'UCL Campus Hub';
    }
  };

  const getHeaderSubtitle = () => {
    if (activeRole !== 'student') {
      return `${activeRole.replace('_', ' ').toUpperCase()} VIEW`;
    }
    return currentUser.programme || 'Software Engineering · Year 2';
  };

  const shouldShowBackButton = () => {
    return (
      currentScreen === 'announcement_detail' ||
      currentScreen === 'schedule_change_notice' ||
      currentScreen === 'event_detail' ||
      currentScreen === 'academic_calendar' ||
      currentScreen === 'society_detail' ||
      currentScreen === 'report_lost_item' ||
      currentScreen === 'report_found_item' ||
      currentScreen === 'item_detail_claim' ||
      currentScreen === 'report_facility_issue' ||
      currentScreen === 'request_academic_support' ||
      currentScreen === 'submit_feedback' ||
      currentScreen === 'list_textbook' ||
      currentScreen === 'browse_textbooks' ||
      currentScreen === 'my_requests' ||
      currentScreen === 'request_detail' ||
      currentScreen === 'classroom_availability' ||
      currentScreen === 'room_booking_request' ||
      currentScreen === 'my_bookings' ||
      currentScreen === 'ai_assistant' ||
      currentScreen === 'faq' ||
      currentScreen === 'staff_directory' ||
      currentScreen === 'profile_settings' ||
      currentScreen === 'system_states' ||
      currentScreen === 'announcement_composer' ||
      currentScreen === 'content_management' ||
      currentScreen === 'staff_event_management' ||
      currentScreen === 'staff_society_management' ||
      currentScreen === 'emergency_broadcast' ||
      currentScreen === 'schedule_change_broadcast' ||
      currentScreen === 'facility_queue' ||
      currentScreen === 'academic_support_queue' ||
      currentScreen === 'feedback_inbox' ||
      currentScreen === 'room_booking_queue' ||
      currentScreen === 'lost_found_admin' ||
      currentScreen === 'user_role_management' ||
      currentScreen === 'faq_management' ||
      currentScreen === 'staff_directory_management' ||
      currentScreen === 'student_highlights' ||
      currentScreen === 'opportunities_board' ||
      currentScreen === 'admin_overview' ||
      currentScreen === 'campus_facilities_hub' ||
      currentScreen === 'data_transfer'
    );
  };

  const renderActiveScreen = () => {
    // Strictly enforce RBAC access control per API-Contract+DataModel.md §3
    if (!canAccessScreen(activeRole, currentScreen)) {
      return (
        <View style={styles.restrictedContainer}>
          <View style={styles.restrictedCard}>
            <Text style={styles.restrictedIcon}>🔒</Text>
            <Text style={styles.restrictedTitle}>Access Restricted (403)</Text>
            <Text style={styles.restrictedText}>
              Your current role ({activeRole.replace('_', ' ').toUpperCase()}) does not have permission to access this console.
            </Text>
            <Text style={styles.restrictedSubtext}>
              Universal College Lanka RBAC enforces strict least-privilege security per the API Contract specification.
            </Text>
            <TouchableOpacity
              style={styles.restrictedButton}
              onPress={() => navigate('home')}
              activeOpacity={0.8}
            >
              <Text style={styles.restrictedButtonText}>Return to Authorized Portal</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // If role is non-student and user is on home, show corresponding portal dashboard
    if (currentScreen === 'home') {
      if (activeRole === 'super_admin' || activeRole === 'admin') {
        return <AdminOverviewDashboardScreen />;
      }
      if (activeRole === 'manager') {
        return <StaffConsoleHomeScreen />;
      }
      if (activeRole === 'academic_staff' || activeRole === 'finance_staff' || activeRole === 'society_rep') {
        return <StaffConsoleHomeScreen />;
      }
      if (activeRole === 'alumni') {
        return <AlumniDashboard />;
      }
    }

    switch (currentScreen) {
      // Phase 1 (1–10)
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return <LoginScreen />;
      case 'signup':
        return <SignUpScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'home':
        return <HomeScreen />;
      case 'announcements_feed':
        return <AnnouncementsFeedScreen />;
      case 'announcement_detail':
        return <AnnouncementDetailScreen />;
      case 'alerts_feed':
        return <AlertsFeedScreen />;
      case 'schedule_change_notice':
        return <ScheduleChangeNoticeScreen />;
      case 'notifications_center':
        return <NotificationsCenterScreen />;
      // Phase 2 (11–20)
      case 'events_feed':
        return <EventsFeedScreen />;
      case 'event_detail':
        return <EventDetailScreen />;
      case 'academic_calendar':
        return <AcademicCalendarScreen />;
      case 'societies_directory':
        return <SocietiesDirectoryScreen />;
      case 'society_detail':
        return <SocietyDetailScreen />;
      case 'services_hub':
        return <ServicesHubScreen />;
      case 'lost_found_feed':
        return <LostAndFoundFeedScreen />;
      case 'report_lost_item':
        return <ReportLostItemScreen />;
      case 'report_found_item':
        return <ReportFoundItemScreen />;
      case 'item_detail_claim':
        return <ItemDetailClaimScreen />;
      // Phase 3 (21–30)
      case 'report_facility_issue':
        return <ReportFacilityIssueScreen />;
      case 'request_academic_support':
        return <RequestAcademicSupportScreen />;
      case 'submit_feedback':
        return <SubmitFeedbackScreen />;
      case 'list_textbook':
        return <ListTextbookScreen />;
      case 'browse_textbooks':
        return <BrowseTextbookExchangeScreen />;
      case 'my_requests':
        return <MyRequestsScreen />;
      case 'request_detail':
        return <RequestDetailTimelineScreen />;
      case 'classroom_availability':
        return <ClassroomAvailabilityScreen />;
      case 'room_booking_request':
        return <RoomBookingRequestScreen />;
      case 'my_bookings':
        return <MyBookingsScreen />;
      // Phase 4 (31–40)
      case 'ai_assistant':
        return <AIAssistantScreen />;
      case 'faq':
        return <FAQScreen />;
      case 'staff_directory':
        return <StaffDirectoryScreen />;
      case 'profile_settings':
        return <ProfileSettingsScreen />;
      case 'system_states':
        return <SystemStatesScreen />;
      case 'staff_dashboard':
        return <StaffConsoleHomeScreen />;
      case 'announcement_composer':
        return <AnnouncementComposerScreen />;
      case 'content_management':
        return <ContentManagementListScreen />;
      case 'staff_event_management':
        return <StaffEventManagementScreen />;
      case 'staff_society_management':
        return <StaffSocietyManagementScreen />;
      // Phase 5 (41–50)
      case 'emergency_broadcast':
        return <EmergencyAlertBroadcastScreen />;
      case 'schedule_change_broadcast':
        return <ScheduleChangeBroadcastScreen />;
      case 'facility_queue':
        return <FacilityIssueQueueScreen />;
      case 'academic_support_queue':
        return <AcademicSupportQueueScreen />;
      case 'feedback_inbox':
        return <FeedbackInboxScreen />;
      case 'room_booking_queue':
        return <RoomBookingApprovalQueueScreen />;
      case 'lost_found_admin':
        return <LostAndFoundAdminScreen />;
      case 'user_role_management':
        return <UserRoleManagementScreen />;
      case 'faq_management':
        return <FAQManagementScreen />;
      case 'staff_directory_management':
        return <StaffDirectoryManagementScreen />;
      // Phase 6 (51–53)
      case 'student_highlights':
        return <StudentLifeHighlightsScreen />;
      case 'opportunities_board':
        return <OpportunitiesBoardScreen />;
      case 'admin_overview':
        return <AdminOverviewDashboardScreen />;
      case 'campus_facilities_hub':
        return <CampusFacilitiesHubScreen />;
      case 'data_transfer':
        return <DataTransfer />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.dark} />

      {/* Constrained Mobile Frame for Desktop and Mobile Web */}
      <View style={styles.appFrame}>
        {/* Global Navigation Header (Shown on content screens) */}
        {!isAuthScreen && (
          <Header
            title={getHeaderTitle()}
            subtitle={getHeaderSubtitle()}
            onBack={shouldShowBackButton() ? goBack : undefined}
            onNotificationPress={() => navigate('notifications_center')}
            unreadCount={unreadNotifsCount}
            onProfilePress={() => navigate('profile_settings')}
          />
        )}

        {/* Floating AI Campus Assistant Hovering Button */}
        {!isAuthScreen && currentScreen !== 'ai_assistant' && (
          <TouchableOpacity
            style={styles.floatingAiButton}
            onPress={() => navigate('ai_assistant')}
            activeOpacity={0.85}
          >
            <IconSymbol name="sparkles" size={24} color="#ffffff" active />
            <View style={styles.floatingAiPulse} />
          </TouchableOpacity>
        )}

        {/* Bottom Tab Bar (Visible on primary screens with RBAC role filter) */}
        {!isAuthScreen && (
          <BottomTabBar
            currentScreen={currentScreen}
            onNavigate={(screenId: ScreenId) => navigate(screenId)}
            unreadNotifsCount={unreadNotifsCount}
            activeAlertsCount={activeAlertsCount}
            activeRole={activeRole}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthRBACProvider>
      <NavigationProvider>
        <MainAppContainer />
      </NavigationProvider>
    </AuthRBACProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 480, // Constrained mobile aspect ratio per 01-DESIGN-SYSTEM.md
    backgroundColor: colors.neutral.bg,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        minHeight: ('100vh' as any),
      },
    }),
  },
  screenContent: {
    flex: 1,
  },
  restrictedContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.bg,
  },
  restrictedCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    maxWidth: 380,
    width: '100%',
  },
  restrictedIcon: {
    fontSize: 42,
    marginBottom: spacing.md,
  },
  restrictedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.accent.DEFAULT,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  restrictedText: {
    fontSize: 14,
    color: colors.neutral.text,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  restrictedSubtext: {
    fontSize: 12,
    color: colors.neutral.textMuted,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  restrictedButton: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.control,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  restrictedButtonText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '700',
  },
  floatingAiButton: {
    position: 'absolute',
    bottom: 78,
    right: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e12229',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  floatingAiEmoji: {
    fontSize: 24,
  },
  floatingAiPulse: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
