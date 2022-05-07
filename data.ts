export type PageAttributes = Record<string, unknown>;

export const hasKey = (attrs: PageAttributes, keys: Array<string>): boolean => {
  for (const key of Object.keys(attrs)) {
    const keyTyped = key as keyof typeof attrs;
    if (keys.includes(keyTyped) && attrs[keyTyped] === true) {
      return true;
    }
  }
  return false;
};

export const getTitle = (attrs: PageAttributes): string | undefined => {
  if (typeof attrs.title === "string") {
    return attrs.title;
  }
};

export const getDescription = (attrs: PageAttributes): string | undefined => {
  if (typeof attrs.description === "string") {
    return attrs.description;
  }
};

export const getTags = (attrs: PageAttributes): Array<string> => {
  if (Array.isArray(attrs.tags)) {
    return attrs.tags;
  }
  return [];
};

export const getDate = (attrs: PageAttributes): Date | undefined => {
  if (attrs.date instanceof Date) {
    return attrs.date;
  }
};
