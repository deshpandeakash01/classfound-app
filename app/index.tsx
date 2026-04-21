import { Redirect } from 'expo-router';

export default function Index() {
  // Instantly pushes the user to your Home tab
  return <Redirect href="/(tabs)" />;
}