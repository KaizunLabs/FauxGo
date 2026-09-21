import { PropsWithChildren, ReactNode } from "react";
import {
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { contentWidth, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};
export function Page({
  children,
  scroll = true,
  contentStyle,
  testID,
}: PropsWithChildren<Props>) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 800;
  const insets = {
    paddingTop: Platform.OS === "web" && wide ? 28 : spacing.lg,
    paddingBottom: wide ? spacing.huge : 100,
    paddingHorizontal: width < 520 ? spacing.lg : spacing.xl,
  };
  if (!scroll)
    return (
      <SafeAreaView
        testID={testID}
        style={[styles.safe, { backgroundColor: theme.canvas }]}
      >
        <View style={[styles.content, insets, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  return (
    <SafeAreaView
      testID={testID}
      style={[styles.safe, { backgroundColor: theme.canvas }]}
      edges={["left", "right"]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, insets]}
      >
        <View style={[styles.content, contentStyle]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { alignItems: "center", flexGrow: 1 },
  content: { width: "100%", maxWidth: contentWidth, alignSelf: "center" },
});
