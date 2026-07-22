import { apiClient } from "@/api/client";
import { ApiSuccess, AuthUser, DashboardPayload, LoginResponse, UserRole } from "@/types/api";

async function unwrap<T>(promise: Promise<{ data: ApiSuccess<T> }>) {
  const response = await promise;
  return response.data.data;
}

export const authApi = {
  login: (payload: { username: string; password: string }) =>
    unwrap<LoginResponse>(apiClient.post("/auth/login", payload)),
  logout: () => unwrap<Record<string, never>>(apiClient.post("/auth/logout")),
  getMe: () => unwrap<AuthUser>(apiClient.get("/auth/me")),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    unwrap<Record<string, never>>(apiClient.post("/auth/change-password", payload))
};

export const portalApi = {
  getDashboard: (role: UserRole) => {
    switch (role) {
      case "TEACHER":
        return unwrap<DashboardPayload>(apiClient.get("/dashboard/teacher"));
      case "PARENT":
        return unwrap<DashboardPayload>(apiClient.get("/dashboard/parent"));
      case "STUDENT":
      default:
        return unwrap<DashboardPayload>(apiClient.get("/dashboard/student"));
    }
  },
  getStudentAttendance: (studentId: number) =>
    unwrap<Array<Record<string, unknown>>>(apiClient.get(`/attendance/student/${studentId}`)),
  getTeacherClassAttendance: (classroomId: number) =>
    unwrap<Array<Record<string, unknown>>>(apiClient.get(`/attendance/classroom/${classroomId}`)),
  createAttendanceSession: (payload: Record<string, unknown>) =>
    unwrap<Record<string, unknown>>(apiClient.post("/attendance/sessions", payload)),
  updateAttendanceSession: (sessionId: number, payload: Record<string, unknown>) =>
    unwrap<Record<string, unknown>>(apiClient.put(`/attendance/sessions/${sessionId}/records`, payload)),
  listAssignments: () => unwrap<Array<Record<string, unknown>>>(apiClient.get("/assignments")),
  createAssignment: (payload: Record<string, unknown>) =>
    unwrap<Record<string, unknown>>(apiClient.post("/assignments", payload)),
  getAssignmentSubmissions: (assignmentId: number) =>
    unwrap<Array<Record<string, unknown>>>(apiClient.get(`/assignments/${assignmentId}/submissions`)),
  submitAssignment: (assignmentId: number, payload: Record<string, unknown>) =>
    unwrap<Record<string, unknown>>(apiClient.post(`/assignments/${assignmentId}/submissions`, payload)),
  gradeSubmission: (submissionId: number, payload: Record<string, unknown>) =>
    unwrap<Record<string, unknown>>(apiClient.patch(`/assignment-submissions/${submissionId}/grade`, payload)),
  getStudentResults: (studentId: number) =>
    unwrap<Array<Record<string, unknown>>>(apiClient.get(`/results/student/${studentId}`)),
  getStudentReportCards: (studentId: number) =>
    unwrap<Array<Record<string, unknown>>>(apiClient.get(`/report-cards/student/${studentId}`)),
  bulkResults: (payload: Record<string, unknown>) =>
    unwrap<Record<string, unknown>>(apiClient.post("/results/bulk", payload)),
  getInvoices: (studentId: number) =>
    unwrap<Array<Record<string, unknown>>>(apiClient.get(`/invoices/student/${studentId}`)),
  getPayments: (studentId: number) =>
    unwrap<Array<Record<string, unknown>>>(apiClient.get(`/payments/student/${studentId}`)),
  getAnnouncements: () =>
    unwrap<Array<Record<string, unknown>>>(apiClient.get("/announcements")),
  getNotifications: () =>
    unwrap<Array<Record<string, unknown>>>(apiClient.get("/notifications")),
  getUnreadNotificationCount: () =>
    unwrap<{ count?: number }>(apiClient.get("/notifications/unread-count")),
  markNotificationRead: (id: number) =>
    unwrap<Record<string, unknown>>(apiClient.patch(`/notifications/${id}/read`)),
  markAllNotificationsRead: () =>
    unwrap<Record<string, unknown>>(apiClient.patch("/notifications/read-all")),
  getEvents: () => unwrap<Array<Record<string, unknown>>>(apiClient.get("/events")),
  getStudents: () => unwrap<Array<Record<string, unknown>>>(apiClient.get("/students")),
  getEnrollments: () => unwrap<Array<Record<string, unknown>>>(apiClient.get("/enrollments")),
  uploadFile: async ({
    category,
    uri,
    name,
    mimeType
  }: {
    category: "students" | "staff" | "assignments" | "school" | "temporary";
    uri: string;
    name: string;
    mimeType?: string | null;
  }) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name,
      type: mimeType || "application/octet-stream"
    } as unknown as Blob);

    return unwrap<{
      filePath: string;
      fileName: string;
      originalName: string;
      mimeType: string;
      size: number;
      uploadUrl: string;
    }>(
      apiClient.post(`/uploads/${category}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
    );
  }
};
