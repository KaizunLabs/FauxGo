import { PropsWithChildren } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
} from "react-native";
import { fonts } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type Variant =
  "display" | "title" | "heading" | "body" | "bodyStrong" | "caption" | "label";
type Props = TextProps & {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function AppText({
  variant = "body",
  color,
  style,
  children,
  ...props
}: PropsWithChildren<Props>) {
  const theme = useAppTheme();
  return (
    <Text
      {...props}
      style={[
        styles.base,
        styles[variant],
        { color: color ?? theme.ink },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { fontFamily: fonts.regular },
  display: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "700",
    letterSpacing: -1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  heading: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  body: { fontSize: 16, lineHeight: 23 },
  bodyStrong: { fontSize: 16, lineHeight: 23, fontWeight: "700" },
  caption: { fontSize: 13, lineHeight: 18 },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
