import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Button, FormField, StatusBadge, Modal } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

interface SocietyMemberEntry {
  id: string;
  name: string;
  degree: string;
  year: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

const INITIAL_MEMBERS: SocietyMemberEntry[] = [
  {
    id: 'sm_01',
    name: 'Nimasha Perera',
    degree: 'BSc Software Engineering',
    year: 2,
    message: 'Eager to contribute to the autonomous drone navigation project and robot hardware build.',
    status: 'approved',
    date: '19 Sep 2026',
  },
  {
    id: 'sm_02',
    name: 'Kavindu Senanayake',
    degree: 'BSc Computer Science',
    year: 1,
    message: 'Passionate about Arduino microcontrollers and PCB designing.',
    status: 'pending',
    date: '19 Sep 2026',
  },
  {
    id: 'sm_03',
    name: 'Dilshan Wickramasinghe',
    degree: 'BEng Civil Engineering',
    year: 3,
    message: 'Looking to collaborate on sensor integration for smart buildings.',
    status: 'pending',
    date: '18 Sep 2026',
  },
  {
    id: 'sm_04',
    name: 'Asha Jayatilleke',
    degree: 'BBA Business Administration',
    year: 2,
    message: 'Interested in tech event management and sponsorship outreach.',
    status: 'approved',
    date: '15 Sep 2026',
  },
];

export const StaffSocietyManagementScreen: React.FC = () => {
  const { goBack, navigate, societies, currentUser } = useNavigation();

  const [members, setMembers] = useState<SocietyMemberEntry[]>(INITIAL_MEMBERS);
  const [meetingInfo, setMeetingInfo] = useState<string>('Fridays 5:00 PM – Lab 2 (Hardware Lab)');
  const [contactEmail, setContactEmail] = useState<string>('robotics@ucl.demo');
  const [socialHandle, setSocialHandle] = useState<string>('@ucl_robotics');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberDegree, setNewMemberDegree] = useState<string>('BSc Software Engineering');
  const [newMemberMessage, setNewMemberMessage] = useState<string>('');

  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const approvedCount = members.filter((m) => m.status === 'approved').length;

