import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import { PrimaryButton, Screen } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";

export default function UnsupportedRoleScreen() {
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <Screen
      title="Use the Web Portal"
      subtitle="This mobile app currently supports student, parent, and teacher accounts only. Other roles should continue in the main web portal."
    >
      <View style={{ alignItems: "center", gap: 16 }}>
        <Image source={require("../assets/carta-logo.jpeg")} style={{ width: 96, height: 96, borderRadius: 48 }} />
        <Text style={{ fontSize: 15, textAlign: "center", color: "#444657", lineHeight: 22 }}>
          Your account can still use the existing CARTA School web system on the local school network.
        </Text>
        <PrimaryButton
          label="Secure Logout"
          onPress={() => {
            void signOut();
            router.replace("/(auth)/login");
          }}
        />
      </View>
    </Screen>
  );
}
