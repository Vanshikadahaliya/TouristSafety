import { Stack } from "expo-router";
import { useEffect } from "react";
import { config } from "../lib/config";

export default function RootLayout() {
  useEffect(() => {
    // Log configuration on app start (only in development)
    if (__DEV__) {
      console.log("🚀 Tourist Safety App Starting...");
      console.log('📧 Email auth configured with Supabase');
      
      // Validate configuration
      if (!config.supabase.url.includes('supabase.co')) {
        console.warn('⚠️ Supabase URL might not be configured correctly');
      }
      
      console.log("✅ Configuration validation complete");
    }
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="success" options={{ title: "Success" }} />
      <Stack.Screen name="admin-users" options={{ title: "Admin - Users" }} />
    </Stack>
  );
}
