import { Redirect } from "expo-router";
import { useUser } from "../UserContext";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { session, loading } = useUser();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#005A9C" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href="/(tabs)" />;
}
