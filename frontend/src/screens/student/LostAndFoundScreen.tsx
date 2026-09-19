import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseClient';
import { useAuthRBAC } from '../../contexts/AuthRBACContext';
import { FormInput, Button, Modal } from '../../components';

interface LostFoundItem {
  id: string;
  title: string;
  location: string;
  status: 'lost' | 'found' | 'claimed';
  description: string;
  createdAt?: any;
}

export const LostAndFoundScreen: React.FC = () => {
  const { user } = useAuthRBAC();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'lost_found'), orderBy('createdAt', 'desc'), limit(30));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<LostFoundItem, 'id'>),
      }));
      setItems(data);
    } catch (err) {
      console.error('Error fetching lost & found:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateReport = async () => {
    if (!title.trim() || !location.trim()) {
      Alert.alert('Error', 'Please provide title and location');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'lost_found'), {
        title,
        location,
        description,
        status: type,
        reporterUid: user?.uid || 'anonymous',
        createdAt: serverTimestamp(),
      });
      setModalVisible(false);
      setTitle('');
      setLocation('');
      setDescription('');
      fetchItems();
      Alert.alert('Report Created', 'Item report submitted successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Lost & Found</Text>
          <Text style={styles.subtext}>Report or search for lost campus belongings.</Text>
        </View>
        <TouchableOpacity style={styles.reportBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.reportBtnText}>+ Report Item</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 24 }} />
      ) : items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No items reported currently.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.tag,
                    item.status === 'lost' ? styles.tagLost : styles.tagFound,
                  ]}
                >
                  <Text style={styles.tagText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.cardLocation}>📍 Location: {item.location}</Text>
              {item.description ? <Text style={styles.cardDesc}>{item.description}</Text> : null}
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} title="Report Lost or Found Item" onClose={() => setModalVisible(false)}>
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'lost' && styles.typeBtnActive]}
            onPress={() => setType('lost')}
          >
            <Text style={[styles.typeBtnText, type === 'lost' && styles.typeBtnTextActive]}>I Lost Something</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'found' && styles.typeBtnActive]}
            onPress={() => setType('found')}
          >
            <Text style={[styles.typeBtnText, type === 'found' && styles.typeBtnTextActive]}>I Found Something</Text>
          </TouchableOpacity>
        </View>

        <FormInput label="Item Name / Title" placeholder="e.g. Blue Hydro Flask / Student ID" value={title} onChangeText={setTitle} />
        <FormInput label="Location" placeholder="e.g. Library 2nd Floor, Room 204" value={location} onChangeText={setLocation} />
        <FormInput label="Description / Identifying Marks" placeholder="Color, brand, stickers, etc." multiline numberOfLines={3} value={description} onChangeText={setDescription} />

        <Button title={submitting ? 'Submitting...' : 'Submit Report'} onPress={handleCreateReport} loading={submitting} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  reportBtn: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  reportBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
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
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardLocation: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#334155',
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagLost: {
    backgroundColor: '#fee2e2',
  },
  tagFound: {
    backgroundColor: '#dcfce7',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1f2937',
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  typeBtnTextActive: {
    color: '#ffffff',
  },
});
