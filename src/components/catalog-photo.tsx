import { Image } from "expo-image";
import { useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { photography } from "@/data/photography";
import { useAppTheme } from "@/hooks/use-app-theme";
import { AppText } from "./app-text";
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

export function CatalogPlaceholder({
  title,
  category,
  style,
}: {
  title: string;
  category: string;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        {
          aspectRatio: 1.5,
          backgroundColor: theme.surfaceMuted,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: "hidden",
          padding: 20,
          justifyContent: "space-between",
        },
        style,
      ]}
    >
      <AppText
        variant="caption"
        color={theme.muted}
        style={{ fontWeight: "700", letterSpacing: 1 }}
      >
        {category.toUpperCase()}
      </AppText>
      <AppText variant="title" numberOfLines={2} style={{ maxWidth: "85%" }}>
        {title}
      </AppText>
      <View
        style={{
          width: 32,
          height: 3,
          backgroundColor: theme.brand,
          borderRadius: 2,
        }}
      />
    </View>
  );
}
