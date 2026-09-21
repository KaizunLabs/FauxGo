export async function exportLocalData(json: string) {
  const url = URL.createObjectURL(
    new Blob([json], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "fauxgo-local-data.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
