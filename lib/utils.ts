import { type ClassValue, clsx } from "clsx";
import qs from "qs";
import { twMerge } from "tailwind-merge";
import { aspectRatioOptions } from "@/constants";

// Custom error types for better error handling
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown): never => {
  console.error("Debugging Error in handleError:", error);

  if (error instanceof AuthenticationError) {
    console.error("AuthenticationError:", error.message);
    throw new Error(`Authentication Error: ${error.message}`);
  }

  if (error instanceof ValidationError) {
    console.error("ValidationError:", error.message);
    throw new Error(`Validation Error: ${error.message}`);
  }

  if (error instanceof Error) {
    if (
      error.message.toLowerCase().includes("auth") ||
      error.message.toLowerCase().includes("authentication") ||
      error.message.toLowerCase().includes("credentials") ||
      error.message.toLowerCase().includes("unauthorized")
    ) {
      console.error("Detected Authentication-Related Error:", error.message);
      throw new AuthenticationError(
        "Authentication failed. Please check your credentials and try again."
      );
    }

    console.error("Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw new Error(`Error: ${error.message}`);
  }

  if (typeof error === "string") {
    if (
      error.toLowerCase().includes("auth") ||
      error.toLowerCase().includes("authentication") ||
      error.toLowerCase().includes("credentials") ||
      error.toLowerCase().includes("unauthorized")
    ) {
      console.error("Detected Authentication-Related Error String:", error);
      throw new AuthenticationError(
        "Authentication failed. Please check your credentials and try again."
      );
    }

    console.error("Error string:", error);
    throw new Error(`Error: ${error}`);
  }

  console.error("Unknown error type:", error);
  try {
    const errorString = JSON.stringify(error);
    throw new Error(`Unknown error: ${errorString}`);
  } catch {
    throw new Error("An unknown error occurred");
  }
};

const shimmer = (w: number, h: number): string => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
</svg>`;

const toBase64 = (str: string): string => {
  try {
    if (typeof window === "undefined") {
      return Buffer.from(str).toString("base64");
    } else {
      return window.btoa(str);
    }
  } catch (error) {
    console.error("Base64 conversion failed:", error);
    throw new Error("Failed to convert string to base64");
  }
};

export const dataUrl = `data:image/svg+xml;base64,${toBase64(
  shimmer(1000, 1000)
)}`;

interface FormUrlQueryParams {
  searchParams: URLSearchParams;
  key: string;
  value: string;
}

export const formUrlQuery = ({
  searchParams,
  key,
  value,
}: FormUrlQueryParams): string => {
  if (typeof window === "undefined") {
    throw new Error(
      "`formUrlQuery` can only be used in the browser environment."
    );
  }

  try {
    const params = { ...qs.parse(searchParams.toString()), [key]: value };
    return `${window.location.pathname}?${qs.stringify(params, {
      skipNulls: true,
    })}`;
  } catch (error) {
    console.error("URL query formation failed:", error);
    throw new Error("Failed to form URL query");
  }
};

interface RemoveUrlQueryParams {
  searchParams: URLSearchParams;
  keysToRemove: string[];
}

export function removeKeysFromQuery({
  searchParams,
  keysToRemove,
}: RemoveUrlQueryParams): string {
  if (typeof window === "undefined") {
    throw new Error(
      "`removeKeysFromQuery` can only be used in the browser environment."
    );
  }

  try {
    const currentUrl = qs.parse(searchParams.toString());

    keysToRemove.forEach((key) => {
      delete currentUrl[key];
    });

    Object.keys(currentUrl).forEach(
      (key) => currentUrl[key] == null && delete currentUrl[key]
    );

    return `${window.location.pathname}?${qs.stringify(currentUrl)}`;
  } catch (error) {
    console.error("URL query removal failed:", error);
    throw new Error("Failed to remove keys from URL query");
  }
}

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export type AspectRatioKey = keyof typeof aspectRatioOptions;

export const getImageSize = (
  type: string,
  image: any,
  dimension: "width" | "height"
): number => {
  try {
    if (type === "fill") {
      return (
        aspectRatioOptions[image.aspectRatio as AspectRatioKey]?.[dimension] ||
        1000
      );
    }
    return image?.[dimension] || 1000;
  } catch (error) {
    console.error("Image size calculation failed:", error);
    return 1000;
  }
};

export const download = async (
  url: string,
  filename: string
): Promise<void> => {
  if (!url) {
    throw new ValidationError(
      "Resource URL not provided! You need to provide one"
    );
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const blobURL = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobURL;

    if (filename && filename.length) {
      a.download = `${filename.replace(/\s+/g, "_")}.png`;
    }

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobURL);
  } catch (error) {
    console.error("Download failed:", error);
    throw new Error("Failed to download image");
  }
};

export const deepMergeObjects = (obj1: any, obj2: any): any => {
  try {
    if (obj2 === null || obj2 === undefined) {
      return obj1;
    }

    let output = { ...obj2 };

    for (let key in obj1) {
      if (Object.prototype.hasOwnProperty.call(obj1, key)) {
        if (
          obj1[key] &&
          typeof obj1[key] === "object" &&
          obj2[key] &&
          typeof obj2[key] === "object"
        ) {
          output[key] = deepMergeObjects(obj1[key], obj2[key]);
        } else {
          output[key] = obj1[key];
        }
      }
    }

    return output;
  } catch (error) {
    console.error("Object merge failed:", error);
    throw new Error("Failed to merge objects");
  }
};
