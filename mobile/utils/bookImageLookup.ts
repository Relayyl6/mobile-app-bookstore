const sanitize = (value: string) => encodeURIComponent(value.trim())

const buildFallback = (title: string, author?: string) => {
  const query = sanitize(`${title} ${author || ''}`)
  return `https://source.unsplash.com/featured/600x900/?${query},book,cover`
}

export const resolveBookImage = async (title: string, author?: string): Promise<string | null> => {
  if (!title.trim()) return null

  try {
    const query = sanitize(`${title} ${author || ''}`)
    const openLibraryRes = await fetch(`https://openlibrary.org/search.json?title=${query}&limit=5`)

    if (openLibraryRes.ok) {
      const data = await openLibraryRes.json()
      const firstWithCover = data?.docs?.find((doc: any) => doc?.cover_i)
      if (firstWithCover?.cover_i) {
        return `https://covers.openlibrary.org/b/id/${firstWithCover.cover_i}-L.jpg`
      }
    }

    return buildFallback(title, author)
  } catch {
    return buildFallback(title, author)
  }
}
