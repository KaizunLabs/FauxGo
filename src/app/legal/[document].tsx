import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/app-text";
import { Page } from "@/components/page";
import { ScreenHeader } from "@/components/screen-header";
import { radii, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

const documents = {
  privacy: {
    title: "Privacy",
    updated: "Updated September 14, 2026 · release draft",
    sections: [
      [
        "The short version",
        "FauxGo works without an account. Simulations stay on your device. Location is optional; manual and saved places work without permission. No real payment details, contacts, advertising identifiers or analytics are requested.",
      ],
      [
        "Data on your device",
        "Settings, basket notes, favorites, ratings, saved and recent places, selected coordinates and simulation history are stored locally, without app-level encryption. Exports include this information. Avoid sensitive notes, share exports carefully, and remove data in Settings. Device backups may retain copies.",
      ],
      [
        "Network use",
        "Maps request styles and tiles from OpenFreeMap by default; the provider receives your IP address and the map area viewed. A deployment may configure another map provider. If routing is configured, pickup and destination coordinates are sent to that routing provider. Address search sends the entered query only when you choose Search addresses and a search provider is configured. No booking, payment, dispatch, advertising or analytics requests are made. Hosting providers may receive ordinary access logs.",
      ],
      [
        "Permissions",
        "Foreground location is requested only after you choose to use your location. There is no background location tracking. Native notifications are optional, scheduled locally, and may show journey details on the lock screen. No push token is registered. Camera, microphone, contacts, phone, SMS and photo-library access are not needed.",
      ],
      [
        "Children and contact",
        "FauxGo is general-audience entertainment and is not designed to collect information from children. Before a public release, the project maintainer must add a monitored privacy contact address in the store listing and repository.",
      ],
    ],
  },
  terms: {
    title: "Terms for pretending",
    updated: "Effective September 13, 2026",
    sections: [
      [
        "Entertainment only",
        "FauxGo is a fictional simulation. It cannot provide or arrange food, groceries, transport, courier delivery, aviation, payments, calls or messages. Nothing shown is a promise of a real-world service.",
      ],
      [
        "Fictional content",
        "Businesses, operators, vehicles, menus, prices and service events are fictional. Maps and user-selected addresses may refer to real places, but they never create a service request. Routes and timing are for entertainment, not navigation.",
      ],
      [
        "No reliance",
        "Do not rely on FauxGo for transportation, deliveries, emergencies, dietary or allergy information, navigation, pricing, scheduling or other real-world decisions.",
      ],
      [
        "Open-source software",
        "The software is provided under the repository license, without warranties. Contributions must preserve the simulation-only boundary and avoid third-party trademarks or proprietary datasets.",
      ],
    ],
  },
  licenses: {
    title: "Licenses & attribution",
    updated: "Open-source foundations",
    sections: [
      [
        "FauxGo",
        "Application source is available under the MIT license. See LICENSE and THIRD_PARTY_NOTICES.md in the repository for terms and component notices.",
      ],
      [
        "Maps",
        "MapLibre GL JS uses the BSD 3-Clause license; MapLibre React Native uses the BSD 2-Clause license. Default map attribution: OpenFreeMap, OpenMapTiles and OpenStreetMap contributors. Attribution remains visible on the map.",
      ],
      [
        "Photography",
        "The local library combines original FauxGo artwork with photographs selected through the Pexels Photos API. Pexels photographers retain credit in the repository’s machine-readable provenance file and review sheet; source and creator links are documented in docs/ASSETS.md. These are illustrative catalog images, not photographs of partner businesses.",
      ],
    ],
  },
  about: {
    title: "About FauxGo",
    updated: "Independent by design",
    sections: [
      [
        "A polished little non-event",
        "FauxGo explores the anticipation and choreography of modern on-demand interfaces. The humour lives in doing all that tapping for an outcome everyone knows is imaginary.",
      ],
      [
        "Original and unaffiliated",
        "FauxGo is independently designed and is not affiliated with, endorsed by, or connected to any real delivery, mobility, grocery, restaurant, courier or aviation company. It uses original branding, fictional content and no proprietary service data.",
      ],
      [
        "Built in the open",
        "The project is intended for public development and welcomes accessible, privacy-preserving improvements. Its non-negotiable rule is simple: no real transaction or service request can ever be introduced.",
      ],
    ],
  },
} as const;

export default function LegalScreen() {
  const { document } = useLocalSearchParams<{
    document: keyof typeof documents;
  }>();
  const theme = useAppTheme();
  const content = documents[document] ?? documents.about;
  return (
    <Page contentStyle={styles.page}>
      <ScreenHeader title={content.title} subtitle={content.updated} />
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {content.sections.map(([title, body]) => (
          <View key={title} style={styles.section}>
            <AppText variant="heading">{title}</AppText>
            <AppText color={theme.muted}>{body}</AppText>
          </View>
        ))}
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  page: { maxWidth: 760 },
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    gap: spacing.xxl,
  },
  section: { gap: spacing.md },
});
