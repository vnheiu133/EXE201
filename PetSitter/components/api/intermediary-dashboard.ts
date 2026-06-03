import type { IntermediaryDashboardData } from "@/types/intermediary-dashboard"

export async function getIntermediaryDashboard(): Promise<IntermediaryDashboardData> {
  const response = await fetch("/api/intermediary/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Không tải được bảng điều khiển trung gian")
  }

  return response.json()
}
