export type PageAttributes = Record<string, unknown>;

export const hasKey = (data: PageAttributes, keys: Array<string>): boolean => {
  if (data) {
    for (const key of Object.keys(data)) {
      const keyTyped = key as keyof typeof data;
      if (keys.includes(keyTyped) && data[keyTyped] === true) {
        return true;
      }
    }
  }
  return false;
};

export const getTitle = (data: PageAttributes): string | undefined => {
  if (typeof data.title === "string") {
    return data.title;
  }
};

export const getDescription = (data: PageAttributes): string | undefined => {
  if (typeof data.description === "string") {
    return data.description;
  }
};

export const getTags = (data: PageAttributes): Array<string> | undefined => {
  if (Array.isArray(data.tags)) {
    return data.tags;
  }
};

export const getDate = (data: PageAttributes): Date | undefined => {
  if (data.date instanceof Date) {
    return data.date;
  }
};
