import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseClient';

interface EventItem {
  id: string;
  title: string;
  description: string;
  createdAt?: any;
}

export const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<EventItem, 'id'>),
        }));
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Campus Events</Text>
      <Text style={styles.subtext}>Explore upcoming university, academic, and club activities.</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 24 }} />
      ) : events.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No upcoming events scheduled right now.</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDesc}>{item.description}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  eventDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});
