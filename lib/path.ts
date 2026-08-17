export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export function asset(path: string) { return `${basePath}${path}`; }
export const djangoApiEnabled = process.env.NEXT_PUBLIC_API_MODE === "django";
export function apiUrl(path: string) { return `${basePath}/api/${path.replace(/^\//, "")}`; }
