// Example usage for ReadingPage
import ReadingPage from '@/components/ReadingPage';
import { useAppContext } from '@/context/useAppContext';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

const Reading = () => {
    const params = useLocalSearchParams();
    const { colors, bookId: contextBookId, setBookId } = useAppContext();
    const router = useRouter()
    const initialChapter = Number(params.chapter) || 1;
    const bookId = (params.bookId as string) || contextBookId

    useEffect(() => {
      if (params.bookId) {
        setBookId(params.bookId as string)
      }
    }, [params.bookId])
    
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ReadingPage
        onBack={() => router.back()}
        onSettings={() => console.log('Settings pressed')}
        onCast={() => console.log('Cast pressed')}
        onAnalyze={() => console.log('Analyze pressed')}
        onNotes={() => console.log('Notes pressed')}
        onSaved={() => console.log('Saved pressed')}
        initialChapter={initialChapter}
        bookId={bookId as string}
      />
    </View>
  );
};

export default Reading;