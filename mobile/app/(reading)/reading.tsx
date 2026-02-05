// Example usage for ReadingPage
import ReadingPage from '@/components/ReadingPage';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

export const ReadingPageExample = () => {
    const router = useRouter()
  const chapterContent = [
    "The sun dipped below the horizon, casting long shadows across the valley. Elias stood at the edge of the cliff, the wind whipping his cloak around him like a frantic bird. The air smelled of ozone and damp earth—a storm was brewing in the west, one that promised more than just rain.",
    "He knew the journey ahead would be perilous, but the artifacts had to be returned to the Citadel before the lunar eclipse. Every step felt heavier than the last, yet his resolve remained unshaken. He adjusted the strap of his satchel, feeling the cold hum of the relics against his spine.",
    "A soft rustle in the undergrowth caught his attention. He reached for the hilt of his blade, eyes narrowing as he scanned the treeline. 'Who goes there?' he called out, his voice steady despite the hammering in his chest.",
    "Silence followed, thick and heavy. Then, a pair of golden eyes ignited in the darkness between the ancient oaks. Not a wolf, Elias realized. Something much older, and far more dangerous. He began to whisper the incantation his grandfather had taught him, the words tasting like copper on his tongue.",
    "The creature stepped forward, its fur shimmering like liquid silver under the rising moon. It wasn't here to hunt; it was waiting. 'Elias of the Eastern Gate,' it rumbled, a sound that vibrated more in his bones than his ears. 'The path you seek is closed to those who carry shadows in their hearts.'"
  ];

  return (
    <ReadingPage
      chapterNumber={1}
      chapterTitle="The Great Beginning"
      timeRemaining="12 mins remaining"
      content={chapterContent}
      onBack={() => router.back()}
      onSettings={() => console.log('Settings pressed')}
      onCast={() => console.log('Cast pressed')}
      onAnalyze={() => console.log('Analyze pressed')}
      onNotes={() => console.log('Notes pressed')}
      onSaved={() => console.log('Saved pressed')}
    />
  );
};

const Reading = () => {
    const params = useLocalSearchParams();
    const bookId = params?.page;
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ReadingPageExample />
    </View>
  );
};

export default Reading;