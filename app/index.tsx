import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to register screen as the initial screen
  return <Redirect href="/register" />;
}