import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshControl, Text, View } from "react-native";
import { portalApi } from "@/api/services";
import { Card, EmptyState, ErrorState, LoadingBlock, PrimaryButton, Screen, SectionTitle } from "@/components/ui";

export default function UpdatesScreen() {
  const queryClient = useQueryClient();

  const announcementsQuery = useQuery({
    queryKey: ["announcements"],
    queryFn: () => portalApi.getAnnouncements()
  });
  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: () => portalApi.getEvents()
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => portalApi.getNotifications()
  });

  const markAllMutation = useMutation({
    mutationFn: () => portalApi.markAllNotificationsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  if (announcementsQuery.isLoading || eventsQuery.isLoading || notificationsQuery.isLoading) {
    return <Screen title="Updates"><LoadingBlock /></Screen>;
  }

  if (announcementsQuery.isError || eventsQuery.isError || notificationsQuery.isError) {
    return <Screen title="Updates"><ErrorState title="Updates unavailable" message="Could not load announcements, events, or notifications." onRetry={() => { void announcementsQuery.refetch(); void eventsQuery.refetch(); void notificationsQuery.refetch(); }} /></Screen>;
  }

  const announcements = announcementsQuery.data ?? [];
  const events = eventsQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];

  return (
    <Screen title="Updates" subtitle="School announcements, internal notifications, and events from the real backend." refreshControl={<RefreshControl refreshing={announcementsQuery.isRefetching || eventsQuery.isRefetching || notificationsQuery.isRefetching} onRefresh={() => { void announcementsQuery.refetch(); void eventsQuery.refetch(); void notificationsQuery.refetch(); }} />}>
      <Card>
        <SectionTitle title="Notifications" actionText="Mark All Read" onPress={() => void markAllMutation.mutate()} />
        {notifications.length ? notifications.map((item, index) => (
          <View key={String(item.id ?? index)} style={{ paddingVertical: 10 }}>
            <Text style={{ fontWeight: "800", color: "#1A1B25" }}>{String(item.title ?? "Notification")}</Text>
            <Text style={{ color: "#444657" }}>{String(item.message ?? "")}</Text>
          </View>
        )) : <EmptyState title="No notifications" message="You do not have notifications right now." />}
      </Card>

      <Card>
        <SectionTitle title="Announcements" />
        {announcements.length ? announcements.map((item, index) => (
          <View key={String(item.id ?? index)} style={{ paddingVertical: 10 }}>
            <Text style={{ fontWeight: "800", color: "#1A1B25" }}>{String(item.title ?? "Announcement")}</Text>
            <Text style={{ color: "#444657" }}>{String(item.message ?? "")}</Text>
          </View>
        )) : <EmptyState title="No announcements" message="No school announcements are active." />}
      </Card>

      <Card>
        <SectionTitle title="Events" />
        {events.length ? events.map((item, index) => (
          <View key={String(item.id ?? index)} style={{ paddingVertical: 10 }}>
            <Text style={{ fontWeight: "800", color: "#1A1B25" }}>{String(item.title ?? "Event")}</Text>
            <Text style={{ color: "#444657" }}>{String(item.start_date ?? item.startDate ?? "").slice(0, 10)} • {String(item.location ?? "")}</Text>
          </View>
        )) : <EmptyState title="No events" message="No upcoming school events were returned." />}
      </Card>
    </Screen>
  );
}
