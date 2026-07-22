import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Alert, RefreshControl, Text, TextInput, View } from "react-native";
import { portalApi } from "@/api/services";
import { getApiMessage } from "@/api/client";
import { Card, EmptyState, ErrorState, LoadingBlock, PrimaryButton, Screen, SectionTitle } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme";

export default function AttendanceScreen() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", user?.role, "attendance"],
    queryFn: () => portalApi.getDashboard(user!.role),
    enabled: !!user
  });

  const currentClassroomId = useMemo(() => {
    if (selectedClassroomId) {
      return selectedClassroomId;
    }

    const firstClass = dashboardQuery.data?.assignedClasses?.[0];
    return Number(firstClass?.id ?? 0) || null;
  }, [dashboardQuery.data?.assignedClasses, selectedClassroomId]);

  const studentAttendanceQuery = useQuery({
    queryKey: ["student-attendance", user?.linkedStudentId],
    queryFn: () => portalApi.getStudentAttendance(user!.linkedStudentId!),
    enabled: user?.role === "STUDENT" && !!user.linkedStudentId
  });

  const teacherAttendanceQuery = useQuery({
    queryKey: ["teacher-class-attendance", currentClassroomId],
    queryFn: () => portalApi.getTeacherClassAttendance(currentClassroomId!),
    enabled: user?.role === "TEACHER" && !!currentClassroomId
  });

  const rosterQuery = useQuery({
    queryKey: ["teacher-roster"],
    queryFn: async () => {
      const [students, enrollments] = await Promise.all([portalApi.getStudents(), portalApi.getEnrollments()]);
      return { students, enrollments };
    },
    enabled: user?.role === "TEACHER"
  });

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => portalApi.createAttendanceSession(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["teacher-class-attendance"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", user?.role] })
      ]);
      Alert.alert("Success", "Attendance was saved successfully.");
    },
    onError: (error) => {
      Alert.alert("Validation failed", getApiMessage(error, "Unable to save attendance."));
    }
  });

  if (!user) {
    return null;
  }

  if (user.role === "STUDENT") {
    if (studentAttendanceQuery.isLoading) {
      return <Screen title="Attendance"><LoadingBlock /></Screen>;
    }

    if (studentAttendanceQuery.isError) {
      return <Screen title="Attendance"><ErrorState title="Attendance unavailable" message="Could not load your attendance from the server." onRetry={() => void studentAttendanceQuery.refetch()} /></Screen>;
    }

    const items = studentAttendanceQuery.data ?? [];

    return (
      <Screen title="Attendance" subtitle="Only your own attendance records are shown here." refreshControl={<RefreshControl refreshing={studentAttendanceQuery.isRefetching} onRefresh={() => void studentAttendanceQuery.refetch()} />}>
        <Card>
          <SectionTitle title="My Attendance Records" />
          {items.length ? items.map((item, index) => (
            <View key={String(item.id ?? index)} style={{ paddingVertical: 10 }}>
              <Text style={{ color: colors.text, fontWeight: "800" }}>{String(item.attendance_date ?? item.date ?? "-")}</Text>
              <Text style={{ color: colors.muted }}>Status: {String(item.status ?? "-")}</Text>
            </View>
          )) : <EmptyState title="No attendance yet" message="No attendance rows were returned for your student record." />}
        </Card>
      </Screen>
    );
  }

  if (dashboardQuery.isLoading || rosterQuery.isLoading) {
    return <Screen title="Attendance"><LoadingBlock /></Screen>;
  }

  if (dashboardQuery.isError || rosterQuery.isError || !dashboardQuery.data) {
    return <Screen title="Attendance"><ErrorState title="Attendance unavailable" message="Could not load teacher attendance tools from the backend." onRetry={() => { void dashboardQuery.refetch(); void rosterQuery.refetch(); }} /></Screen>;
  }

  const assignedClasses = (Array.isArray(dashboardQuery.data.assignedClasses) ? dashboardQuery.data.assignedClasses : []) as Array<Record<string, unknown>>;
  const roster = (() => {
    const classroomId = currentClassroomId;
    if (!classroomId) {
      return [];
    }

    const enrollments = (rosterQuery.data?.enrollments ?? []) as Array<Record<string, unknown>>;
    const students = (rosterQuery.data?.students ?? []) as Array<Record<string, unknown>>;
    const activeIds = new Set(
      enrollments
        .filter((item) => Number(item.classroom_id ?? item.classroomId) === classroomId)
        .map((item) => Number(item.student_id ?? item.studentId))
    );

    return students.filter((student) => activeIds.has(Number(student.id)));
  })();

  const currentAcademicYear = (dashboardQuery.data.currentAcademicYear ?? null) as Record<string, unknown> | null;
  const currentTerm = (dashboardQuery.data.currentTerm ?? null) as Record<string, unknown> | null;
  const assignmentLinks = (dashboardQuery.data.assignmentLinks ?? []) as Array<Record<string, unknown>>;
  const academicYearId = Number(currentAcademicYear?.id ?? assignmentLinks[0]?.academic_year_id ?? 0);
  const termId = Number(currentTerm?.id ?? assignmentLinks[0]?.term_id ?? 0);

  return (
    <Screen title="Attendance" subtitle="Record and review attendance only for your assigned classes." refreshControl={<RefreshControl refreshing={dashboardQuery.isRefetching || teacherAttendanceQuery.isRefetching} onRefresh={() => { void dashboardQuery.refetch(); void teacherAttendanceQuery.refetch(); void rosterQuery.refetch(); }} />}>
      <Card>
        <SectionTitle title="Assigned Classrooms" />
        {assignedClasses.length ? assignedClasses.map((item, index) => (
          <Text
            key={String(item.id ?? index)}
            onPress={() => setSelectedClassroomId(Number(item.id))}
            style={{ color: Number(item.id) === currentClassroomId ? colors.primaryDeep : colors.text, fontWeight: "800" }}
          >
            {String(item.classroom_name ?? `Class ${index + 1}`)}
          </Text>
        )) : <EmptyState title="No assigned classes" message="No assigned classroom was returned for this teacher." />}
      </Card>

      <Card>
        <SectionTitle title="Attendance Date" />
        <TextInput value={attendanceDate} onChangeText={setAttendanceDate} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
      </Card>

      <Card>
        <SectionTitle title="Class Roster" />
        {roster.length ? roster.map((student, index) => (
          <View key={String(student.id ?? index)} style={{ paddingVertical: 10 }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>{String(student.first_name ?? "")} {String(student.last_name ?? "")}</Text>
            <Text style={{ color: colors.muted }}>{String(student.admission_number ?? "")}</Text>
          </View>
        )) : <EmptyState title="No enrolled students" message="Select a valid assigned classroom with active enrolled students first." />}
        {roster.length && academicYearId && termId && currentClassroomId ? (
          <PrimaryButton
            label={mutation.isPending ? "Saving..." : "Save All as Present"}
            onPress={() => {
              const payload = {
                academicYearId,
                termId,
                classroomId: currentClassroomId,
                attendanceDate,
                records: roster.map((student) => ({
                  studentId: Number(student.id),
                  status: "PRESENT"
                }))
              };
              mutation.mutate(payload);
            }}
          />
        ) : null}
      </Card>
    </Screen>
  );
}
