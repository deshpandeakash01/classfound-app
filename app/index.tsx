import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();

  // State to hold what the user types
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // In a real app, we would check a database here.
    // For our prototype, we just let them in!

    // We use "replace" instead of "push" so they can't hit the back arrow to return to the login screen
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* KeyboardAvoidingView pushes the screen up when the keyboard opens */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Feather name="book-open" size={40} color="#1E3A8A" />
            </View>
            <Text style={styles.logoText}>ClassFound</Text>
            <Text style={styles.subtitleText}>Faculty Portal</Text>
          </View>

          {/* Input Area */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>University Email</Text>
            <View style={styles.inputBox}>
              <Feather
                name="mail"
                size={20}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="teacher@university.edu"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputBox}>
              <Feather
                name="lock"
                size={20}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true} // Hides the password with dots
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Sign In</Text>
              <Feather name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- STYLING RULES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 30 },

  logoContainer: { alignItems: "center", marginBottom: 50 },
  iconCircle: {
    backgroundColor: "#E0E7FF",
    padding: 20,
    borderRadius: 50,
    marginBottom: 15,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E3A8A",
    letterSpacing: 0.5,
  },
  subtitleText: { fontSize: 16, color: "#6B7280", marginTop: 5 },

  formContainer: { width: "100%" },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#111827" },

  forgotPassword: { alignItems: "flex-end", marginBottom: 30 },
  forgotPasswordText: { color: "#1E3A8A", fontWeight: "600", fontSize: 14 },

  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E3A8A",
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
});
