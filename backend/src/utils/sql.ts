export const sanitizeSortOrder = (value: string | undefined): "ASC" | "DESC" =>
  value?.toLowerCase() === "desc" ? "DESC" : "ASC";

export const offsetFromPage = (page: number, limit: number): number => (page - 1) * limit;
