import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { isMobileSupportedRole } from "@/utils/access";

export default function IndexScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isMobileSupportedRole(user.role)) {
    return <Redirect href="/unsupported" />;
  }

  return <Redirect href="/(portal)/dashboard" />;
}
