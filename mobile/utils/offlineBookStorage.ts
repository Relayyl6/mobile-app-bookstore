import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const BOOKS_DIR = `${FileSystem.documentDirectory}books/`;
const OFFLINE_INDEX_KEY = 'offlineBooksIndex';

const loadIndex = async (): Promise<Record<string, string>> => {
  const raw = await AsyncStorage.getItem(OFFLINE_INDEX_KEY);
  return raw ? JSON.parse(raw) : {};
};

export const saveBookOffline = async (bookId: string, chapterNumber: number, content: string) => {
  await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
  const fileKey = `${bookId}-${chapterNumber}`;
  const path = `${BOOKS_DIR}${fileKey}.txt`;

  await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });

  const index = await loadIndex();
  index[fileKey] = path;
  await AsyncStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(index));

  return path;
};

export const getOfflineBook = async (bookId: string, chapterNumber: number) => {
  const index = await loadIndex();
  const fileKey = `${bookId}-${chapterNumber}`;
  const path = index[fileKey];
  if (!path) return null;

  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return null;

  return FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.UTF8 });
};
