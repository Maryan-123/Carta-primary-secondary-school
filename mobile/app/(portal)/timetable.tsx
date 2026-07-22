import { useQuery } from "@tanstack/react-query";
import { RefreshControl, Text, View } from "react-native";
import { portalApi } from "@/api/services";
import { Card, EmptyState, ErrorState, LoadingBlock, Screen, SectionTitle } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme";

export default function TimetableScreen() {
  const user = useAuthStore((state) => state.user);
  const query = useQuery({
    queryKey: ["dashboard", user?.role, "timetable"],
    queryFn: () => portalApi.getDashboard(user!.role),
    enabled: !!user
  });

  if (!user) {
    return null;
  }

  if (query.isLoading) {
    return <Screen title="Schedule"><LoadingBlock /></Screen>;
  }

  if (query.isError || !query.data) {
    return <Screen title="Schedule"><ErrorState title="Schedule unavailable" message="Could not load timetable data from the backend." onRetry={() => void query.refetch()} /></Screen>;
  }

  const items = Array.isArray(query.data.timetable) ? query.data.timetable : [];

  return (
    <Screen title="Schedule" subtitle={user.role === "TEACHER" ? "Your assigned teaching timetable." : "Your class timetable from the school server."} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}>
      <Card>
        <SectionTitle title="Timetable" />
        {items.length ? (
          items.map((item, index) => (
            <View key={String(item.id ?? index)} style={{ paddingVertical: 10, borderBottomWidth: index === items.length - 1 ? 0 : 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>{String(item.subject_name ?? item.period_name ?? "Class Period")}</Text>
              <Text style={{ color: colors.muted }}>
                Day {String(item.day_of_week ?? "-")} • {String(item.start_time ?? "-")} - {String(item.end_time ?? "-")}
              </Text>
              <Text style={{ color: colors.muted }}>{String(item.classroom_name ?? item.room_name ?? "")}</Text>
            </View>
          ))
        ) : (
          <EmptyState title="No timetable yet" message="No timetable records were returned for this account." />
        )}
      </Card>
    </Screen>
  );
}
