import {
  Map,
  Camera,
  CameraRef,
  GeoJSONSource,
  Layer,
  Marker,
} from "@maplibre/maplibre-react-native";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Icon } from "@/components/icon";
import { Button } from "@/components/button";
import { MapFallback } from "./map-fallback";
import { MapProps, mapStyleURL, routeBounds, routeGeoJSON } from "./map-types";
import { Coordinate } from "@/core/models";
export function MapView(props: MapProps) {
  const camera = useRef<CameraRef>(null);
  const [follow, setFollow] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const position = props.position ?? props.center;
  const [animatedPosition, setAnimatedPosition] =
    useState<Coordinate>(position);
  const animatedPositionRef = useRef<Coordinate>(position);
  const [animatedHeading, setAnimatedHeading] = useState(props.heading ?? 0);
  const headingRef = useRef(props.heading ?? 0);
  const previousRouteId = useRef(props.route?.id);
  useEffect(() => {
    const from = animatedPositionRef.current;
    const fromHeading = headingRef.current;
    const targetHeading = props.heading ?? 0;
    const turn = ((targetHeading - fromHeading + 540) % 360) - 180;
    const duration = props.reducedMotion ? 0 : 450;
    const start = Date.now();
    let frame: number;
    const step = () => {
      const progress = duration
        ? Math.min(1, (Date.now() - start) / duration)
        : 1;
      const next: Coordinate = [
        from[0] + (position[0] - from[0]) * progress,
        from[1] + (position[1] - from[1]) * progress,
      ];
      animatedPositionRef.current = next;
      headingRef.current = fromHeading + turn * progress;
      setAnimatedPosition(next);
      setAnimatedHeading(headingRef.current);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [position, props.heading, props.reducedMotion]);
  useEffect(() => {
    if (!props.route || previousRouteId.current === props.route.id) return;
    previousRouteId.current = props.route.id;
    camera.current?.fitBounds(routeBounds(props.route), {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      duration: props.reducedMotion ? 0 : 600,
    });
  }, [props.route, props.reducedMotion]);
  useEffect(() => {
    if (follow)
      camera.current?.easeTo({
        center: [...position],
        duration: props.reducedMotion ? 0 : 500,
      });
  }, [follow, position, props.reducedMotion]);
  if (failed)
    return (
      <MapFallback
        {...props}
        onRetry={() => {
          setFailed(false);
          setAttempt(attempt + 1);
        }}
      />
    );
  return (
    <View
      style={{
        height: props.height ?? 420,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <Map
        key={attempt}
        mapStyle={mapStyleURL}
        attribution
        onDidFailLoadingMap={() => setFailed(true)}
        onRegionWillChange={(event) => {
          if (event.nativeEvent.userInteraction) setFollow(false);
        }}
        onPress={(event) => props.onPick?.(event.nativeEvent.lngLat)}
      >
        <Camera
          ref={camera}
          initialViewState={
            props.route
              ? {
                  bounds: routeBounds(props.route),
                  padding: { top: 60, bottom: 60, left: 60, right: 60 },
                }
              : { center: [...props.center], zoom: 13 }
          }
        />
        {props.route && (
          <>
            <GeoJSONSource id="journey" data={routeGeoJSON(props.route)}>
              <Layer
                id="journey-line"
                type="line"
                paint={{
                  "line-color": "#C94332",
                  "line-width": props.approximate ? 3 : 5,
                  "line-opacity": props.approximate ? 0.58 : 1,
                  ...(props.approximate
                    ? { "line-dasharray": [2, 2] as [number, number] }
                    : {}),
                }}
                layout={{ "line-cap": "round", "line-join": "round" }}
              />
            </GeoJSONSource>
            {[props.route.points[0], props.route.points.at(-1)!].map(
              (point, index) => (
                <Marker key={index} lngLat={[...point]}>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: index ? "#C94332" : "#20201F",
                      borderWidth: 3,
                      borderColor: "white",
                    }}
                  />
                </Marker>
              ),
            )}
          </>
        )}
        {(props.showVehicle ?? Boolean(props.position)) && (
          <Marker lngLat={[...animatedPosition]}>
            <View
              style={{
                backgroundColor: "#20201F",
                borderRadius: 20,
                padding: 7,
                transform: [{ rotate: animatedHeading + "deg" }],
              }}
            >
              <Icon name="navigation" color="white" size={22} />
            </View>
          </Marker>
        )}
      </Map>
      <View
        style={{
          position: "absolute",
          left: 12,
          bottom: 36,
          flexDirection: "row",
          gap: 8,
        }}
      >
        <Button
          label={follow ? "Following" : "Recenter"}
          variant="secondary"
          onPress={() => {
            setFollow(true);
            camera.current?.easeTo({
              center: [...position],
              zoom: 15,
              duration: props.reducedMotion ? 0 : 500,
            });
          }}
        />
        {props.route && (
          <Button
            label="Overview"
            variant="secondary"
            onPress={() => {
              setFollow(false);
              camera.current?.fitBounds(routeBounds(props.route!), {
                padding: { top: 60, bottom: 60, left: 60, right: 60 },
                duration: props.reducedMotion ? 0 : 500,
              });
            }}
          />
        )}
      </View>
    </View>
  );
}
