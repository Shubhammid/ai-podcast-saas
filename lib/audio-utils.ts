/**
 * @param file - Audio File object
 * @returns Duration in seconds (floored to integer)
 * @throws Error if file cannot be loaded or is invalid
 */
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(objectUrl); 
      resolve(Math.floor(audio.duration)); 
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load audio file"));
    });
    audio.src = objectUrl;
  });
}
/**
 * @param fileSize - File size in bytes
 * @returns Estimated duration in seconds
 */
export function estimateDurationFromSize(fileSize: number): number {
  return Math.floor((fileSize / (1024 * 1024)) * 8 * 60);
}
