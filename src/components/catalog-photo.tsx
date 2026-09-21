import { Image } from "expo-image";
import { useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { photography } from "@/data/photography";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Icon } from "./icon";

export function CatalogPhoto({
  imageKey,
  size = "card",
  style,
  label,
}: {
  imageKey: string;
  size?: "thumb" | "card" | "hero";
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const photo = photography[imageKey];
  const theme = useAppTheme();
  const [failedKey, setFailedKey] = useState<string>();
  const failed = failedKey === imageKey;
  return (
    <View
      style={[
        {
          backgroundColor: theme.surfaceMuted,
          overflow: "hidden",
          aspectRatio: 1.5,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {photo && !failed ? (
        <Image
          source={photo[size]}
          accessibilityLabel={label ?? photo.description}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={imageKey}
          onError={() => setFailedKey(imageKey)}
        />
      ) : (
        <Icon name="image-outline" size={32} color={theme.muted} />
      )}
    </View>
  );
}
