import BookDetails from '@/components/BookDetails';
import { useAppContext } from '@/context/useAppContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
// import ReadingPage from './ReadingPage';
// import BookDetails from './BookDetails';

// Example usage for BookDetails
export const BookDetailsExample = () => {
    const router = useRouter()
    const {bookId} = useAppContext()
  const characters = [
    {
      id: '1',
      name: 'Kaelen Voss',
      description: 'The protagonist, a stoic data-broker with a prosthetic memory core.',
      icon: '👤',
      iconColor: '#3B82F6',
    },
    {
      id: '2',
      name: 'Echo-7',
      description: 'A rogue AI entity that inhabits the city\'s neon infrastructure.',
      icon: '🤖',
      iconColor: '#8B5CF6',
    },
  ];

  return (
    <BookDetails
      coverImage={require('../../assets/book_cover.png')} // Replace with your actual image
      title="Neon Horizons"
      subtitle="The Cyberpunk Chronicles"
      author="Aris Thorne"
      authorColor="#3B82F6"
      price="$14.99"
      pages={412}
      rating={4.8}
      currentProgress={75}
      lastRead="2 days ago"
      genres={['Cyberpunk', 'Dystopian', 'Techno-thriller', 'Philosophical']}
      plotSummary="In the year 2084, New Aethelgard has become a sprawling megacity where identity is a fluid commodity. Kaelen, a data-broker with a fractured past, discovers a hidden protocol within the city's neural architecture that threatens to overwrite the collective consciousness. As he dives deeper into the digital abyss, he must decide between preserving the cold stability of the status quo or igniting a chaotic revolution of truth."
      characters={characters}
      theme="Existentialism"
      themeDescription="Exploring identity and consciousness"
      tone="Melancholic"
      toneDescription="Dark and introspective"
      pacing="Fast-paced"
      isbn="978-3-16-14"
      onBack={() => router.back()}
      onShare={() => console.log('Share pressed')}
      onMore={() => console.log('More pressed')}
      onReadNow={() => router.push(`/reading?page=${bookId}`)}
      onAIAnalysis={() => console.log('AI Analysis pressed')}
    />
  );
};

// Default Profile component
const Details = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <BookDetailsExample />
    </View>
  );
};

export default Details;