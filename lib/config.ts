import Constants from 'expo-constants';

// Centralized configuration for environment variables
export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 
         Constants.expoConfig?.extra?.supabaseUrl || 
         'https://jqedshcbebcbyldefrab.supabase.co',
    
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
             Constants.expoConfig?.extra?.supabaseAnonKey || 
             'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZWRzaGNiZWJjYnlsZGVmcmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDE4MjUsImV4cCI6MjA3MjcxNzgyNX0.3j6lwK9NW_vAXSQ080Zd29gxxWAPyUC3I0W9enLnQ_4',
  },
  
  google: {
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 
              Constants.expoConfig?.extra?.googleClientId || 
              '109858282882-fc334ksr9d0uhn3stakqlrt9kdh2cptv.apps.googleusercontent.com',
    
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || 
                     Constants.expoConfig?.extra?.googleAndroidClientId || 
                     '109858282882-6igqmso2ms535ue5j0hhp53bvcvdbeaj.apps.googleusercontent.com',
  },
};

// Debug function to log configuration (remove in production)
export const logConfig = () => {
  console.log('🔧 App Configuration:');
  console.log('Supabase URL:', config.supabase.url);
  console.log('Supabase Key:', config.supabase.anonKey.substring(0, 20) + '...');
  console.log('Google Client ID:', config.google.clientId);
  console.log('Google Android Client ID:', config.google.androidClientId);
};
