export const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN ?? ""

export function hubUrl(path = "/chathub") {
  return `${apiOrigin}${path}`
}
