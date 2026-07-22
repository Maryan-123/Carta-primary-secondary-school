import axios from "axios";

export function normalizeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "The school server is temporarily unavailable. Please verify your local network connection and try again.";
    }
    const data = error.response.data;
    if (data && typeof data === "object") {
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
      if ("error" in data && typeof data.error === "string") {
        return data.error;
      }
    }
    switch (error.response.status) {
      case 400:
        return "Invalid request. Please check the provided information and try again.";
      case 401:
        return "Unauthorized. Please log in to access this section.";
      case 403:
        return "Access denied. You do not have permission to view this resource.";
      case 404:
        return "Requested resource was not found on the school server.";
      case 500:
        return "A server-side error occurred. The school administration has been notified.";
      default:
        return `Server returned an error (status: ${error.response.status}).`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
