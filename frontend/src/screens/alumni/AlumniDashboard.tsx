import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthRBAC } from '../../contexts/AuthRBACContext';

export const AlumniDashboard: React.FC = () => {
  const { profile, roleDisplayName } = useAuthRBAC();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Alumni Community Hub</Text>
      <Text style={styles.subtext}>
        Role: <Text style={{ fontWeight: '700' }}>{roleDisplayName}</Text>
      </Text>

      <View style={styles.welcomeBanner}>
        <Text style={styles.welcomeTitle}>Welcome back, UCL Alumnus!</Text>
        <Text style={styles.welcomeBody}>
          Stay connected with fellow graduates, offer student mentorships, participate in annual reunions, and support university initiatives.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎓 Alumni Network Directory</Text>
        <Text style={styles.cardDescription}>
          Search and connect with former classmates across graduation years and industry sectors.
        </Text>
        <TouchableOpacity style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>Browse Directory</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🤝 Mentorship Program</Text>
        <Text style={styles.cardDescription}>
          Volunteer to mentor current undergraduate students in career advice, internships, and research projects.
        </Text>
        <TouchableOpacity style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>Join Mentorship Network</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎉 Reunion & Networking Events</Text>
        <Text style={styles.cardDescription}>
          Check schedules for upcoming alumni meetups, global chapters, and annual homecoming dinners.
        </Text>
        <TouchableOpacity style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>View Alumni Calendar</Text>
        </TouchableOpacity>
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
  welcomeBanner: {
    backgroundColor: '#312e81',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeBody: {
    fontSize: 14,
    color: '#c7d2fe',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 14,
    lineHeight: 20,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#4338ca',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: '#4338ca',
    fontWeight: '600',
    fontSize: 14,
  },
});
