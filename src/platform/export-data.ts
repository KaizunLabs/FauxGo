import { Share } from "react-native";
export async function exportLocalData(json: string) {
  await Share.share({ title: "FauxGo local data", message: json });
}
