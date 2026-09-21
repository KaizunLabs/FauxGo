import { ImageSource } from "expo-image";
import { generatedPhotography } from "./photography.generated";

export type Photo = {
  card: ImageSource;
  thumb: ImageSource;
  hero: ImageSource;
  description: string;
  tags: readonly string[];
  sourceId: string;
  fallbackClass: "food" | "grocery" | "merchant";
};

export const photography: Readonly<Record<string, Photo>> =
  generatedPhotography;
