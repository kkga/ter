import { hasOwnProperty } from "./utils.ts";
import { Heading } from "./page.ts";

const getTitleFromAttrs = (attrs: unknown): string | undefined => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "title") &&
    typeof attrs.title === "string"
  ) {
    return attrs.title;
  }
};

const hasKey = (attrs: unknown, keys: Array<string>): boolean => {
  if (attrs && typeof attrs === "object") {
    for (const key of Object.keys(attrs)) {
      const keyTyped = key as keyof typeof attrs;
      if (keys.includes(keyTyped) && attrs[keyTyped] === true) {
        return true;
      }
    }
  }
  return false;
};

const getDescriptionFromAttrs = (attrs: unknown): string | undefined => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "description") &&
    typeof attrs.description === "string"
  ) {
    return attrs.description;
  }
};

const getTagsFromAttrs = (attrs: unknown): Array<string> => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "tags") &&
    Array.isArray(attrs.tags)
  ) {
    return attrs.tags;
  }
  return [];
};

const getDateFromAttrs = (attrs: unknown): Date | undefined => {
  if (
    typeof attrs === "object" && hasOwnProperty(attrs, "date") &&
    attrs.date instanceof Date
  ) {
    return attrs.date;
  }
};

const getTitleFromHeadings = (headings: Array<Heading>): string | undefined => {
  for (const h of headings) {
    if (h.level === 1) {
      return h.text;
    }
  }
};

export {
  getDateFromAttrs,
  getDescriptionFromAttrs,
  getTagsFromAttrs,
  getTitleFromAttrs,
  getTitleFromHeadings,
  hasKey,
};