  const handleApprove = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'approved' } : m))
    );
  };

  const handleReject = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'rejected' } : m))
    );
  };

  const handleSaveProfile = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 1500);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const newEntry: SocietyMemberEntry = {
      id: `sm_${Date.now()}`,
      name: newMemberName.trim(),
      degree: newMemberDegree.trim() || 'BSc Software Engineering',
      year: 1,
      message: newMemberMessage.trim() || 'Enrolled via Society Operations Console',
      status: 'approved',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setMembers((prev) => [newEntry, ...prev]);
    setShowAddMemberModal(false);
    setNewMemberName('');
    setNewMemberMessage('');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Operations Strip */}
        <View style={styles.quickOpsCard}>
          <TouchableOpacity
            style={styles.quickOpBtn}
            onPress={() => navigate('staff_event_management', { openCreate: true })}
            activeOpacity={0.8}
          >
            <Text style={styles.quickOpBtnIcon}>📅</Text>
            <Text style={styles.quickOpBtnText}>+ Club Event</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickOpBtn}
            onPress={() => navigate('announcement_composer')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickOpBtnIcon}>📢</Text>
            <Text style={styles.quickOpBtnText}>+ Club Notice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickOpBtn, styles.quickOpBtnPrimary]}
            onPress={() => setShowAddMemberModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.quickOpBtnIcon}>👤</Text>
            <Text style={[styles.quickOpBtnText, { color: '#ffffff' }]}>+ Add Member</Text>
          </TouchableOpacity>
        </View>

        {/* Club Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.clubIconBox}>
              <Text style={styles.clubIcon}>🤖</Text>
            </View>
            <View style={styles.clubTitleCol}>
              <Text style={styles.clubName}>UCL Robotics Club</Text>
              <Text style={styles.clubRep}>President: Tharindu Jayasuriya (usr_rep_01)</Text>
            </View>
          </View>

          {/* Membership Stats */}
          <View style={styles.statsStrip}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{approvedCount + 40}</Text>
              <Text style={styles.statLbl}>Active Members</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: colors.warning[600] }]}>{pendingCount}</Text>
              <Text style={styles.statLbl}>Pending Review</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: colors.primary[700] }]}>12</Text>
              <Text style={styles.statLbl}>Events Held</Text>
            </View>
          </View>
        </View>

        {/* Membership Application Queue */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Membership Join Requests ({pendingCount})</Text>
            <Text style={styles.queueNote}>Approve or reject candidate sign-ups</Text>
          </View>

          {members.map((member) => {
            const isPending = member.status === 'pending';
            const isApproved = member.status === 'approved';

            return (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberTop}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.avatarLetter}>{member.name[0]}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberDegree}>
                      {member.degree} · Year {member.year}
                    </Text>
                  </View>
                  <StatusBadge status={member.status} />
                </View>

                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>"{member.message}"</Text>
                </View>

                <View style={styles.memberFooter}>
                  <Text style={styles.dateText}>Applied on {member.date}</Text>

                  {isPending && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => handleApprove(member.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.approveBtnText}>✓ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleReject(member.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.rejectBtnText}>✕ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isApproved && (
                    <Text style={styles.enrolledText}>✓ Enrolled in Active Roster</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Editable Club Profile Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Club Settings & Logistics</Text>

          <FormField
            label="Weekly Meeting Schedule & Venue"
            value={meetingInfo}
            onChangeText={setMeetingInfo}
            placeholder="e.g. Fridays 5:00 PM – Lab 2"
          />

          <FormField
            label="Official Contact Email"
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="e.g. robotics@ucl.demo"
          />

          <FormField
            label="Instagram / Social Handle"
            value={socialHandle}
            onChangeText={setSocialHandle}
            placeholder="e.g. @ucl_robotics"
          />

          {saveSuccess ? (
            <View style={styles.saveSuccessBox}>
              <Text style={styles.saveSuccessText}>✓ Society profile settings updated!</Text>
            </View>
          ) : (
            <Button
              title="Save Profile Updates"
              variant="secondary"
              size="md"
              onPress={handleSaveProfile}
            />
          )}
        </View>
      </ScrollView>

      {/* Add Society Member Modal */}
      <Modal
        visible={showAddMemberModal}
        title="Register Society Member"
        onClose={() => setShowAddMemberModal(false)}
      >
        <View style={{ paddingTop: spacing[2] }}>
          <FormField
            label="Student Full Name"
            value={newMemberName}
            onChangeText={setNewMemberName}
            placeholder="e.g. Kasun Fernando"
          />
          <FormField
            label="Degree Programme"
            value={newMemberDegree}
            onChangeText={setNewMemberDegree}
            placeholder="e.g. BSc Software Engineering"
          />
          <FormField
            label="Introduction or Interests"
            value={newMemberMessage}
            onChangeText={setNewMemberMessage}
            placeholder="e.g. Interested in robotics hardware builds"
            multiline
            numberOfLines={3}
          />
          <Button
            title="Add to Club Roster"
            variant="primary"
            size="md"
            onPress={handleAddMember}
            style={{ marginTop: spacing[3] }}
          />
        </View>
      </Modal>
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
  quickOpsCard: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  quickOpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[1],
    gap: 4,
  },
  quickOpBtnPrimary: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  quickOpBtnIcon: {
    fontSize: 14,
  },
  quickOpBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  profileCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  clubIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  clubIcon: {
    fontSize: 22,
  },
  clubTitleCol: {
    flex: 1,
  },
  clubName: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
  },
  clubRep: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 1,
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.sm,
    padding: spacing[2.5],
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    ...typography.labelMd,
    color: colors.neutral[900],
    fontWeight: '800',
  },
  statLbl: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[500],
    marginTop: 1,
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2.5],
  },
  sectionTitle: {
    ...typography.labelSm,
    color: colors.neutral[800],
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  queueNote: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  memberCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    padding: spacing[3.5],
    marginBottom: spacing[2.5],
  },
  memberTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[2.5],
  },
  avatarLetter: {
    ...typography.labelSm,
    color: colors.primary[800],
    fontWeight: '800',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...typography.labelSm,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  memberDegree: {
    ...typography.caption,
    fontSize: 11,
    color: colors.neutral[500],
  },
  messageBox: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.sm,
    padding: spacing[2],
    marginBottom: spacing[2.5],
  },
  messageText: {
    ...typography.caption,
    color: colors.neutral[700],
    fontStyle: 'italic',
    lineHeight: 16,
  },
  memberFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[400],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[1.5],
  },
  approveBtn: {
    backgroundColor: colors.success[50],
    borderWidth: 1,
    borderColor: colors.success[300],
    borderRadius: radius.sm,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
  },
  approveBtnText: {
    ...typography.caption,
    color: colors.success[800],
    fontWeight: '700',
    fontSize: 11,
  },
  rejectBtn: {
    backgroundColor: colors.critical[50],
    borderWidth: 1,
    borderColor: colors.critical[200],
    borderRadius: radius.sm,
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
  },
  rejectBtnText: {
    ...typography.caption,
    color: colors.critical[700],
    fontWeight: '700',
    fontSize: 11,
  },
  enrolledText: {
    ...typography.caption,
    color: colors.success[700],
    fontWeight: '700',
    fontSize: 11,
  },
  saveSuccessBox: {
    backgroundColor: colors.success[50],
    padding: spacing[2.5],
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  saveSuccessText: {
    ...typography.caption,
    color: colors.success[800],
    fontWeight: '700',
  },
});
