import { formatDistanceToNow, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import type { Participant } from "@/types/chat"

export function formatPresence(participant?: Participant) {
  if (!participant) return "Chưa có trạng thái"

  if (participant.isOnline) return "Đang hoạt động"

  if (!participant.lastActiveAt) return "Đang offline"

  return `Hoạt động ${formatDistanceToNow(parseISO(participant.lastActiveAt), {
    addSuffix: true,
    locale: vi,
  })}`
}
