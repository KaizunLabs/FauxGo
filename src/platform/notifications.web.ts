import { PlannedNotification } from "@/core/notification-plan";

export async function requestNotificationPermission() {
  return {
    granted: false,
    message:
      "Web notifications are not enabled. Progress remains available in Activity.",
  };
}
export async function syncNotifications(_plan: PlannedNotification[]) {
  /* Web keeps updates in Activity without requesting push access. */
}
