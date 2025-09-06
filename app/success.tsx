import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authService } from '../lib/authService';

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome, {userEmail}</Text>
          <Text style={styles.locationText}>📍 Your Current Location</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleSignOut}>
          <Text style={styles.menuButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Map or Location Info */}
      {location ? (
        <View style={styles.mapContainer}>
          {/* Debug Info */}
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              📍 Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.debugText}>
              🗺️ Map Status: Hidden | Platform: {Platform.OS}
            </Text>
          </View>
          
          {/* MapView hidden - showing location info only */}
          {false && MapView && Platform.OS !== 'web' ? (
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={location}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsBuildings={true}
              showsTraffic={true}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Your Location"
                description="You are here"
                pinColor="#3b82f6"
              />
            </MapView>
          ) : (
            // Location info without map
            <View style={styles.webMapFallback}>
              <Text style={styles.mapTitle}>� Your Location</Text>
              <View style={styles.coordinatesCard}>
                <Text style={styles.coordinatesTitle}>Current Coordinates:</Text>
                <Text style={styles.coordinates}>
                  Latitude: {location.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordinates}>
                  Longitude: {location.longitude.toFixed(6)}
                </Text>
              </View>
              <TouchableOpacity style={styles.openMapButton} onPress={openMapInBrowser}>
                <Text style={styles.openMapButtonText}>🌍 Open in Google Maps</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noLocationContainer}>
          <Text style={styles.noLocationText}>📍 Waiting for location...</Text>
          <Text style={styles.debugText}>Permission: {locationPermission ? 'Granted' : 'Not granted'}</Text>
          <Text style={styles.debugText}>Loading: {loading ? 'Yes' : 'No'}</Text>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshLocation}>
          <Text style={styles.refreshButtonText}>🔄 Refresh Location</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => {
            console.log('🧪 Manual test - Current states:');
            console.log('- Permission:', locationPermission);
            console.log('- Location:', location);
            console.log('- Loading:', loading);
            Alert.alert('Debug Info', `Permission: ${locationPermission}\nLocation: ${location ? 'Set' : 'Not set'}\nLoading: ${loading}`);
          }}
        >
          <Text style={styles.testButtonText}>🧪 Debug</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.adminButton} 
          onPress={() => router.navigate('/admin-users' as any)}
        >
          <Text style={styles.adminButtonText}>👥 Admin Panel</Text>
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
    padding: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  menuButtonText: {
    fontSize: 20,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 32,
  },
  coordinatesCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 32,
    width: '100%',
    alignItems: 'center',
  },
  coordinatesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  coordinates: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
  },
  openMapButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  openMapButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomControls: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  refreshButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  adminButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminButtonText: {
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
  debugInfo: {
    backgroundColor: '#ffffff',
    padding: 12,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
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
});
