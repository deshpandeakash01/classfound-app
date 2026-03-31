import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // We hide the default ugly header because we built our own blue one!
        tabBarActiveTintColor: "#1E3A8A", // Your navy blue for the active tab
        tabBarInactiveTintColor: "#9CA3AF", // Grey for inactive tabs
        tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 5 },
      }}
    >
      {/* Tab 1: Connects to your index.tsx file */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Feather name="search" size={24} color={color} />
          ),
        }}
      />

      {/* Tab 2: Connects to a schedule.tsx file we are about to create */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: "My Schedule",
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
