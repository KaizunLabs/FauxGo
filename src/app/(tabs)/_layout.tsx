import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Redirect, Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  LayoutAnimation,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { Brand } from "@/components/brand";
import { AppText } from "@/components/app-text";
import { Icon } from "@/components/icon";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAppStore } from "@/store/app-store";
const icons = {
  index: "home-outline",
  search: "magnify",
  activity: "clock-outline",
  settings: "tune-variant",
} as const;
export default function TabsLayout() {
  const theme = useAppTheme();
  const store = useAppStore();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktop = width >= 1024;
  const expanded = store.preferences.sidebarExpanded;
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setSystemReducedMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setSystemReducedMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  const reducedMotion =
    store.preferences.reducedMotion === "on" ||
    (store.preferences.reducedMotion === "system" && systemReducedMotion);
  const toggleRail = () => {
    if (Platform.OS !== "web" && !reducedMotion)
      LayoutAnimation.configureNext({
        duration: 220,
        update: { type: LayoutAnimation.Types.easeInEaseOut },
      });
    store.updatePreferences({ sidebarExpanded: !expanded });
  };
  if (!store.onboardingComplete) return <Redirect href="/onboarding" />;
  return (
    <View style={{ flex: 1, backgroundColor: theme.canvas }}>
      <View
        style={{
          minHeight: 72,
          paddingHorizontal: desktop ? 24 : 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          borderBottomWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.surface,
        }}
      >
        {desktop && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              expanded ? "Collapse navigation" : "Expand navigation"
            }
            onPress={toggleRail}
            style={{ padding: 11 }}
          >
            <Icon name="menu" />
          </Pressable>
        )}
        <Brand compact />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change location"
          onPress={() => router.push("/location")}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            minHeight: 44,
          }}
        >
          <Icon name="map-marker-outline" size={20} />
          <View style={{ flexShrink: 1 }}>
            <AppText variant="caption" color={theme.muted}>
              Your location
            </AppText>
            <AppText
              variant="caption"
              numberOfLines={1}
              style={{ fontWeight: "700" }}
            >
              {store.selectedPlace.label}
            </AppText>
          </View>
          <Icon name="chevron-down" size={16} />
        </Pressable>
        {desktop && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate("/search")}
            style={{
              flex: 1.5,
              maxWidth: 460,
              backgroundColor: theme.surfaceMuted,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              padding: 13,
              gap: 10,
            }}
          >
            <Icon name="magnify" />
            <AppText color={theme.muted}>Food, stores, places and more</AppText>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            "Basket, " +
            store.cart.reduce((sum, line) => sum + line.quantity, 0) +
            " items"
          }
          onPress={() => router.push("/cart")}
          style={{
            minWidth: 44,
            minHeight: 44,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          <Icon name="shopping-outline" />
          {store.cart.length > 0 && (
            <AppText variant="caption">
              {store.cart.reduce((sum, line) => sum + line.quantity, 0)}
            </AppText>
          )}
        </Pressable>
      </View>
      {Boolean(store.storageError) && (
        <View
          accessibilityRole="alert"
          style={{ padding: 12, backgroundColor: theme.brandSoft }}
        >
          <AppText variant="caption">{store.storageError}</AppText>
        </View>
      )}
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarPosition: desktop ? "left" : "bottom",
          tabBarActiveTintColor: theme.brand,
          tabBarInactiveTintColor: theme.muted,
          tabBarShowLabel: !desktop || expanded,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            ...(desktop
              ? {
                  width: expanded ? 176 : 76,
                  minWidth: expanded ? 176 : 76,
                  maxWidth: expanded ? 176 : 76,
                  overflow: "hidden",
                  paddingTop: 20,
                  ...(Platform.OS === "web" && !reducedMotion
                    ? {
                        transitionDuration: "220ms",
                        transitionProperty: "width, min-width, max-width",
                        transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
                      }
                    : {}),
                }
              : { minHeight: 72, paddingTop: 8, paddingBottom: 8 }),
          },
          tabBarItemStyle: desktop
            ? { maxHeight: 58, marginHorizontal: 8, borderRadius: 12 }
            : undefined,
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name={icons[route.name as keyof typeof icons] ?? "circle-outline"}
              color={color}
              size={size}
            />
          ),
          tabBarHideOnKeyboard: true,
        })}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "Home", tabBarAccessibilityLabel: "Home" }}
        />
        <Tabs.Screen
          name="search"
          options={{ title: "Search", tabBarAccessibilityLabel: "Search" }}
        />
        <Tabs.Screen
          name="activity"
          options={{ title: "Activity", tabBarAccessibilityLabel: "Activity" }}
        />
        <Tabs.Screen
          name="settings"
          options={{ title: "Settings", tabBarAccessibilityLabel: "Settings" }}
        />
      </Tabs>
    </View>
  );
}
