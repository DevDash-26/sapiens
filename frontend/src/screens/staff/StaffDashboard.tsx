import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseClient';
import { useAuthRBAC } from '../../contexts/AuthRBACContext';
import { Button, FormInput } from '../../components';

export const StaffDashboard: React.FC = () => {
  const { role, profile, roleDisplayName } = useAuthRBAC();
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventDescription.trim()) {
      Alert.alert('Error', 'Please fill in all event details.');
      return;
    }
    setIsPublishing(true);
    try {
      await addDoc(collection(db, 'events'), {
        title: eventTitle,
        description: eventDescription,
        creatorUid: profile?.uid,
        creatorRole: role,
        createdAt: serverTimestamp(),
        approved: role === 'academic_staff', // auto-approve for staff, pending for society rep
      });
      Alert.alert('Success', 'Event published or submitted for review.');
      setEventTitle('');
      setEventDescription('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit event.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Staff & Society Portal</Text>
      <Text style={styles.subtext}>
        Role: <Text style={{ fontWeight: '700' }}>{roleDisplayName}</Text>
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {role === 'society_rep' ? 'Submit Society Event' : 'Create Academic Notice / Event'}
        </Text>
        <FormInput
          label="Event / Notice Title"
          placeholder="e.g. Annual Hackathon 2026 / Lecture Reschedule"
          value={eventTitle}
          onChangeText={setEventTitle}
        />
        <FormInput
          label="Details"
          placeholder="Provide detailed information, venue, date, and prerequisites"
          multiline
          numberOfLines={4}
          value={eventDescription}
          onChangeText={setEventDescription}
        />
        <Button
          title={isPublishing ? 'Publishing...' : 'Publish to Campus Feed'}
          onPress={handleCreateEvent}
          loading={isPublishing}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
});
