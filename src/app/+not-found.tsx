import { useRouter } from "expo-router";
import { EmptyState } from "@/components/empty-state";
import { Page } from "@/components/page";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Page scroll={false} contentStyle={{ justifyContent: "center" }}>
      <EmptyState
        icon="sign-direction-remove"
        title="This route is imaginary, even for us"
        description="The page you tried to reach does not exist."
        actionLabel="Back to FauxGo"
        onAction={() => router.replace("/")}
      />
    </Page>
  );
}
