import * as DocumentPicker from "expo-document-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, RefreshControl, Text, TextInput, View } from "react-native";
import { portalApi } from "@/api/services";
import { getApiMessage } from "@/api/client";
import { Card, EmptyState, ErrorState, LoadingBlock, PrimaryButton, Screen, SectionTitle } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme";

export default function AssignmentsScreen() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [submissionText, setSubmissionText] = useState("");
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", user?.role, "assignment-context"],
    queryFn: () => portalApi.getDashboard(user!.role),
    enabled: !!user
  });

  const assignmentsQuery = useQuery({
    queryKey: ["assignments", user?.role],
    queryFn: () => portalApi.listAssignments(),
    enabled: !!user
  });

  const createAssignment = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      let attachmentPath: string | undefined;
      if (attachment) {
        const uploaded = await portalApi.uploadFile({
          category: "assignments",
          uri: attachment.uri,
          name: attachment.name,
          mimeType: attachment.mimeType
        });
        attachmentPath = uploaded.filePath;
      }

      return portalApi.createAssignment({
        ...payload,
        attachmentPath
      });
    },
    onSuccess: async () => {
      setTitle("");
      setAttachment(null);
      await queryClient.invalidateQueries({ queryKey: ["assignments"] });
      Alert.alert("Created", "Assignment published successfully.");
    },
    onError: (error) => Alert.alert("Validation failed", getApiMessage(error, "Unable to create assignment."))
  });

  const submitAssignment = useMutation({
    mutationFn: async ({ assignmentId, payload }: { assignmentId: number; payload: Record<string, unknown> }) => {
      let attachmentPath: string | undefined;
      if (attachment) {
        const uploaded = await portalApi.uploadFile({
          category: "assignments",
          uri: attachment.uri,
          name: attachment.name,
          mimeType: attachment.mimeType
        });
        attachmentPath = uploaded.filePath;
      }

      return portalApi.submitAssignment(assignmentId, {
        ...payload,
        attachmentPath
      });
    },
    onSuccess: async () => {
      setSubmissionText("");
      setAttachment(null);
      await queryClient.invalidateQueries({ queryKey: ["assignments"] });
      Alert.alert("Submitted", "Assignment submission saved successfully.");
    },
    onError: (error) => Alert.alert("Validation failed", getApiMessage(error, "Unable to submit assignment."))
  });

  if (!user) {
    return null;
  }

  if (assignmentsQuery.isLoading || dashboardQuery.isLoading) {
    return <Screen title="Assignments"><LoadingBlock /></Screen>;
  }

  if (assignmentsQuery.isError || dashboardQuery.isError || !dashboardQuery.data) {
    return <Screen title="Assignments"><ErrorState title="Assignments unavailable" message="Could not load assignment data from the real backend." onRetry={() => { void assignmentsQuery.refetch(); void dashboardQuery.refetch(); }} /></Screen>;
  }

  const assignments = assignmentsQuery.data ?? [];
  const assignmentContext = dashboardQuery.data.assignmentLinks?.[0];

  return (
    <Screen title="Assignments" subtitle={user.role === "TEACHER" ? "Create work only for your assigned class and subject." : "View and submit your assigned work from the backend."} refreshControl={<RefreshControl refreshing={assignmentsQuery.isRefetching} onRefresh={() => void assignmentsQuery.refetch()} />}>
      {user.role === "TEACHER" ? (
        <Card>
          <SectionTitle title="Create Assignment" />
          <TextInput value={title} onChangeText={setTitle} placeholder="Assignment title" style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
          <TextInput value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
          <PrimaryButton
            label={attachment ? `Attachment: ${attachment.name}` : "Choose Attachment"}
            onPress={async () => {
              const result = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
              if (!result.canceled && result.assets[0]) {
                setAttachment(result.assets[0]);
              }
            }}
          />
          <PrimaryButton
            label={createAssignment.isPending ? "Publishing..." : "Publish Assignment"}
            onPress={() => {
              if (!assignmentContext) {
                Alert.alert("Missing assignment context", "No assigned subject/classroom was returned for this teacher.");
                return;
              }

              createAssignment.mutate({
                academicYearId: Number(assignmentContext.academic_year_id),
                termId: Number(assignmentContext.term_id),
                classroomId: Number(assignmentContext.classroom_id),
                subjectId: Number(assignmentContext.subject_id),
                teacherId: Number(assignmentContext.teacher_id),
                title,
                assignedDate: new Date().toISOString().slice(0, 10),
                dueDate,
                maximumMarks: 100,
                status: "PUBLISHED"
              });
            }}
          />
        </Card>
      ) : null}

      <Card>
        <SectionTitle title="Assignment List" />
        {assignments.length ? assignments.map((item, index) => (
          <View key={String(item.id ?? index)} style={{ paddingVertical: 10, borderBottomWidth: index === assignments.length - 1 ? 0 : 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>{String(item.title ?? "Assignment")}</Text>
            <Text style={{ color: colors.muted }}>Due: {String(item.due_date ?? item.dueDate ?? "-").slice(0, 10)}</Text>
            <Text style={{ color: colors.muted }}>Subject: {String(item.subject_name ?? item.subjectName ?? "-")}</Text>
            {user.role === "STUDENT" ? (
              <View style={{ marginTop: 10, gap: 10 }}>
                <TextInput
                  value={submissionText}
                  onChangeText={setSubmissionText}
                  placeholder="Submission text"
                  multiline
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, minHeight: 88 }}
                />
                <PrimaryButton
                  label={attachment ? `Attachment: ${attachment.name}` : "Choose Attachment"}
                  onPress={async () => {
                    const result = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
                    if (!result.canceled && result.assets[0]) {
                      setAttachment(result.assets[0]);
                    }
                  }}
                />
                <PrimaryButton
                  label={submitAssignment.isPending ? "Submitting..." : "Submit Assignment"}
                  onPress={() =>
                    submitAssignment.mutate({
                      assignmentId: Number(item.id),
                      payload: {
                        studentId: user.linkedStudentId,
                        submissionText
                      }
                    })
                  }
                />
              </View>
            ) : null}
          </View>
        )) : <EmptyState title="No assignments found" message="No assignment records were returned for this role yet." />}
      </Card>
    </Screen>
  );
}
