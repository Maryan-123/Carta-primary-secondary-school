import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { colors } from "@/theme";
import { useAuthStore } from "@/store/auth-store";
import { getRoleTabs, isMobileSupportedRole } from "@/utils/access";

const screenMeta: Record<string, { title: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  dashboard: { title: "Dashboard", icon: "dashboard" },
  attendance: { title: "Attendance", icon: "fact-check" },
  timetable: { title: "Schedule", icon: "calendar-today" },
  assignments: { title: "Assignments", icon: "assignment" },
  exams: { title: "Exams", icon: "analytics" },
  finance: { title: "Finance", icon: "account-balance-wallet" },
  updates: { title: "Updates", icon: "campaign" },
  profile: { title: "Profile", icon: "person" }
};

export default function PortalLayout() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isMobileSupportedRole(user.role)) {
    return <Redirect href="/unsupported" />;
  }

  const allowedTabs = getRoleTabs(user.role);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.surface,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 76,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: colors.surface,
          borderTopColor: colors.border
        },
        tabBarItemStyle: {
          borderRadius: 18,
          marginHorizontal: 4
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700"
        },
        tabBarActiveBackgroundColor: colors.primary
      }}
    >
      {allowedTabs.map((tab) => {
        const meta = screenMeta[tab];
        return (
          <Tabs.Screen
            key={tab}
            name={tab}
            options={{
              title: meta.title,
              tabBarIcon: ({ color, size }) => <MaterialIcons name={meta.icon} color={color} size={size} />
            }}
          />
        );
      })}
    </Tabs>
  );
}
