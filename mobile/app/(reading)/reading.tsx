// Example usage for ReadingPage
import ReadingPage from '@/components/ReadingPage';
import { useAppContext } from '@/context/useAppContext';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// import { DEFAULT_READER_SETTINGS, ReaderSettings } from '@/components/ThemeSettingsModal';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingPageSkeleton } from '@/components/SkeletonLoaders';
import { DEFAULT_READER_SETTINGS } from '@/components/ThemeSettingsModal';
import { ReaderSettings } from '@/utils/font';



const Reading = () => {
  const params = useLocalSearchParams();
  const { bookId: contextBookId, setBookId } = useAppContext();
  const router = useRouter();
  const initialChapter = Number(params.chapter) || 1;
  const bookId = (params.bookId as string) || contextBookId;
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.setItem('readerSettings', JSON.stringify(readerSettings));
  }, [readerSettings]);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem('readerSettings');
        if (saved && saved !== "undefined") {
          setReaderSettings(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
      } finally {
        setReady(true);
      }
    };

    load();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [readerSettings.theme]);

  useEffect(() => {
    if (params.bookId) {
      setBookId(params.bookId as string);
    }
  }, [params.bookId]);

  return (
    <View style={{ flex: 1 }}>
      {
        !ready ? (
          <ReadingPageSkeleton />
        ) : (
          <Animated.View style={{ flex: 1, justifyContent: 'center', opacity: fadeAnim }}>
            <ReadingPage
              onBack={() => router.back()}
              onSettings={() => router.push('/profile')}
              initialChapter={initialChapter}
              bookId={bookId as string}
              readerSettings={readerSettings}
              setReaderSettings={setReaderSettings}
            />
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#000',
                opacity: ((100 - readerSettings.brightness) / 100) * 0.6,
              }}
            />
          </Animated.View>
        )
      }
    </View>
  );
};

export default Reading;
