import { useQuery } from "@tanstack/react-query";
import { RefreshControl, Text, View } from "react-native";
import { portalApi } from "@/api/services";
import { Card, EmptyState, ErrorState, LoadingBlock, Screen, SectionTitle, StatCard } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme";

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const selectedChildId = useAuthStore((state) => state.selectedChildId);
  const setSelectedChildId = useAuthStore((state) => state.setSelectedChildId);

  const query = useQuery({
    queryKey: ["dashboard", user?.role],
    queryFn: () => portalApi.getDashboard(user!.role),
    enabled: !!user
  });

  if (!user) {
    return null;
  }

  if (query.isLoading) {
    return (
      <Screen title="Dashboard" subtitle="Loading your live portal summary.">
        <LoadingBlock />
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen title="Dashboard" subtitle="The app could not load the real portal summary right now.">
        <ErrorState title="Dashboard unavailable" message="The school server is unavailable or returned an error." onRetry={() => void query.refetch()} />
      </Screen>
    );
  }

  const data = query.data;
  const currentChild = user.role === "PARENT"
    ? data.children?.find((child) => child.id === (selectedChildId ?? data.children?.[0]?.id)) ?? data.children?.[0]
    : null;

  if (user.role === "PARENT" && currentChild && !selectedChildId) {
    setSelectedChildId(currentChild.id);
  }

  return (
    <Screen
      title={
        user.role === "STUDENT"
          ? `Good day, ${user.firstName ?? user.username}`
          : user.role === "TEACHER"
            ? `Welcome, ${user.firstName ?? user.username}`
            : "Parent Dashboard"
      }
      subtitle={
        user.role === "STUDENT"
          ? "Your mobile dashboard shows only your class, attendance, assignments, results, fees, and library record."
          : user.role === "TEACHER"
            ? "This screen is limited to your assigned classes, timetable, attendance work, assignments, and exam activity."
            : "Switch between linked children and view their school updates from the real backend."
      }
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
    >
      {user.role === "STUDENT" ? (
        <>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard label="Attendance" value={`${Math.round(Number(data.attendancePercentage ?? 0))}%`} icon="check-circle" accent={colors.primaryDeep} />
            <StatCard label="Balance" value={String(data.feeBalance?.total_balance ?? 0)} icon="account-balance-wallet" accent={colors.secondary} />
          </View>
          <Card>
            <SectionTitle title="My Class" />
            <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>{String(data.currentClassroom?.classroom_name ?? "Not Assigned")}</Text>
            <Text style={{ color: colors.muted }}>Grade: {String(data.currentClassroom?.grade_level ?? "-")}</Text>
            <Text style={{ color: colors.muted }}>Academic Year: {String(data.currentClassroom?.academic_year ?? "-")}</Text>
            <Text style={{ color: colors.muted }}>Admission Number: {String(data.currentClassroom?.admission_number ?? user.username)}</Text>
          </Card>
          <Card>
            <SectionTitle title="Highlights" />
            <Text style={{ color: colors.text, fontWeight: "700" }}>Assignments: {Array.isArray(data.recentAssignments) ? data.recentAssignments.length : 0}</Text>
            <Text style={{ color: colors.text, fontWeight: "700" }}>Results: {Array.isArray(data.recentResults) ? data.recentResults.length : 0}</Text>
            <Text style={{ color: colors.text, fontWeight: "700" }}>Report Cards: {Array.isArray(data.reportCards) ? data.reportCards.length : 0}</Text>
          </Card>
        </>
      ) : null}

      {user.role === "TEACHER" ? (
        <>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard label="Classes" value={String(data.assignedClasses?.length ?? 0)} icon="groups" />
            <StatCard label="Subjects" value={String(data.assignedSubjects?.length ?? 0)} icon="menu-book" accent={colors.secondary} />
          </View>
          <Card>
            <SectionTitle title="Assigned Classes" />
            {Array.isArray(data.assignedClasses) && data.assignedClasses.length ? (
              data.assignedClasses.map((item, index) => (
                <Text key={String(item.id ?? index)} style={{ color: colors.text, fontWeight: "700" }}>
                  {String(item.classroom_name ?? `Class ${index + 1}`)}
                </Text>
              ))
            ) : (
              <EmptyState title="No assigned classes" message="No classroom assignments were returned by the backend for this teacher." />
            )}
          </Card>
          <Card>
            <SectionTitle title="Today at a glance" />
            <Text style={{ color: colors.text }}>Timetable slots: {Array.isArray(data.timetable) ? data.timetable.length : 0}</Text>
            <Text style={{ color: colors.text }}>Upcoming exams: {Array.isArray(data.upcomingExams) ? data.upcomingExams.length : 0}</Text>
            <Text style={{ color: colors.text }}>Ungraded submissions: {Array.isArray(data.submissions) ? data.submissions.length : 0}</Text>
          </Card>
        </>
      ) : null}

      {user.role === "PARENT" ? (
        <>
          {Array.isArray(data.children) && data.children.length ? (
            <Card>
              <SectionTitle title="Linked Children" />
              <View style={{ gap: 8 }}>
                {data.children.map((child) => (
                  <Text
                    key={String(child.id)}
                    onPress={() => setSelectedChildId(child.id)}
                    style={{
                      color: selectedChildId === child.id ? colors.primaryDeep : colors.text,
                      fontWeight: "800"
                    }}
                  >
                    {String(child.name ?? `Child ${child.id}`)}
                  </Text>
                ))}
              </View>
            </Card>
          ) : (
            <EmptyState title="No linked children" message="This parent account does not have linked children in the real database yet." />
          )}
          {currentChild ? (
            <Card>
              <SectionTitle title={String(currentChild.name ?? "Selected Child")} />
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>
                {String(currentChild.currentClassroom?.classroom_name ?? "Not Assigned")}
              </Text>
              <Text style={{ color: colors.muted }}>Attendance: {Math.round(Number(currentChild.attendancePercentage ?? 0))}%</Text>
              <Text style={{ color: colors.muted }}>Fee Balance: {String(currentChild.feeBalance?.total_balance ?? 0)}</Text>
              <Text style={{ color: colors.muted }}>Library Loans: {Array.isArray(currentChild.libraryLoans) ? currentChild.libraryLoans.length : 0}</Text>
            </Card>
          ) : null}
        </>
      ) : null}

      <Card>
        <SectionTitle title="Announcements" />
        {Array.isArray(data.announcements) && data.announcements.length ? (
          data.announcements.slice(0, 4).map((item, index) => (
            <Text key={String(item.id ?? index)} style={{ color: colors.text, lineHeight: 20 }}>
              {String(item.title ?? "Notice")}
            </Text>
          ))
        ) : (
          <Text style={{ color: colors.muted }}>No announcements available right now.</Text>
        )}
      </Card>
    </Screen>
  );
}
