import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EventsScreen } from './EventsScreen';
import { LostAndFoundScreen } from './LostAndFoundScreen';
import { FAQScreen } from './FAQScreen';

export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'lostfound' | 'faqs'>('events');

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lostfound' && styles.tabActive]}
          onPress={() => setActiveTab('lostfound')}
        >
          <Text style={[styles.tabText, activeTab === 'lostfound' && styles.tabTextActive]}>Lost & Found</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faqs' && styles.tabActive]}
          onPress={() => setActiveTab('faqs')}
        >
          <Text style={[styles.tabText, activeTab === 'faqs' && styles.tabTextActive]}>FAQs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'events' && <EventsScreen />}
        {activeTab === 'lostfound' && <LostAndFoundScreen />}
        {activeTab === 'faqs' && <FAQScreen />}
      </View>
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
});
