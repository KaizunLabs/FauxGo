import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { getLocales } from "expo-localization";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";
import { getCatalogItem } from "@/core/catalog";
import {
  AppStateV2,
  CartLine,
  Favorite,
  Rating,
  SavedPlace,
  Simulation,
  UserPreference,
} from "@/core/models";
import { inferRegion, normalizePreferences } from "@/core/preferences";
import { normalizePaymentMethod } from "@/core/payments";
import { restoreState, normalizeSimulation } from "@/core/persistence";
import { regions } from "@/core/regions";
import {
  addCartItem,
  cartLineKey,
  createInitialState,
  normalizeCart,
  normalizePlace,
} from "@/core/state";
import { startManualJourney } from "@/core/simulation";
import { notificationPlan } from "@/core/notification-plan";
import { syncNotifications } from "@/platform/notifications";

const STORAGE_KEY = "@fauxgo/state/v2";
const LEGACY_KEY = "@fauxgo/state/v1";
const localeRegion = () => inferRegion(getLocales()[0]?.languageTag);
type Store = AppStateV2 & {
  hydrated: boolean;
  storageError: string | null;
  notificationError: string | null;
  completeOnboarding: () => void;
  addToCart: (line: CartLine) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  addSimulation: (simulation: Simulation) => void;
  deleteSimulation: (id: string) => void;
  startJourney: (id: string) => void;
  rateSimulation: (id: string, rating: Rating) => void;
  updatePreferences: (preferences: Partial<UserPreference>) => void;
  selectPlace: (place: SavedPlace) => void;
  savePlace: (place: SavedPlace) => void;
  deletePlace: (id: string) => void;
  selectPayment: (id: string) => void;
  toggleFavorite: (kind: Favorite["kind"], targetId: string) => void;
  clearHistory: () => void;
  resetAll: () => Promise<void>;
  exportData: () => string;
  haptic: () => void;
};
const Context = createContext<Store | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(() => createInitialState(localeRegion()));
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );
  const writes = useRef<Promise<void>>(Promise.resolve());
  const persistAllowed = useRef(false);
  const notificationWrites = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const reconcile = () => {
      notificationWrites.current = notificationWrites.current
        .catch(() => undefined)
        .then(async () => {
          if (!active) return;
          await syncNotifications(
            notificationPlan(state.simulations, state.preferences, Date.now()),
          );
          if (active) setNotificationError(null);
        })
        .catch(() => {
          if (active)
            setNotificationError(
              "Some notification changes could not be applied. Follow progress in Activity; we’ll retry when you return to the app.",
            );
        });
    };
    reconcile();
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") reconcile();
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [hydrated, state.simulations, state.preferences]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored =
          (await AsyncStorage.getItem(STORAGE_KEY)) ??
          (await AsyncStorage.getItem(LEGACY_KEY));
        const restored = stored
          ? restoreState(JSON.parse(stored), localeRegion())
          : createInitialState(localeRegion());
        if (mounted) {
          setState(restored);
          persistAllowed.current = true;
        }
      } catch {
        if (mounted)
          setStorageError(
            "Saved data could not be opened. You can use this session; reset local data in Settings to enable saving again.",
          );
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !persistAllowed.current) return;
    const serialized = JSON.stringify(state);
    writes.current = writes.current
      .catch(() => undefined)
      .then(async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, serialized);
          setStorageError(null);
        } catch {
          setStorageError(
            "Changes are available in this session but could not be saved on this device.",
          );
        }
      });
  }, [state, hydrated]);

  const completeOnboarding = useCallback(
    () =>
      setState((current) => ({
        ...current,
        onboardingComplete: true,
        onboardingCompletedAt: current.onboardingCompletedAt ?? Date.now(),
      })),
    [],
  );
  const addToCart = useCallback(
    (line: CartLine) =>
      setState((current) => {
        const cart = addCartItem(current.cart, line);
        return {
          ...current,
          cart,
          cartService: cart.length
            ? getCatalogItem(cart[0].itemId)!.serviceType
            : null,
        };
      }),
    [],
  );
  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      setState((current) => {
        if (!Number.isInteger(quantity)) return current;
        const cart = normalizeCart(
          current.cart.map((line) =>
            cartLineKey(line) === key ? { ...line, quantity } : line,
          ),
        );
        return {
          ...current,
          cart,
          cartService: cart.length ? current.cartService : null,
        };
      }),
    [],
  );
  const clearCart = useCallback(
    () => setState((current) => ({ ...current, cart: [], cartService: null })),
    [],
  );
  const addSimulation = useCallback((simulation: Simulation) => {
    const valid = normalizeSimulation(simulation);
    if (!valid)
      throw new Error(
        "This booking could not be saved. Please review the details.",
      );
    setState((current) => ({
      ...current,
      simulations: [
        valid,
        ...current.simulations.filter((item) => item.id !== valid.id),
      ].slice(0, 100),
      cart: [],
      cartService: null,
    }));
  }, []);
  const deleteSimulation = useCallback(
    (id: string) =>
      setState((current) => ({
        ...current,
        simulations: current.simulations.filter((item) => item.id !== id),
      })),
    [],
  );
  const startJourney = useCallback(
    (id: string) =>
      setState((current) => ({
        ...current,
        simulations: current.simulations.map((item) =>
          item.id === id ? startManualJourney(item, Date.now()) : item,
        ),
      })),
    [],
  );
  const rateSimulation = useCallback(
    (id: string, rating: Rating) =>
      setState((current) => ({
        ...current,
        simulations: current.simulations.map((item) =>
          item.id === id
            ? (normalizeSimulation({ ...item, rating }) ?? item)
            : item,
        ),
      })),
    [],
  );
  const updatePreferences = useCallback(
    (patch: Partial<UserPreference>) =>
      setState((current) => {
        const regionChanged =
          patch.region && patch.region !== current.preferences.region;
        const preferences = normalizePreferences({
          ...current.preferences,
          ...patch,
          ...(regionChanged
            ? {
                currency: regions[patch.region!].currency,
                units: patch.region === "US" ? "mi" : "km",
                regionSource: patch.regionSource ?? "manual",
              }
            : {}),
        });
        return {
          ...current,
          preferences,
          selectedPlace: regionChanged
            ? regions[preferences.region].places[0]
            : current.selectedPlace,
          paymentMethodId: normalizePaymentMethod(
            current.paymentMethodId,
            preferences.region,
          ),
          cart: regionChanged ? [] : current.cart,
          cartService: regionChanged ? null : current.cartService,
        };
      }),
    [],
  );
  const selectPlace = useCallback((input: SavedPlace) => {
    const place = normalizePlace(input);
    if (!place) return;
    setState((current) => ({
      ...current,
      selectedPlace: place,
      recentPlaces: [
        place,
        ...current.recentPlaces.filter((item) => item.id !== place.id),
      ].slice(0, 12),
    }));
  }, []);
  const savePlace = useCallback((input: SavedPlace) => {
    const place = normalizePlace(input);
    if (!place) return;
    setState((current) => ({
      ...current,
      savedPlaces: [
        place,
        ...current.savedPlaces.filter(
          (item) =>
            item.id !== place.id &&
            (place.kind === "custom" || item.kind !== place.kind),
        ),
      ].slice(0, 30),
    }));
  }, []);
  const deletePlace = useCallback(
    (id: string) =>
      setState((current) => ({
        ...current,
        savedPlaces: current.savedPlaces.filter((item) => item.id !== id),
        recentPlaces: current.recentPlaces.filter((item) => item.id !== id),
      })),
    [],
  );
  const selectPayment = useCallback(
    (id: string) =>
      setState((current) => ({
        ...current,
        paymentMethodId: normalizePaymentMethod(id, current.preferences.region),
      })),
    [],
  );
  const toggleFavorite = useCallback(
    (kind: Favorite["kind"], targetId: string) =>
      setState((current) => {
        const id = kind + "-" + targetId;
        return {
          ...current,
          favorites: current.favorites.some((item) => item.id === id)
            ? current.favorites.filter((item) => item.id !== id)
            : [
                { id, kind, targetId, createdAt: Date.now() },
                ...current.favorites,
              ].slice(0, 200),
        };
      }),
    [],
  );
  const clearHistory = useCallback(
    () => setState((current) => ({ ...current, simulations: [] })),
    [],
  );
  const resetAll = useCallback(async () => {
    persistAllowed.current = false;
    await writes.current.catch(() => undefined);
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_KEY]);
      persistAllowed.current = true;
      setStorageError(null);
      setState(createInitialState(localeRegion()));
    } catch {
      setStorageError("Local data could not be removed. Please try again.");
      throw new Error("Local data could not be removed");
    }
  }, []);
  const exportData = useCallback(() => JSON.stringify(state, null, 2), [state]);
  const haptic = useCallback(() => {
    if (state.preferences.haptics && Platform.OS !== "web")
      Haptics.selectionAsync().catch(() => undefined);
  }, [state.preferences.haptics]);
  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      storageError,
      notificationError,
      completeOnboarding,
      addToCart,
      setQuantity,
      clearCart,
      addSimulation,
      deleteSimulation,
      startJourney,
      rateSimulation,
      updatePreferences,
      selectPlace,
      savePlace,
      deletePlace,
      selectPayment,
      toggleFavorite,
      clearHistory,
      resetAll,
      exportData,
      haptic,
    }),
    [
      state,
      hydrated,
      storageError,
      notificationError,
      completeOnboarding,
      addToCart,
      setQuantity,
      clearCart,
      addSimulation,
      deleteSimulation,
      startJourney,
      rateSimulation,
      updatePreferences,
      selectPlace,
      savePlace,
      deletePlace,
      selectPayment,
      toggleFavorite,
      clearHistory,
      resetAll,
      exportData,
      haptic,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAppStore() {
  const store = useContext(Context);
  if (!store)
    throw new Error("useAppStore must be used inside AppStoreProvider");
  return store;
}
