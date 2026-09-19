import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, Button, StatusBadge, IconSymbol } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

export const ProfileSettingsScreen: React.FC = () => {
  const { goBack, navigate, currentUser, signOut } = useNavigation();

  // Notification Preferences State
  const [pushEnabled, setPushEnabled] = useState<boolean>(currentUser.notifPrefs?.push ?? true);
  const [noticesEnabled, setNoticesEnabled] = useState<boolean>(true);
  const [eventsEnabled, setEventsEnabled] = useState<boolean>(true);
  const [bookingReminders, setBookingReminders] = useState<boolean>(true);
  const [ticketUpdates, setTicketUpdates] = useState<boolean>(true);

  const isLoggedIn = !!currentUser.id;

  const handleSignOut = () => {
    signOut();
  };

  const handleSignIn = () => {
    navigate('login');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Account & Profile"
        subtitle="Universal College Lanka Credentials"
        showBack
        onBack={goBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoggedIn ? (
          <>
            {/* User Identity Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{currentUser.displayName || 'Campus User'}</Text>
                  <Text style={styles.userEmail}>{currentUser.email}</Text>
                  <View style={styles.roleRow}>
                    <StatusBadge
                      label={currentUser.role.replace('_', ' ').toUpperCase()}
                      variant={currentUser.role === 'student' ? 'academic' : 'verified'}
                    />
                    {currentUser.studentId && (
                      <Text style={styles.studentIdText}>ID: {currentUser.studentId}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.uclEmblemBadge}>
                  <Image
                    source={require('../../../assets/logos/ucl-logo-transparent.png')}
                    style={styles.emblemImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Academic Cohort Strip */}
              <View style={styles.cohortBox}>
                <View style={styles.cohortCol}>
                  <Text style={styles.cohortLabel}>Faculty</Text>
                  <Text style={styles.cohortVal}>{currentUser.faculty || 'Computing'}</Text>
                </View>
                <View style={styles.cohortCol}>
                  <Text style={styles.cohortLabel}>Programme</Text>
                  <Text style={styles.cohortVal}>{currentUser.programme || 'BSc (SE)'}</Text>
                </View>
                <View style={styles.cohortCol}>
                  <Text style={styles.cohortLabel}>Year Group</Text>
                  <Text style={styles.cohortVal}>Year {currentUser.yearGroup || 1}</Text>
                </View>
              </View>
            </View>

            {/* Account Details & Metadata */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>User ID</Text>
                <Text style={styles.detailValue}>{currentUser.id}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Status</Text>
                <Text style={[styles.detailValue, { color: colors.success[700], fontWeight: '700' }]}>
                  {currentUser.status.toUpperCase()}
                </Text>
              </View>

              {currentUser.department && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Department</Text>
                  <Text style={styles.detailValue}>{currentUser.department}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Emergency Mobile (SMS)</Text>
                <Text style={styles.detailValue}>{currentUser.phone || '+94 77 123 4567'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>SMS Broadcast Opt-in</Text>
                <Text style={styles.detailValue}>{currentUser.smsOptIn ? 'Opted-In (Active)' : 'Disabled'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>API Gateway</Text>
                <Text style={styles.detailValue}>asia-south1-ucl-net-prod</Text>
              </View>
            </View>

            {/* Shortcuts Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Activity & Tracking</Text>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigate('my_requests')}
                activeOpacity={0.7}
              >
                <IconSymbol name="document" size={20} color={colors.primary[700]} />
                <View style={styles.menuTextCol}>
                  <Text style={styles.menuTitle}>My Requests & Tickets</Text>
                  <Text style={styles.menuSubtitle}>Track facility, academic, and lost item reports</Text>
                </View>
                <Text style={styles.menuArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigate('my_bookings')}
                activeOpacity={0.7}
              >
                <IconSymbol name="calendar" size={20} color={colors.primary[700]} />
                <View style={styles.menuTextCol}>
                  <Text style={styles.menuTitle}>My Room Reservations</Text>
                  <Text style={styles.menuSubtitle}>View confirmed classroom and study bookings</Text>
                </View>
                <Text style={styles.menuArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigate('societies_directory')}
                activeOpacity={0.7}
              >
                <IconSymbol name="directory" size={20} color={colors.primary[700]} />
                <View style={styles.menuTextCol}>
                  <Text style={styles.menuTitle}>My Societies & Memberships</Text>
                  <Text style={styles.menuSubtitle}>Manage joined campus clubs</Text>
                </View>
                <Text style={styles.menuArrow}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Notification Preferences */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Preferences</Text>

              {/* SMS Emergency Broadcasts (Locked) */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <View style={styles.emergencyTagRow}>
                    <Text style={styles.switchTitle}>Critical Safety SMS Broadcasts</Text>
                    <View style={styles.mandatedBadge}>
                      <Text style={styles.mandatedText}>MANDATORY</Text>
                    </View>
                  </View>
                  <Text style={styles.switchSubtitle}>
                    Instant Text.lk SMS delivery for campus closures and safety alerts.
                  </Text>
                </View>
                <Switch value={true} disabled trackColor={{ true: colors.accent.DEFAULT, false: '#ccc' }} />
              </View>

              {/* Push Notifications */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Mobile Push Notifications</Text>
                  <Text style={styles.switchSubtitle}>Real-time alerts and system notices</Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ true: colors.primary[600], false: '#ccc' }}
                />
              </View>

              {/* Campus Notices */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Targeted Academic Notices</Text>
                  <Text style={styles.switchSubtitle}>Cohort announcements and timetable changes</Text>
                </View>
                <Switch
                  value={noticesEnabled}
                  onValueChange={setNoticesEnabled}
                  trackColor={{ true: colors.primary[600], false: '#ccc' }}
                />
              </View>

              {/* Room Bookings */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Room Booking & Event Reminders</Text>
                  <Text style={styles.switchSubtitle}>Advance reminders for confirmed rooms</Text>
                </View>
                <Switch
                  value={bookingReminders}
                  onValueChange={setBookingReminders}
                  trackColor={{ true: colors.primary[600], false: '#ccc' }}
                />
              </View>

              {/* Ticket Updates */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Request Status Updates</Text>
                  <Text style={styles.switchSubtitle}>Notifications when staff resolve your tickets</Text>
                </View>
                <Switch
                  value={ticketUpdates}
                  onValueChange={setTicketUpdates}
                  trackColor={{ true: colors.primary[600], false: '#ccc' }}
                />
              </View>
            </View>

            {/* Account Sign Out / Switch Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Actions</Text>
              <Button
                title="Sign Out of Campus Hub"
                variant="outline"
                size="lg"
                onPress={handleSignOut}
                style={styles.signOutBtn}
              />
              <View style={{ height: spacing[2] }} />
              <Button
                title="Sign In to Another Account"
                variant="ghost"
                size="md"
                onPress={handleSignIn}
              />
            </View>
          </>
        ) : (
          /* Not Signed In State */
          <View style={styles.emptyContainer}>
            <IconSymbol name="person" size={48} color={colors.neutral[400]} />
            <Text style={styles.emptyTitle}>Not Signed In</Text>
            <Text style={styles.emptySubtitle}>
              Please sign in with your UCL student or staff credentials to access your profile and personalized services.
            </Text>
            <Button
              title="Sign In to Account"
              variant="primary"
              size="lg"
              onPress={handleSignIn}
              style={{ marginTop: spacing[4], width: '100%' }}
            />
          </View>
        )}
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
  profileCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.accent.DEFAULT, // UCL RED
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    fontSize: 20,
    lineHeight: 26,
    color: colors.neutral[0],
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h2,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  userEmail: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 2,
    marginBottom: spacing[1],
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  studentIdText: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '600',
    fontSize: 11,
  },
  uclEmblemBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  emblemImage: {
    width: '100%',
    height: '100%',
  },
  cohortBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary[50],
    borderRadius: radius.sm,
    padding: spacing[3],
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  cohortCol: {
    alignItems: 'center',
  },
  cohortLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary[600],
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cohortVal: {
    ...typography.labelSm,
    color: colors.primary[900],
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    ...typography.labelSm,
    color: colors.neutral[700],
    fontWeight: '700',
    marginBottom: spacing[2.5],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.sm,
    paddingHorizontal: spacing[3.5],
    paddingVertical: spacing[3],
    marginBottom: spacing[2],
  },
  detailLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  detailValue: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3.5],
    marginBottom: spacing[2.5],
  },
  menuTextCol: {
    flex: 1,
    marginLeft: spacing[3],
    marginRight: spacing[2],
  },
  menuTitle: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 2,
  },
  menuArrow: {
    ...typography.caption,
    color: colors.neutral[400],
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3.5],
    marginBottom: spacing[2.5],
  },
  switchTextCol: {
    flex: 1,
    marginRight: spacing[3],
  },
  emergencyTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: 2,
  },
  mandatedBadge: {
    backgroundColor: colors.accent.surface,
    borderColor: colors.accent.border,
    borderWidth: 1,
    paddingHorizontal: spacing[1.5],
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  mandatedText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.accent.DEFAULT,
  },
  switchTitle: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  switchSubtitle: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 2,
    lineHeight: 16,
  },
  signOutBtn: {
    borderColor: colors.accent.DEFAULT,
  },
  emptyContainer: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[4],
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.neutral[900],
    fontWeight: '700',
    marginTop: spacing[3],
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing[2],
    lineHeight: 18,
  },
});
