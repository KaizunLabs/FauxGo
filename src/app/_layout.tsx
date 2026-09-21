import "@/global.css";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppStoreProvider, useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";
import { palette } from "@/constants/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <Navigation />
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}

function Navigation() {
  const theme = useAppTheme();
  const store = useAppStore();
  const dark = theme !== palette;
  if (!store.hydrated)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.canvas,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          color={theme.brand}
          accessibilityLabel="Opening FauxGo"
        />
      </View>
    );
  return (
    <ThemeProvider value={dark ? DarkTheme : DefaultTheme}>
      <StatusBar style={dark ? "light" : "dark"} />
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: theme.canvas }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            animation:
              store.preferences.reducedMotion === "on"
                ? "none"
                : "slide_from_right",
            contentStyle: { backgroundColor: theme.canvas },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
          <Stack.Screen name="service/[id]" />
          <Stack.Screen name="item/[id]" />
          <Stack.Screen name="cart" options={{ presentation: "modal" }} />
          <Stack.Screen name="checkout" />
          <Stack.Screen
            name="tracking/[id]"
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="legal/[document]" />
        </Stack>
      </SafeAreaView>
    </ThemeProvider>
  );
}
