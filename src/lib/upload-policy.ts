export const CUSTOMER_UPLOADS = {
  maxFilesPerItem: 8,
  minFilesPerItem: 2,
  maxBytesPerFile: 10 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
};

export function isAllowedImageMimeType(mimeType: string): boolean {
  return (CUSTOMER_UPLOADS.allowedMimeTypes as readonly string[]).includes(mimeType);
}

export function getExtensionForMimeType(mimeType: string): string | null {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}
