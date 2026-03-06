// utils/seedDataSimple.ts - SIMPLIFIED VERSION FOR TESTING
import { api } from '@/components/ApiHandler'
import { useState } from 'react'
import { Alert } from 'react-native'

/* ======================================================
   TYPES
====================================================== */

interface SeedBook {
  title: string
  subTitle?: string
  author: string
  caption: string
  description: string
  genres: string[]
  image: string
  price: number
  rating: number
  publishedYear: number
  isbn?: string
}

/* ======================================================
   SEED BOOKS DATA (Without image URLs)
====================================================== */

const SEED_BOOKS: SeedBook[] = [
  {
    title: 'The Midnight Library',
    subTitle: 'A Novel',
    author: 'Matt Haig',
    caption: 'A profound exploration of choices, regrets, and infinite possibilities.',
    description:
      'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    genres: ['Fiction', 'Fantasy', 'Philosophy', 'Contemporary'],
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    price: 14.99,
    rating: 5,
    publishedYear: 2020,
    isbn: '978-0-525-55948-1',
  },
  {
    title: 'Project Hail Mary',
    subTitle: 'A Novel',
    author: 'Andy Weir',
    caption: 'A thrilling space adventure with humor, heart, and hard science.',
    description:
      'Ryland Grace wakes up on a spaceship with no idea how he got there. His crewmates are dead. He has no memory. But he has a mission: save humanity from extinction.',
    genres: ['Science Fiction', 'Thriller', 'Adventure', 'Space Opera'],
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    price: 16.99,
    rating: 5,
    publishedYear: 2021,
    isbn: '978-0-593-13520-1',
  },
  {
    title: 'Atomic Habits',
    subTitle: 'An Easy & Proven Way to Build Good Habits',
    author: 'James Clear',
    caption: 'Transform your life one tiny change at a time.',
    description:
      'A revolutionary system to get 1% better every day. Learn how tiny changes can lead to remarkable results.',
    genres: ['Self-Help', 'Psychology', 'Productivity', 'Non-Fiction'],
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
    price: 18.99,
    rating: 5,
    publishedYear: 2018,
    isbn: '978-0-7352-1129-2',
  },
  {
    title: 'The Alchemist',
    subTitle: 'A Fable About Following Your Dream',
    author: 'Paulo Coelho',
    caption: 'A timeless tale about following your dreams and listening to your heart.',
    description:
      'The story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.',
    genres: ['Fiction', 'Philosophy', 'Adventure', 'Spiritual'],
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
    price: 12.99,
    rating: 5,
    publishedYear: 1988,
    isbn: '978-0-06-112241-5',
  },
  {
    title: 'Educated',
    subTitle: 'A Memoir',
    author: 'Tara Westover',
    caption: 'A stunning memoir about the transformative power of education.',
    description:
      'Born to survivalists in the mountains of Idaho, Tara Westover was seventeen the first time she set foot in a classroom.',
    genres: ['Biography', 'Memoir', 'Non-Fiction', 'Inspirational'],
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    price: 15.99,
    rating: 5,
    publishedYear: 2018,
    isbn: '978-0-399-59050-4',
  },
]

/* ======================================================
   SEEDING FUNCTIONS (WITHOUT IMAGES)
====================================================== */

/**
 * Seed a single book into the system (without image)
 */
