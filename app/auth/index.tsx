import { useRouter } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AuthLandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>ClassFound</Text>
          <Text style={styles.subtitle}>BMSCE</Text>

          <Text style={styles.tagline}>Find free classrooms instantly.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/auth/signin")}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/auth/signup")}>
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  hero: {
    alignItems: "center",
    marginBottom: 60,
  },

  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#005A9C",
    letterSpacing: 0.5,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 22,
    color: "#777777",
    fontWeight: "500",
  },

  tagline: {
    marginTop: 18,
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },

  actions: {
    gap: 16,
  },

  primaryButton: {
    backgroundColor: "#005A9C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#005A9C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  secondaryButtonText: {
    color: "#005A9C",
    fontSize: 17,
    fontWeight: "600",
  },
});
