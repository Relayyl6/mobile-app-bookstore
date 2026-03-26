import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const OFFLINE_KEY = 'offlineBooks';
const BOOK_FOLDER = `${FileSystem.documentDirectory}books/`;

type OfflineBookEntry = {
  bookId: string;
  chapterNumber: number;
  path: string;
  savedAt: string;
};

const readIndex = async (): Promise<OfflineBookEntry[]> => {
  const raw = await AsyncStorage.getItem(OFFLINE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveChapterOffline = async (
  bookId: string,
  chapterNumber: number,
  content: string
) => {
  await FileSystem.makeDirectoryAsync(BOOK_FOLDER, { intermediates: true });
  const path = `${BOOK_FOLDER}${bookId}-chapter-${chapterNumber}.txt`;

  await FileSystem.writeAsStringAsync(path, content);

  const index = await readIndex();
  const withoutCurrent = index.filter(
    (item) => !(item.bookId === bookId && item.chapterNumber === chapterNumber)
  );

  const updated = [
    {
      bookId,
      chapterNumber,
      path,
      savedAt: new Date().toISOString(),
    },
    ...withoutCurrent,
  ];

  await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(updated));
  return path;
};

export const getOfflineChapter = async (bookId: string, chapterNumber: number) => {
  const index = await readIndex();
  const found = index.find(
    (item) => item.bookId === bookId && item.chapterNumber === chapterNumber
  );

  if (!found) return null;
  return FileSystem.readAsStringAsync(found.path);
};

export const isChapterOffline = async (bookId: string, chapterNumber: number) => {
  const index = await readIndex();
  return index.some(
    (item) => item.bookId === bookId && item.chapterNumber === chapterNumber
  );
};
