import type { IntermediaryDashboardData } from "@/types/intermediary-dashboard"

export async function getIntermediaryDashboard(): Promise<IntermediaryDashboardData> {
  const response = await fetch("http://localhost:5278/api/intermediary/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch intermediary dashboard")
  }

  return response.json()
}
