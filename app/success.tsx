import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { authService } from '../lib/authService';
import { locationSharingService, SharedLocation } from '../lib/locationSharingService';

// Conditional import for React Native Maps (not available on web)
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (error) {
    console.log('Maps not available on this platform');
  }
}

interface LocationCoords {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function MapScreen() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [locationPermission, setLocationPermission] = useState(false);
  const [sharedLocations, setSharedLocations] = useState<SharedLocation[]>([]);
  const [sharingLocation, setSharingLocation] = useState(false);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    // Get user info
    const { user } = await authService.getCurrentUser();
    if (user?.email) {
      setUserEmail(user.email);
    }

    // Request location permission
    await requestLocationPermission();
    
    // Load shared locations
    await loadSharedLocations();
  };

  const requestLocationPermission = async () => {
    try {
      console.log('🔐 Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('🔐 Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Tourist Safety needs location access to show your position and provide safety information.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: requestLocationPermission }
          ]
        );
        setLoading(false);
        return;
      }

      console.log('✅ Permission granted, setting state and getting location');
      setLocationPermission(true);
      await getCurrentLocation();
    } catch (error) {
      console.error('❌ Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      console.log('📍 Attempting to get location...');
      
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log('📍 Location received:', currentLocation);

      const coords: LocationCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      console.log('📍 Setting location state:', coords);
      setLocation(coords);
    } catch (error) {
      console.error('❌ Error getting current location:', error);
      Alert.alert('Error', `Failed to get your current location: ${error}`);
      
      // Fallback to a default location (e.g., New York)
      console.log('📍 Using fallback location');
      const fallbackLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
      setLocation(fallbackLocation);
    } finally {
      setLoading(false);
    }
  };

  const loadSharedLocations = async () => {
    try {
      const result = await locationSharingService.getSharedLocations();
      if (result.success && result.data) {
        setSharedLocations(result.data);
      } else {
        console.error('Failed to load shared locations:', result.error);
      }
    } catch (error) {
      console.error('Error loading shared locations:', error);
    }
  };

  const shareCurrentLocation = async () => {
    if (!location || !userEmail) {
      Alert.alert('Error', 'Location or user information not available');
      return;
    }

    Alert.alert(
      'Share Location',
      'Do you want to share your current location with all users?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: async () => {
            setSharingLocation(true);
            try {
              const result = await locationSharingService.shareLocation(
                userEmail,
                location.latitude,
                location.longitude,
                'Current location shared'
              );

              if (result.success) {
                Alert.alert('Success', 'Your location has been shared with all users!');
                await loadSharedLocations(); // Refresh the shared locations
              } else {
                Alert.alert('Error', result.error || 'Failed to share location');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to share location');
            } finally {
              setSharingLocation(false);
            }
          }
        }
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authService.signOut();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleRefreshLocation = () => {
    console.log('🔄 Refresh location clicked');
    console.log('📍 Current permission state:', locationPermission);
    console.log('📍 Current location state:', location);
    
    if (locationPermission) {
      getCurrentLocation();
    } else {
      requestLocationPermission();
    }
  };

  const openMapInBrowser = () => {
    if (location) {
      const url = `https://www.google.com/maps/@${location.latitude},${location.longitude},15z`;
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        Alert.alert('Map', `Your location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>
            {locationPermission ? 'Getting your location...' : 'Requesting location permission...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!locationPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Location Access Required</Text>
          <Text style={styles.permissionText}>
            Tourist Safety needs your location to provide safety information and show your position on the map.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestLocationPermission}>
            <Text style={styles.permissionButtonText}>Grant Location Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome, {userEmail}</Text>
          <Text style={styles.locationText}>📍 Tourist Safety Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleSignOut}>
          <Text style={styles.menuButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content with ScrollView for better full-screen experience */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {location ? (
          <View style={styles.mainContent}>
            {/* Location Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>📍 Current Location</Text>
                <View style={styles.statusIndicator}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
              
              <View style={styles.coordinatesContainer}>
                <View style={styles.coordinateRow}>
                  <Text style={styles.coordinateLabel}>Latitude</Text>
                  <Text style={styles.coordinateValue}>{location.latitude.toFixed(6)}</Text>
                </View>
                <View style={styles.coordinateRow}>
                  <Text style={styles.coordinateLabel}>Longitude</Text>
                  <Text style={styles.coordinateValue}>{location.longitude.toFixed(6)}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={openMapInBrowser}>
                <Text style={styles.primaryButtonText}>🌍 Open in Google Maps</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.secondaryButton, sharingLocation && styles.disabledButton]} 
                onPress={shareCurrentLocation}
                disabled={sharingLocation}
              >
                <Text style={styles.secondaryButtonText}>
                  {sharingLocation ? '📤 Sharing...' : '📤 Share Location'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Shared Locations Section */}
            {sharedLocations.length > 0 && (
              <View style={styles.sharedLocationsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🌍 Shared Locations</Text>
                  <Text style={styles.sectionSubtitle}>{sharedLocations.length} locations shared</Text>
                </View>
                
                <View style={styles.sharedLocationsList}>
                  {sharedLocations.slice(0, 10).map((sharedLoc, index) => (
                    <View key={index} style={styles.sharedLocationCard}>
                      <View style={styles.sharedLocationHeader}>
                        <Text style={styles.sharedLocationUser}>👤 {sharedLoc.user_email}</Text>
                        <Text style={styles.sharedLocationTime}>
                          {new Date(sharedLoc.shared_at || '').toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.sharedLocationCoords}>
                        📍 {sharedLoc.latitude.toFixed(6)}, {sharedLoc.longitude.toFixed(6)}
                      </Text>
                      {sharedLoc.message && (
                        <Text style={styles.sharedLocationMessage}>💬 {sharedLoc.message}</Text>
                      )}
                    </View>
                  ))}
                  {sharedLocations.length > 10 && (
                    <View style={styles.moreLocationsCard}>
                      <Text style={styles.moreLocationsText}>
                        +{sharedLocations.length - 10} more shared locations
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Debug Info (collapsible) */}
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>🔧 Debug Information</Text>
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>
                  Platform: {Platform.OS} | Screen: {screenWidth}x{screenHeight}
                </Text>
                <Text style={styles.debugText}>
                  Permission: {locationPermission ? 'Granted' : 'Not granted'}
                </Text>
                <Text style={styles.debugText}>
                  Shared Locations: {sharedLocations.length}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noLocationContainer}>
            <Text style={styles.noLocationText}>📍 Waiting for location...</Text>
            <Text style={styles.debugText}>Permission: {locationPermission ? 'Granted' : 'Not granted'}</Text>
            <Text style={styles.debugText}>Loading: {loading ? 'Yes' : 'No'}</Text>
          </View>
        )}
      </ScrollView>

      {/* Enhanced Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleRefreshLocation}>
          <Text style={styles.controlButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={loadSharedLocations}
        >
          <Text style={styles.controlButtonText}>🌍 Shared</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => {
            console.log('🧪 Manual test - Current states:');
            console.log('- Permission:', locationPermission);
            console.log('- Location:', location);
            console.log('- Loading:', loading);
            console.log('- Shared locations:', sharedLocations.length);
            Alert.alert('Debug Info', `Permission: ${locationPermission}\nLocation: ${location ? 'Set' : 'Not set'}\nLoading: ${loading}\nShared: ${sharedLocations.length}`);
          }}
        >
          <Text style={styles.controlButtonText}>🧪 Debug</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => router.navigate('/admin-users' as any)}
        >
          <Text style={styles.controlButtonText}>👥 Admin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  menuButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  menuButtonText: {
    fontSize: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  mainContent: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  coordinatesContainer: {
    gap: 16,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  coordinateLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  coordinateValue: {
    fontSize: 16,
    color: '#1f2937',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
    fontWeight: '600',
  },
  actionButtonsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  sharedLocationsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  sharedLocationsList: {
    gap: 12,
  },
  sharedLocationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sharedLocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sharedLocationUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sharedLocationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sharedLocationCoords: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
    marginBottom: 4,
  },
  sharedLocationMessage: {
    fontSize: 13,
    color: '#4b5563',
    fontStyle: 'italic',
  },
  moreLocationsCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  moreLocationsText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  debugSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  debugInfo: {
    gap: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noLocationText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
