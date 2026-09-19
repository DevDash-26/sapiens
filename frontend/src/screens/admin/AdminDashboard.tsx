import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseClient';
import { useAuthRBAC } from '../../contexts/AuthRBACContext';
import { Button, FormInput } from '../../components';
import { DataTransfer } from './DataTransfer';

export const AdminDashboard: React.FC = () => {
  const { role, roleDisplayName } = useAuthRBAC();
  const [activeTab, setActiveTab] = useState<'overview' | 'datatransfer' | 'emergency'>('overview');
  const [emergencyTitle, setEmergencyTitle] = useState('');
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const handleBroadcastEmergency = async () => {
    if (!emergencyTitle.trim() || !emergencyMessage.trim()) {
      Alert.alert('Validation Error', 'Please enter both an alert title and emergency message.');
      return;
    }

    setBroadcasting(true);
    try {
      // Adding to "emergencies" collection triggers backend Cloud Function: onEmergencyCreated
      // which dispatches Text.lk SMS alerts to students & staff.
      await addDoc(collection(db, 'emergencies'), {
        title: emergencyTitle,
        message: emergencyMessage,
        severity: 'CRITICAL',
        createdAt: serverTimestamp(),
        sentByRole: role,
        smsDispatched: false,
      });

      Alert.alert(
        'Emergency Broadcast Initiated',
        'Emergency alert logged. Text.lk SMS broadcast trigger is now queued for delivery.'
      );
      setEmergencyTitle('');
      setEmergencyMessage('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to post emergency alert.');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'datatransfer' && styles.tabActive]}
          onPress={() => setActiveTab('datatransfer')}
        >
          <Text style={[styles.tabText, activeTab === 'datatransfer' && styles.tabTextActive]}>Import/Export</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'emergency' && styles.tabActive]}
          onPress={() => setActiveTab('emergency')}
        >
          <Text style={[styles.tabText, activeTab === 'emergency' && styles.tabTextActive]}>Emergency SMS</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'datatransfer' && <DataTransfer />}

      {activeTab === 'emergency' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Broadcast Critical Emergency Alert (BR15)</Text>
          <Text style={styles.subtext}>
            Posting here creates a document in the 'emergencies' collection. A Firebase Cloud Function trigger
            automatically reaches Text.lk API to deliver urgent SMS to all enrolled students and staff.
          </Text>

          <View style={styles.alertCard}>
            <FormInput
              label="Alert Title"
              placeholder="e.g. Severe Weather Warning / Campus Closure"
              value={emergencyTitle}
              onChangeText={setEmergencyTitle}
            />
            <FormInput
              label="Emergency Message (SMS content)"
              placeholder="Keep under 160 characters for single SMS"
              multiline
              numberOfLines={4}
              value={emergencyMessage}
              onChangeText={setEmergencyMessage}
            />
            <Button
              title={broadcasting ? 'Broadcasting via Text.lk...' : 'Trigger Emergency SMS Broadcast'}
              variant="danger"
              onPress={handleBroadcastEmergency}
              loading={broadcasting}
            />
          </View>
        </ScrollView>
      )}

      {activeTab === 'overview' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Administrative Command Center</Text>
          <Text style={styles.subtext}>
            Logged in with role: <Text style={{ fontWeight: 'bold' }}>{roleDisplayName}</Text>
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Configured Roles</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>Active</Text>
              <Text style={styles.statLabel}>Text.lk SMS Gateway</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>Ready</Text>
              <Text style={styles.statLabel}>CSV/JSON Migration</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#1e3a8a',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
});
