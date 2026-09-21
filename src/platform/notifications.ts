import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  PlannedNotification,
  notificationSignature,
  reconcileNotifications,
} from "@/core/notification-plan";
Notifications.setNotificationHandler({
  handleNotification: async (notification) => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: notification.request.content.data?.sound === true,
    shouldSetBadge: false,
  }),
});
export async function syncNotifications(plan: PlannedNotification[]) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const changes = reconcileNotifications(
    plan,
    scheduled.map((item) => ({
      id: item.identifier,
      signature: item.content.data?.signature,
    })),
    Date.now(),
  );
  for (const id of changes.cancel)
    await Notifications.cancelScheduledNotificationAsync(id);
  if (changes.schedule.length) await prepareChannels();
  for (const item of changes.schedule)
    if (item.date > Date.now())
      await Notifications.scheduleNotificationAsync({
        identifier: item.id,
        content: {
          title: item.title,
          body: item.body,
          sound: item.sound ? "default" : false,
          data: {
            simulationId: item.simulationId,
            signature: notificationSignature(item),
            sound: item.sound,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(item.date),
          channelId:
            Platform.OS === "android"
              ? item.sound
                ? "journeys-sound"
                : "journeys-silent"
              : undefined,
        },
      });
}
async function prepareChannels() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("journeys-sound", {
    name: "Journey updates with sound",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
  });
  await Notifications.setNotificationChannelAsync("journeys-silent", {
    name: "Silent journey updates",
    importance: Notifications.AndroidImportance.LOW,
    sound: null,
    enableVibrate: false,
  });
}
export async function requestNotificationPermission() {
  try {
    await prepareChannels();
    const result = await Notifications.requestPermissionsAsync();
    return {
      granted: result.granted,
      message: result.granted
        ? "Local journey notifications enabled."
        : "Notifications are off. You can follow every update in Activity.",
    };
  } catch {
    return {
      granted: false,
      message:
        "Notifications are unavailable on this device. Use Activity for progress.",
    };
  }
}
