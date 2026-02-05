// import { View, Text } from 'react-native'
// import React from 'react'
// import { ThemeSwitcher } from '@/components/ThemeSwitcher'

// const Profile = () => {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center' }}>
//       <ThemeSwitcher/>
//     </View>
//   )
// }

// export default Profile


import BookDetails from '@/components/BookDetails';
import ReadingPage from '@/components/ReadingPage';
import React from 'react';
import { View } from 'react-native';
// import ReadingPage from './ReadingPage';
// import BookDetails from './BookDetails';

// Example usage for ReadingPage
export const ReadingPageExample = () => {
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
      onBack={() => console.log('Back pressed')}
      onSettings={() => console.log('Settings pressed')}
      onCast={() => console.log('Cast pressed')}
      onAnalyze={() => console.log('Analyze pressed')}
      onNotes={() => console.log('Notes pressed')}
      onSaved={() => console.log('Saved pressed')}
    />
  );
};

// Example usage for BookDetails
export const BookDetailsExample = () => {
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
      onBack={() => console.log('Back pressed')}
      onShare={() => console.log('Share pressed')}
      onMore={() => console.log('More pressed')}
      onReadNow={() => console.log('Read Now pressed')}
      onAIAnalysis={() => console.log('AI Analysis pressed')}
    />
  );
};

// Default Profile component
const Profile = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ReadingPageExample />
    </View>
  );
};

export default Profile;