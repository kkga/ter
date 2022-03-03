export type PageData = Record<string, unknown>;

export const getTitle = (data: PageData): string | undefined => {
  if (typeof data.title === "string") {
    return data.title;
  }
};

export const hasKey = (data: PageData, keys: Array<string>): boolean => {
  for (const key of Object.keys(data)) {
    const keyTyped = key as keyof typeof data;
    if (keys.includes(keyTyped) && data[keyTyped] === true) {
      return true;
    }
  }
  return false;
};

export const getDescription = (data: PageData): string | undefined => {
  if (typeof data.description === "string") {
    return data.description;
  }
};

export const getTags = (data: PageData): Array<string> => {
  if (Array.isArray(data.tags)) {
    return data.tags;
  }
  return [];
};

export const getDate = (data: PageData): Date | undefined => {
  if (data.date instanceof Date) {
    return data.date;
  }
};
