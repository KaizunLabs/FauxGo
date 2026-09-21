export const AD_COMPLETION_CAP = 2;
export const AD_WINDOW_MS = 24 * 60 * 60 * 1000;
export const AD_NEW_USER_GRACE_MS = 24 * 60 * 60 * 1000;

export function canShowCompletionAd(input: {
  enabled: boolean;
  consent: "unset" | "non-personalized" | "personalized" | "disabled";
  onboardingCompletedAt?: number;
  completionTimestamps: number[];
  now?: number;
}) {
  const now = input.now ?? Date.now();
  if (
    !input.enabled ||
    input.consent === "unset" ||
    input.consent === "disabled"
  )
    return false;
  if (
    !input.onboardingCompletedAt ||
    now - input.onboardingCompletedAt < AD_NEW_USER_GRACE_MS
  )
    return false;
  const recent = input.completionTimestamps.filter(
    (timestamp) => timestamp > now - AD_WINDOW_MS,
  );
  return recent.length < AD_COMPLETION_CAP;
}