async function seedSingleBook(book: SeedBook): Promise<boolean> {
  try {
    console.log(`📚 Seeding: ${book.title}`)

    const bookData = {
      title: book.title,
      subTitle: book.subTitle || '',
      author: book.author,
      caption: book.caption,
      description: book.description,
      genres: book.genres,
      // No image - let the backend use a default
      price: book.price,
      isbn: book.isbn || '',
      publishedYear: book.publishedYear,
    }

    console.log(`📤 Creating book in API...`)

    // Create the book
    const createRes = await api.createBook(bookData)

    console.log(`📥 Response:`, createRes)

    if (!createRes.success) {
      console.error(`❌ API Error:`, createRes.error || createRes.message)
      return false
    }

    //@ts-ignore
    const bookId =
      createRes.data?.fullBook?._id ||
      createRes.data?._id ||
      createRes.data?.book?._id

    if (!bookId) {
      console.error(`❌ No book ID in response`)
      console.error(`Response data:`, JSON.stringify(createRes.data))
      return false
    }

    console.log(`✅ Book created with ID: ${bookId}`)

    // Add rating
    try {
      await api.addOrUpdateRating({
        bookId,
        rating: book.rating,
        review: book.caption,
      })
      console.log(`⭐ Rating added`)
    } catch (ratingError) {
      console.warn(`⚠️  Rating failed but book created`)
    }

    console.log(`✅ Successfully seeded: ${book.title}`)
    return true
  } catch (error: any) {
    console.error(`❌ Error seeding ${book.title}:`)
    console.error(`   Message: ${error.message}`)
    if (error.response) {
      console.error(`   Response:`, error.response)
    }
    return false
  }
}

/**
 * Seed all books
 */
export async function seedAllBooks(
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number }> {
  console.log('🌱 Starting data seeding...')

  let successCount = 0
  let failedCount = 0

  for (let i = 0; i < SEED_BOOKS.length; i++) {
    const book = SEED_BOOKS[i]
    const success = await seedSingleBook(book)

    if (success) {
      successCount++
    } else {
      failedCount++
    }

    if (onProgress) {
      onProgress(i + 1, SEED_BOOKS.length)
    }

    // Delay between books
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  console.log('🎉 Seeding complete!')
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failedCount}`)

  return { success: successCount, failed: failedCount }
}

/**
 * Seed random books
 */
export async function seedRandomBooks(
  count: number,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number }> {
  const shuffled = [...SEED_BOOKS].sort(() => Math.random() - 0.5)
  const booksToSeed = shuffled.slice(0, Math.min(count, SEED_BOOKS.length))

  console.log(`🌱 Seeding ${booksToSeed.length} random books...`)

  let successCount = 0
  let failedCount = 0

  for (let i = 0; i < booksToSeed.length; i++) {
    const book = booksToSeed[i]
    const success = await seedSingleBook(book)

    if (success) {
      successCount++
    } else {
      failedCount++
    }

    if (onProgress) {
      onProgress(i + 1, booksToSeed.length)
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  return { success: successCount, failed: failedCount }
}

/**
 * Get stats
 */
export function getSeedingStats() {
  return {
    totalBooks: SEED_BOOKS.length,
    genres: [...new Set(SEED_BOOKS.flatMap((b) => b.genres))],
    authors: [...new Set(SEED_BOOKS.map((b) => b.author))],
    averageRating:
      SEED_BOOKS.reduce((sum, b) => sum + b.rating, 0) / SEED_BOOKS.length,
  }
}

/**
 * Hook for React
 */
export function useSeedData() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [result, setResult] = useState<{
    success: number
    failed: number
    total: number
  } | null>(null)

  const seedAll = async () => {
    setIsSeeding(true)
    setProgress({ current: 0, total: SEED_BOOKS.length })
    setResult(null)

    const { success, failed } = await seedAllBooks((current, total) => {
      setProgress({ current, total })
    })

    setResult({ success, failed, total: SEED_BOOKS.length })
    setIsSeeding(false)

    Alert.alert(
      'Seeding Complete',
      `Successfully added ${success} books.\nFailed: ${failed}`,
      [{ text: 'OK' }]
    )
  }

  const seedRandom = async (count: number) => {
    setIsSeeding(true)
    setProgress({ current: 0, total: count })
    setResult(null)

    const { success, failed } = await seedRandomBooks(count, (current, total) => {
      setProgress({ current, total })
    })

    setResult({ success, failed, total: count })
    setIsSeeding(false)

    Alert.alert(
      'Seeding Complete',
      `Successfully added ${success} books.\nFailed: ${failed}`,
      [{ text: 'OK' }]
    )
  }

  return {
    seedAll,
    seedRandom,
    isSeeding,
    progress,
    result,
    stats: getSeedingStats(),
  }
}

export { SEED_BOOKS }
export type { SeedBook }