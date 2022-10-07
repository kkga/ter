export const hasKey = (
  data: Record<string, unknown>,
  keys: Array<string>,
): boolean => {
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

export const getTitle = (data: Record<string, unknown>): string | undefined => {
  if (typeof data.title === "string") {
    return data.title;
  }
};

export const getDescription = (
  data: Record<string, unknown>,
): string | undefined => {
  if (typeof data.description === "string") {
    return data.description;
  }
};

export const getTags = (
  data: Record<string, unknown>,
): Array<string> | undefined => {
  if (Array.isArray(data.tags)) {
    return data.tags;
  }
};

export const getDate = (data: Record<string, unknown>): Date | undefined => {
  if (data.date instanceof Date) {
    return data.date;
  }
};
