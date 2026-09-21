import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { Map as GLMap, Marker, GeoJSONSource } from "maplibre-gl";
import { View } from "react-native";
import { Button } from "@/components/button";
import { MapFallback } from "./map-fallback";
import { MapProps, mapStyleURL, routeBounds, routeGeoJSON } from "./map-types";

export function MapView(props: MapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<GLMap | null>(null);
  const vehicle = useRef<Marker | null>(null);
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  }, [props]);
  const following = useRef(false);
  const [follow, setFollow] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!container.current) return;
    let cancelled = false;
    let instance: GLMap | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      try {
        const gl = await import("maplibre-gl");
        if (cancelled || !container.current) return;
        gl.setWorkerUrl(
          new URL(
            "/vendor/maplibre/maplibre-gl-worker.mjs",
            window.location.origin,
          ).href,
        );
        instance = new gl.Map({
          container: container.current,
          style: mapStyleURL,
          center: [...latest.current.center],
          zoom: 13,
          attributionControl: { compact: true },
        });
        map.current = instance;
        instance.addControl(
          new gl.NavigationControl({ showCompass: true }),
          "top-right",
        );
        timer = setTimeout(() => {
          if (!cancelled && !instance?.isStyleLoaded()) setFailed(true);
        }, 15000);
        instance.on("load", () => {
          if (timer) clearTimeout(timer);
          if (cancelled || !instance) return;
          const current = latest.current;
          setFailed(false);
          if (current.route) {
            instance.addSource("journey", {
              type: "geojson",
              data: routeGeoJSON(current.route),
            });
            instance.addLayer({
              id: "journey-line",
              type: "line",
              source: "journey",
              layout: { "line-cap": "round", "line-join": "round" },
              paint: {
                "line-color": "#C94332",
                "line-width": current.approximate ? 3 : 5,
                "line-opacity": current.approximate ? 0.58 : 1,
                ...(current.approximate ? { "line-dasharray": [2, 2] } : {}),
              },
            });
            const bounds = routeBounds(current.route);
            instance.fitBounds(
              [
                [bounds[0], bounds[1]],
                [bounds[2], bounds[3]],
              ],
              { padding: 60, maxZoom: 15, duration: 0 },
            );
            for (const [index, point] of [
              current.route.points[0],
              current.route.points.at(-1)!,
            ].entries())
              new gl.Marker({ color: index ? "#C94332" : "#20201F" })
                .setLngLat([...point])
                .addTo(instance);
          }
          if (!(current.showVehicle ?? Boolean(current.position))) return;
          const element = document.createElement("div");
          element.textContent = "▲";
          element.setAttribute("aria-label", "Vehicle position");
          Object.assign(element.style, {
            width: "36px",
            height: "36px",
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            background: "#20201F",
            border: "3px solid white",
            color: "white",
            fontSize: "20px",
            boxShadow: "0 2px 8px #0003",
          });
          vehicle.current = new gl.Marker({ element, rotationAlignment: "map" })
            .setLngLat([...(current.position ?? current.center)])
            .setRotation(current.heading ?? 0)
            .addTo(instance);
        });
        instance.on("dragstart", () => {
          following.current = false;
          setFollow(false);
        });
        instance.on("zoomstart", (event) => {
          if (event.originalEvent) {
            following.current = false;
            setFollow(false);
          }
        });
        instance.on("click", (event) =>
          latest.current.onPick?.([event.lngLat.lng, event.lngLat.lat]),
        );
        instance.on("error", (event) => {
          if (__DEV__) console.warn("Map resource failed", event.error.message);
          if (instance && !instance.isStyleLoaded()) setFailed(true);
        });
      } catch (error) {
        if (__DEV__)
          console.warn(
            "Map renderer initialization failed",
            error instanceof Error ? error.message : "Unknown renderer error",
          );
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      vehicle.current = null;
      map.current = null;
      instance?.remove();
    };
  }, [attempt]);
  useEffect(() => {
    const instance = map.current;
    if (!instance?.isStyleLoaded()) return;
    if (props.showVehicle === false) {
      vehicle.current?.remove();
      vehicle.current = null;
      return;
    }
    const point = props.position ?? props.center;
    vehicle.current?.setLngLat([...point]).setRotation(props.heading ?? 0);
    if (following.current)
      instance.easeTo({
        center: [...point],
        duration: props.reducedMotion ? 0 : 500,
      });
    if (props.route)
      (instance.getSource("journey") as GeoJSONSource | undefined)?.setData(
        routeGeoJSON(props.route),
      );
  }, [
    props.position,
    props.center,
    props.heading,
    props.route,
    props.reducedMotion,
    props.showVehicle,
  ]);
  const recenter = () => {
    following.current = true;
    setFollow(true);
    map.current?.easeTo({
      center: [...(props.position ?? props.center)],
      zoom: 15,
      duration: props.reducedMotion ? 0 : 600,
    });
  };
  const overview = () => {
    following.current = false;
    setFollow(false);
    if (!props.route) return recenter();
    const bounds = routeBounds(props.route);
    map.current?.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: 60, maxZoom: 15, duration: props.reducedMotion ? 0 : 600 },
    );
  };
  return (
    <View
      style={{
        height: props.height ?? 420,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        ref={container}
        aria-label="Interactive route map"
        style={{
          position: "absolute",
          inset: 0,
          visibility: failed ? "hidden" : "visible",
          width: "100%",
          height: "100%",
        }}
      />
      {failed ? (
        <MapFallback
          {...props}
          onRetry={() => {
            setFailed(false);
            setAttempt(attempt + 1);
          }}
        />
      ) : (
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Button
            label={follow ? "Following" : "Recenter"}
            icon="crosshairs-gps"
            variant="secondary"
            onPress={recenter}
          />
          {props.route && (
            <Button label="Overview" variant="secondary" onPress={overview} />
          )}
        </View>
      )}
    </View>
  );
}
