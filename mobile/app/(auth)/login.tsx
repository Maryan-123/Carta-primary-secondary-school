import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";
import { getApiMessage } from "@/api/client";
import { PrimaryButton, Screen } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme";
import { isMobileSupportedRole } from "@/utils/access";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      const response = await signIn(values);
      if (!isMobileSupportedRole(response.user.role)) {
        router.replace("/unsupported");
        return;
      }
      router.replace("/(portal)/dashboard");
    } catch (error) {
      setError("root", {
        message: getApiMessage(error, "Unable to sign in to the school server.")
      });
    }
  };

  return (
    <Screen
      title="CARTA School"
      subtitle="Sign in with your real school portal account. The mobile app connects only to the existing backend on the local school network."
    >
      <View style={styles.logoWrap}>
        <Image source={require("../../assets/carta-logo.jpeg")} style={styles.logo} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <Controller
          control={control}
          name="username"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your username"
              autoCapitalize="none"
              style={styles.input}
            />
          )}
        />
        {errors.username ? <Text style={styles.error}>{errors.username.message}</Text> : null}

        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your password"
              secureTextEntry
              style={styles.input}
            />
          )}
        />
        {errors.password ? <Text style={styles.error}>{errors.password.message}</Text> : null}
        {errors.root ? <Text style={styles.error}>{errors.root.message}</Text> : null}

        <PrimaryButton label={isSubmitting ? "Signing In..." : "Login"} onPress={handleSubmit(onSubmit)} />
      </View>

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>Mobile access rules</Text>
        <Text style={styles.helpText}>Students only see their own records.</Text>
        <Text style={styles.helpText}>Parents only see linked children.</Text>
        <Text style={styles.helpText}>Teachers only see assigned classes and subjects.</Text>
      </View>

      <Pressable onPress={() => router.replace("/unsupported")}>
        <Text style={styles.portalLink}>Using another role? Open the web portal instead.</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    alignItems: "center"
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 46
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600"
  },
  helpCard: {
    backgroundColor: colors.softBlue,
    borderRadius: 18,
    padding: 16,
    gap: 4
  },
  helpTitle: {
    color: colors.primaryDeep,
    fontSize: 13,
    fontWeight: "800"
  },
  helpText: {
    color: colors.muted,
    fontSize: 12
  },
  portalLink: {
    color: colors.primaryDeep,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center"
  }
});
