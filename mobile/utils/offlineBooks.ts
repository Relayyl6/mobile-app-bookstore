import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'

const OFFLINE_KEY = 'offlineBooks'
const BOOKS_DIR = `${FileSystem.documentDirectory}books`

type OfflineBookMeta = {
  bookId: string
  chapterNumber: number
  path: string
  savedAt: string
}

const getStoredBooks = async (): Promise<OfflineBookMeta[]> => {
  const existing = await AsyncStorage.getItem(OFFLINE_KEY)
  return existing ? JSON.parse(existing) : []
}

export const saveBookOffline = async (
  bookId: string,
  chapterNumber: number,
  content: string
) => {
  await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true })

  const path = `${BOOKS_DIR}/${bookId}-chapter-${chapterNumber}.txt`
  await FileSystem.writeAsStringAsync(path, content)

  const books = await getStoredBooks()
  const filtered = books.filter(
    (entry) => !(entry.bookId === bookId && entry.chapterNumber === chapterNumber)
  )

  filtered.push({
    bookId,
    chapterNumber,
    path,
    savedAt: new Date().toISOString(),
  })

  await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered))
  return path
}

export const getOfflineBook = async (bookId: string, chapterNumber: number) => {
  const books = await getStoredBooks()
  const found = books.find(
    (entry) => entry.bookId === bookId && entry.chapterNumber === chapterNumber
  )

  if (!found) return null
  return FileSystem.readAsStringAsync(found.path)
}

export const isChapterDownloaded = async (bookId: string, chapterNumber: number) => {
  const books = await getStoredBooks()
  return books.some(
    (entry) => entry.bookId === bookId && entry.chapterNumber === chapterNumber
  )
}
