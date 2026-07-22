import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";
import { authApi } from "@/api/services";
import { getApiMessage } from "@/api/client";
import { Card, PrimaryButton, Screen, SectionTitle } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/[a-z]/, "At least one lowercase letter")
    .regex(/[0-9]/, "At least one number")
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { control, handleSubmit, formState: { errors }, reset } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: ""
    }
  });

  const changePassword = useMutation({
    mutationFn: (payload: PasswordForm) => authApi.changePassword(payload),
    onSuccess: () => {
      reset();
      Alert.alert("Updated", "Password changed successfully.");
    },
    onError: (error) => Alert.alert("Validation failed", getApiMessage(error, "Unable to change password."))
  });

  if (!user) {
    return null;
  }

  return (
    <Screen title="My Profile" subtitle="This screen shows only the logged-in user and secure account actions.">
      <Card style={{ alignItems: "center" }}>
        <Image source={require("../../assets/carta-logo.jpeg")} style={{ width: 82, height: 82, borderRadius: 41 }} />
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username}</Text>
        <Text style={{ color: colors.primaryDeep, fontWeight: "700" }}>{user.role}</Text>
        <Text style={{ color: colors.muted }}>{user.username}</Text>
        <Text style={{ color: colors.muted }}>{user.email ?? "No email recorded"}</Text>
        <Text style={{ color: colors.muted }}>{user.phone ?? "No phone recorded"}</Text>
      </Card>

      <Card>
        <SectionTitle title="Change Password" />
        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { value, onChange } }) => (
            <TextInput value={value} onChangeText={onChange} placeholder="Current password" secureTextEntry style={styles.input} />
          )}
        />
        {errors.currentPassword ? <Text style={styles.error}>{errors.currentPassword.message}</Text> : null}
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { value, onChange } }) => (
            <TextInput value={value} onChangeText={onChange} placeholder="New password" secureTextEntry style={styles.input} />
          )}
        />
        {errors.newPassword ? <Text style={styles.error}>{errors.newPassword.message}</Text> : null}
        <PrimaryButton label={changePassword.isPending ? "Updating..." : "Update Password"} onPress={handleSubmit((values) => changePassword.mutate(values))} />
      </Card>

      <PrimaryButton
        label="Secure Logout"
        danger
        onPress={() => {
          void signOut();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600"
  }
});
