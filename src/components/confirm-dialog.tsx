import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { radii, shadows, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { AppText } from "./app-text";
import { Button } from "./button";

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = "Keep data",
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close confirmation"
          onPress={onCancel}
          style={styles.dismissArea}
        />
        <View
          style={[styles.dialog, { backgroundColor: theme.surface }, shadows]}
        >
          <View style={[styles.icon, { backgroundColor: theme.surfaceMuted }]}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={27}
              color={theme.danger}
            />
          </View>
          <AppText variant="heading">{title}</AppText>
          <AppText color={theme.muted}>{description}</AppText>
          <View style={styles.actions}>
            <Button
              label={cancelLabel}
              variant="secondary"
              onPress={onCancel}
              style={styles.action}
            />
            <Button
              label={confirmLabel}
              variant="danger"
              onPress={onConfirm}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissArea: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  dialog: {
    width: "100%",
    maxWidth: 480,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  action: { flexGrow: 1 },
});
