import detailStyles from '@/constants/details.style';
import { useAppContext } from '@/context/useAppContext';
import React from 'react';


import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
interface Character {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
}

interface BookDetailsProps {
  coverImage: any; // Image source
  title: string;
  subtitle: string;
  author: string;
  authorColor?: string;
  price: string;
  pages: number;
  rating: number;
  currentProgress: number;
  lastRead: string;
  genres: string[];
  plotSummary: string;
  characters: Character[];
  theme: string;
  themeDescription: string;
  tone: string;
  toneDescription: string;
  pacing: string;
  isbn: string;
  onBack?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  onReadNow?: () => void;
  onAIAnalysis?: () => void;
}

const BookDetails: React.FC<BookDetailsProps> = ({
  coverImage,
  title,
  subtitle,
  author,
  authorColor,
  price,
  pages,
  rating,
  currentProgress,
  lastRead,
  genres,
  plotSummary,
  characters,
  theme,
  themeDescription,
  tone,
  toneDescription,
  pacing,
  isbn,
  onBack,
  onShare,
  onMore,
  onReadNow,
  onAIAnalysis,
}) => {
  const { colors } = useAppContext()
  const styles = detailStyles(colors)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.cardBackground} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Book Details</Text>
          
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={onShare} style={styles.headerButton}>
              <Text style={styles.headerIcon}>↗</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onMore} style={styles.headerButton}>
              <Text style={styles.headerIcon}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Book Cover and Info */}
        <View style={styles.bookSection}>
          <View style={styles.coverContainer}>
            <Image 
              source={coverImage} 
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.bookTitle}>{title}</Text>
          <Text style={styles.bookSubtitle}>{subtitle}</Text>
          <Text style={[styles.bookAuthor, { color: authorColor }]}>
            by {author}
          </Text>

          {/* Book Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PRICE</Text>
              <Text style={styles.statValue}>{price}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PAGES</Text>
              <Text style={styles.statValue}>{pages}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>RATING</Text>
              <Text style={styles.statValue}>{rating}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Current Progress</Text>
              <Text style={styles.progressPercent}>{currentProgress}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${currentProgress}%` }]} />
            </View>
            <Text style={styles.lastRead}>Last read: {lastRead}</Text>
          </View>

          {/* Read Now Button */}
          <TouchableOpacity 
            style={styles.readNowButton}
            onPress={onReadNow}
          >
            <Text style={styles.readNowIcon}>📖</Text>
            <Text style={styles.readNowText}>Read Now</Text>
          </TouchableOpacity>
        </View>

        {/* Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GENRES</Text>
          <View style={styles.genresContainer}>
            {genres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plot Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Plot Summary</Text>
            <TouchableOpacity onPress={onAIAnalysis}>
              <Text style={styles.aiAnalysisLink}>AI Analysis</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.plotText}>{plotSummary}</Text>
        </View>

        {/* AI Character Guide */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Character Guide</Text>
            <Text style={styles.starIcon}>⭐</Text>
          </View>
          <View style={styles.charactersContainer}>
            {characters.map((character) => (
              <View key={character.id} style={styles.characterCard}>
                <View style={[styles.characterIcon, { backgroundColor: character.iconColor }]}>
                  <Text style={styles.characterIconText}>{character.icon}</Text>
                </View>
                <View style={styles.characterInfo}>
                  <Text style={styles.characterName}>{character.name}</Text>
                  <Text style={styles.characterDescription}>{character.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Themes & Tone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Themes & Tone</Text>
          <View style={styles.themesGrid}>
            <View style={styles.themeCard}>
              <Text style={styles.themeIcon}>💭</Text>
              <View>
                <Text style={styles.themeLabel}>THEME</Text>
                <Text style={styles.themeValue}>{theme}</Text>
              </View>
            </View>
            <View style={styles.themeCard}>
              <Text style={styles.themeIcon}>🎭</Text>
              <View>
                <Text style={styles.themeLabel}>TONE</Text>
                <Text style={styles.themeValue}>{tone}</Text>
              </View>
            </View>
            <View style={styles.themeCard}>
              <Text style={styles.themeIcon}>⚡</Text>
              <View>
                <Text style={styles.themeLabel}>PACING</Text>
                <Text style={styles.themeValue}>{pacing}</Text>
              </View>
            </View>
            <View style={styles.themeCard}>
              <Text style={styles.themeIcon}>📚</Text>
              <View>
                <Text style={styles.themeLabel}>ISBN</Text>
                <Text style={styles.themeValue}>{isbn}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookDetails;