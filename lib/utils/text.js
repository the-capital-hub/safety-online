export const countWords = (text = "") => {
  if (!text) {
    return 0
  }

  const matches = text.trim().match(/\S+/g)
  return matches ? matches.length : 0
}

export const clampWords = (text = "", maxWords) => {
  if (!text) {
    return ""
  }

  if (!maxWords || maxWords <= 0) {
    return ""
  }

  const matches = Array.from(text.matchAll(/\S+/g))

  if (matches.length <= maxWords) {
    return text
  }

  const limitedMatch = matches[maxWords - 1]

  if (!limitedMatch) {
    return ""
  }

  const endIndex = (limitedMatch.index ?? 0) + limitedMatch[0].length

  return text.slice(0, endIndex).trimEnd()
}

export const isWithinWordLimit = (text = "", maxWords) => {
  if (!maxWords || maxWords <= 0) {
    return true
  }

  return countWords(text) <= maxWords
}
