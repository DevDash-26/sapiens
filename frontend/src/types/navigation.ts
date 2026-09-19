// UCL Campus Hub — Navigation Types for Phase 1 to Phase 6

export type ScreenId =
  // Phase 1 (1–10)
  | 'splash'
  | 'login'
  | 'signup'
  | 'onboarding'
  | 'home'
  | 'announcements_feed'
  | 'announcement_detail'
  | 'alerts_feed'
  | 'schedule_change_notice'
  | 'notifications_center'
  // Phase 2 (11–20)
  | 'events_feed'
  | 'event_detail'
  | 'academic_calendar'
  | 'societies_directory'
  | 'society_detail'
  | 'services_hub'
  | 'lost_found_feed'
  | 'report_lost_item'
  | 'report_found_item'
  | 'item_detail_claim'
  // Phase 3 (21–30)
  | 'report_facility_issue'
  | 'request_academic_support'
  | 'submit_feedback'
  | 'list_textbook'
  | 'browse_textbooks'
  | 'my_requests'
  | 'request_detail'
  | 'classroom_availability'
  | 'room_booking_request'
  | 'my_bookings'
  // Phase 4 (31–40)
  | 'ai_assistant'
  | 'faq'
  | 'staff_directory'
  | 'profile_settings'
  | 'system_states'
  | 'staff_dashboard'
  | 'announcement_composer'
  | 'content_management'
  | 'staff_event_management'
  | 'staff_society_management'
  // Phase 5 (41–50)
  | 'emergency_broadcast'
  | 'schedule_change_broadcast'
  | 'facility_queue'
  | 'academic_support_queue'
  | 'feedback_inbox'
  | 'room_booking_queue'
  | 'lost_found_admin'
  | 'user_role_management'
  | 'faq_management'
  | 'staff_directory_management'
  // Phase 6 (51–53)
  | 'student_highlights'
  | 'opportunities_board'
  | 'admin_overview'
  | 'campus_facilities_hub'
  | 'data_transfer'
  // General aliases
  | 'profile';

export interface NavigationState {
  currentScreen: ScreenId;
  params?: Record<string, any>;
  history: Array<{ screen: ScreenId; params?: Record<string, any> }>;
}
