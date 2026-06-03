import { Tabs } from "expo-router";
import {
  House,
  Search,
  User,
  ClipboardCheck,
  CalendarCheck,
} from "lucide-react-native";

import { useUser } from "../../UserContext";

export default function TabsLayout() {
  const { user } = useUser();

  const role = user?.role;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />

      {/* SEARCH */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />

      {/* APPROVALS */}
      <Tabs.Screen
        name="approvals"
        options={{
          title: "Approvals",

          href:
            role === "cr" || role === "faculty" || role === "admin"
              ? undefined
              : null,

          tabBarIcon: ({ color, size }) => (
            <ClipboardCheck color={color} size={size} />
          ),
        }}
      />

      {/* MY BOOKINGS */}
      <Tabs.Screen
        name="my-bookings"
        options={{
          title: "My Bookings",

          href: role === "faculty" || role === "admin" ? undefined : null,

          tabBarIcon: ({ color, size }) => (
            <CalendarCheck color={color} size={size} />
          ),
        }}
      />

      {/* BOOK - hidden */}
      <Tabs.Screen
        name="book"
        options={{
          href: null,
        }}
      />

      {/* SCHEDULE - removed */}
      <Tabs.Screen
        name="schedule"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
