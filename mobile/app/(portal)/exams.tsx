import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Alert, RefreshControl, Text, TextInput, View } from "react-native";
import { portalApi } from "@/api/services";
import { getApiMessage } from "@/api/client";
import { Card, EmptyState, ErrorState, LoadingBlock, PrimaryButton, Screen, SectionTitle } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme";

export default function ExamsScreen() {
  const user = useAuthStore((state) => state.user);
  const selectedChildId = useAuthStore((state) => state.selectedChildId);
  const [marksObtained, setMarksObtained] = useState("75");

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", user?.role, "exams"],
    queryFn: () => portalApi.getDashboard(user!.role),
    enabled: !!user
  });

  const studentId =
    user?.role === "STUDENT"
      ? user.linkedStudentId ?? null
      : user?.role === "PARENT"
        ? selectedChildId ?? dashboardQuery.data?.children?.[0]?.id ?? null
        : null;

  const resultsQuery = useQuery({
    queryKey: ["results", studentId],
    queryFn: () => portalApi.getStudentResults(studentId!),
    enabled: !!studentId
  });

  const reportCardsQuery = useQuery({
    queryKey: ["report-cards", studentId],
    queryFn: () => portalApi.getStudentReportCards(studentId!),
    enabled: !!studentId
  });

  const rosterQuery = useQuery({
    queryKey: ["teacher-exam-roster"],
    queryFn: async () => {
      const [students, enrollments] = await Promise.all([portalApi.getStudents(), portalApi.getEnrollments()]);
      return { students, enrollments };
    },
    enabled: user?.role === "TEACHER"
  });

  const bulkResultsMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => portalApi.bulkResults(payload),
    onSuccess: () => Alert.alert("Saved", "Exam marks entered successfully."),
    onError: (error) => Alert.alert("Validation failed", getApiMessage(error, "Unable to save exam marks."))
  });

  if (!user) {
    return null;
  }

  if (dashboardQuery.isLoading || resultsQuery.isLoading || reportCardsQuery.isLoading || rosterQuery.isLoading) {
    return <Screen title="Exams"><LoadingBlock /></Screen>;
  }

  if (dashboardQuery.isError || resultsQuery.isError || reportCardsQuery.isError || rosterQuery.isError || !dashboardQuery.data) {
    return <Screen title="Exams"><ErrorState title="Exam data unavailable" message="The backend did not return exam data successfully." onRetry={() => { void dashboardQuery.refetch(); void resultsQuery.refetch(); void reportCardsQuery.refetch(); void rosterQuery.refetch(); }} /></Screen>;
  }

  const results = resultsQuery.data ?? [];
  const reportCards = reportCardsQuery.data ?? [];
  const upcomingExams = Array.isArray(dashboardQuery.data.upcomingExams) ? dashboardQuery.data.upcomingExams : [];

  const teacherExamSubject = dashboardQuery.data.upcomingExams?.[0];
  const teacherStudents = useMemo(() => {
    if (user.role !== "TEACHER") {
      return [];
    }

    const classroomId = Number(teacherExamSubject?.classroom_id ?? teacherExamSubject?.classroomId ?? 0);
    if (!classroomId) {
      return [];
    }

    const activeIds = new Set(
      (rosterQuery.data?.enrollments ?? [])
        .filter((item) => Number(item.classroom_id ?? item.classroomId) === classroomId)
        .map((item) => Number(item.student_id ?? item.studentId))
    );

    return (rosterQuery.data?.students ?? []).filter((student) => activeIds.has(Number(student.id)));
  }, [rosterQuery.data?.enrollments, rosterQuery.data?.students, teacherExamSubject, user.role]);

  return (
    <Screen title="Exams" subtitle={user.role === "TEACHER" ? "Enter marks only for your assigned exam subjects." : "View your results and published report cards."} refreshControl={<RefreshControl refreshing={dashboardQuery.isRefetching || resultsQuery.isRefetching || reportCardsQuery.isRefetching} onRefresh={() => { void dashboardQuery.refetch(); void resultsQuery.refetch(); void reportCardsQuery.refetch(); }} />}>
      {user.role === "TEACHER" ? (
        <Card>
          <SectionTitle title="Result Entry" />
          <Text style={{ color: colors.muted }}>
            Exam Subject: {String(teacherExamSubject?.subject_name ?? "Not available")}
          </Text>
          <TextInput value={marksObtained} onChangeText={setMarksObtained} placeholder="Marks obtained" style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
          <PrimaryButton
            label={bulkResultsMutation.isPending ? "Saving..." : "Save Same Mark for Visible Roster"}
            onPress={() => {
              const examSubjectId = Number(teacherExamSubject?.exam_subject_id ?? teacherExamSubject?.id ?? 0);
              if (!examSubjectId || !teacherStudents.length) {
                Alert.alert("Missing exam subject", "No assigned exam subject or classroom roster was returned for result entry.");
                return;
              }

              bulkResultsMutation.mutate({
                examSubjectId,
                results: teacherStudents.slice(0, 10).map((student) => ({
                  studentId: Number(student.id),
                  marksObtained: Number(marksObtained)
                }))
              });
            }}
          />
        </Card>
      ) : null}

      <Card>
        <SectionTitle title="Recent Results" />
        {results.length ? results.map((item, index) => (
          <View key={String(item.id ?? index)} style={{ paddingVertical: 10 }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>{String(item.subject_name ?? item.exam_name ?? "Result")}</Text>
            <Text style={{ color: colors.muted }}>Marks: {String(item.marks_obtained ?? "-")} • Grade: {String(item.grade ?? "-")}</Text>
          </View>
        )) : <EmptyState title="No results yet" message="No student results were returned yet." />}
      </Card>

      <Card>
        <SectionTitle title="Published Report Cards" />
        {reportCards.length ? reportCards.map((item, index) => (
          <View key={String(item.id ?? index)} style={{ paddingVertical: 10 }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>Report Card #{String(item.id)}</Text>
            <Text style={{ color: colors.muted }}>Average: {String(item.average_percentage ?? "-")} • Grade: {String(item.overall_grade ?? "-")}</Text>
          </View>
        )) : <EmptyState title="No report cards yet" message="No published report cards were returned yet." />}
      </Card>

      <Card>
        <SectionTitle title="Scheduled Exams" />
        {upcomingExams.length ? upcomingExams.map((item, index) => (
          <Text key={String(item.id ?? index)} style={{ color: colors.text, lineHeight: 22 }}>
            {String(item.name ?? item.subject_name ?? "Exam")}
          </Text>
        )) : <Text style={{ color: colors.muted }}>No scheduled exams returned.</Text>}
      </Card>
    </Screen>
  );
}
