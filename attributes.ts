import { JSONValue } from "./types.d.ts";

export const hasKey = (data: JSONValue, keys: string[]): boolean => {
  if (data) {
    for (const key of Object.keys(data)) {
      if (keys.includes(key) && data[key] === true) {
        return true;
      }
    }
  }
  return false;
};

export const getVal = (data: JSONValue, key: string): unknown | undefined =>
  data[key] ?? undefined;

export const getBool = (data: JSONValue, key: string): boolean | undefined =>
  data[key] !== undefined && typeof data[key] === "boolean"
    ? (data[key] as boolean)
    : undefined;

export const getTitle = (data: JSONValue): string | undefined =>
  typeof data.title === "string" ? data.title : undefined;

export const getDescription = (data: JSONValue): string | undefined =>
  typeof data.description === "string" ? data.description : undefined;

export const getDate = (data: JSONValue): Date | undefined =>
  data.date instanceof Date ? data.date : undefined;

export const getDateUpdated = (data: JSONValue): Date | undefined =>
  data.dateUpdated instanceof Date ? data.dateUpdated : undefined;

export const getTags = (data: JSONValue): string[] | undefined =>
  Array.isArray(data.tags) ? data.tags.map((t) => t.toString()) : undefined;
