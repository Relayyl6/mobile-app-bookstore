// Example usage for ReadingPage
import ReadingPage from '@/components/ReadingPage';
import { useAppContext } from '@/context/useAppContext';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const Reading = () => {
  const params = useLocalSearchParams();
  const { bookId: contextBookId, setBookId } = useAppContext();
  const router = useRouter();
  const initialChapter = Number(params.chapter) || 1;
  const bookId = (params.bookId as string) || contextBookId;

  useEffect(() => {
    if (params.bookId) {
      setBookId(params.bookId as string);
    }
  }, [params.bookId]);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ReadingPage
        onBack={() => router.back()}
        onSettings={() => router.push('/profile')}
        initialChapter={initialChapter}
        bookId={bookId as string}
      />
    </View>
  );
};

export default Reading;
