export const DEFAULT_USER_AVATAR = "/placeholder-user.jpg";
export const DEFAULT_SHOP_AVATAR = "/placeholder-logo.png";

export function getAvatarUrl(url?: string | null, fallback = DEFAULT_USER_AVATAR) {
  if (!url) return fallback;

  const value = url.trim();
  if (!value || value.toLowerCase() === "null" || value === "/placeholder.svg") {
    return fallback;
  }

  return value;
}
