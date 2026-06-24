// The API origin used for direct connections (e.g. SignalR WebSocket hubs).
// Next.js rewrites only handle HTTP, not WebSockets, so SignalR hubs must
// connect directly to the backend instead of going through the Next.js proxy.
// In production, set NEXT_PUBLIC_API_ORIGIN to the deployed API URL.
export const apiOrigin =
  process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:5278";

export function hubUrl(path = "/chathub") {
  // Direct connection to local backend in development to avoid Next.js WebSocket proxy limits
  if (process.env.NODE_ENV === "development") {
    if (!apiOrigin || apiOrigin.includes("localhost:3000") || apiOrigin.startsWith("/") || apiOrigin.includes("127.0.0.1:3000")) {
      return `http://127.0.0.1:5278${path}`;
    }
    if (apiOrigin.includes("localhost:5278")) {
      return `http://127.0.0.1:5278${path}`;
    }
  }
  return `${apiOrigin}${path}`;
}
