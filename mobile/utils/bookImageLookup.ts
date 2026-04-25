const sanitize = (value: string) => encodeURIComponent(value.trim())

// Reliable fallback chain - no Unsplash source API
const buildFallback = (title: string, author?: string) => {
  const query = sanitize(`${title} ${author || ''}`)
  // Google Books is free, no API key needed for basic search
  return `https://books.google.com/books/content?vid=ISBN&printsec=frontcover&img=1&zoom=1&source=gbs_api`
}

export const resolveBookImage = async (title: string, author?: string): Promise<string | null> => {
  if (!title.trim()) return null

  try {
    const query = sanitize(`${title} ${author || ''}`)

    // 1. Try Open Library by title+author
    const openLibraryRes = await fetch(
      `https://openlibrary.org/search.json?title=${query}&limit=5`
    )
    if (openLibraryRes.ok) {
      const data = await openLibraryRes.json()
      const firstWithCover = data?.docs?.find((doc: any) => doc?.cover_i)
      if (firstWithCover?.cover_i) {
        return `https://covers.openlibrary.org/b/id/${firstWithCover.cover_i}-L.jpg`
      }
    }

    // 2. Try Google Books API (free, no key needed for basic search)
    const googleRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`
    )
    if (googleRes.ok) {
      const googleData = await googleRes.json()
      const firstWithImage = googleData?.items?.find(
        (item: any) => item?.volumeInfo?.imageLinks?.thumbnail
      )
      if (firstWithImage) {
        // Upgrade to higher resolution and force HTTPS
        const thumbnail = firstWithImage.volumeInfo.imageLinks.thumbnail
        return thumbnail
          .replace('http://', 'https://')
          .replace('zoom=1', 'zoom=3')  // zoom=3 gives ~400px width
      }
    }

    // 3. Last resort — generic placeholder (always works)
    return `https://placehold.co/600x900/e8d5b7/8b6f47?text=${sanitize(title)}`

  } catch {
    return `https://placehold.co/600x900/e8d5b7/8b6f47?text=${sanitize(title)}`
  }
}