import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    // The Stack acts like a deck of cards for your screens
    // headerShown: false removes the ugly default grey bars at the top
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. The Login Screen (Because it's named "index", it loads first!) */}
      <Stack.Screen name="index" />

      {/* 2. The Dashboard Tabs */}
      <Stack.Screen name="(tabs)" />

      {/* 3. The Search Results Screen */}
      <Stack.Screen name="results" />
    </Stack>
  );
}
