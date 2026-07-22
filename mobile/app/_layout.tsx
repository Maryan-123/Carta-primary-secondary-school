import { useEffect } from "react";
import { AppProviders, RootNavigator } from "@/providers/AppProviders";
import { useAuthStore } from "@/store/auth-store";

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
