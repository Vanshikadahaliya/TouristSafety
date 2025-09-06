import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Note: This requires admin privileges or RLS policies to be configured
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        Alert.alert('Error', 'Unable to fetch users. Admin access required.');
        console.error('Error fetching users:', error);
      } else {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Unable to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <Text style={styles.email}>{item.email || 'No email'}</Text>
      <Text style={styles.detail}>Registered: {formatDate(item.created_at)}</Text>
      <Text style={styles.detail}>Last Login: {formatDate(item.last_sign_in_at)}</Text>
      <Text style={styles.detail}>
        Email Confirmed: {item.email_confirmed_at ? 'Yes' : 'No'}
      </Text>
      <Text style={styles.userId}>ID: {item.id}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Registered Users ({users.length})</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchUsers}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {users.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No users registered yet</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
    marginTop: 8,
  },
});
