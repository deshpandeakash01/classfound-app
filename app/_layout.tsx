import { Stack } from 'expo-router';
import { UserProvider } from '../UserContext';
export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* This tells the app to find the (tabs) folder and render its layout */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </UserProvider>
  );
}