import readStyles from '@/constants/read.styles';
import { useAppContext } from '@/context/useAppContext';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReadingPageProps {
  chapterNumber: number;
  chapterTitle: string;
  timeRemaining: string;
  content: string[];
  onBack?: () => void;
  onSettings?: () => void;
  onCast?: () => void;
  onAnalyze?: () => void;
  onNotes?: () => void;
  onSaved?: () => void;
}

const ReadingPage: React.FC<ReadingPageProps> = ({
  chapterNumber,
  chapterTitle,
  timeRemaining,
  content,
  onBack,
  onSettings,
  onCast,
  onAnalyze,
  onNotes,
  onSaved,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const { colors } = useAppContext()
  const styles = readStyles(colors)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.chapterNumber}>CHAPTER {chapterNumber}</Text>
          <Text style={styles.timeRemaining}>{timeRemaining}</Text>
        </View>
        
        <TouchableOpacity onPress={onSettings} style={styles.headerButton}>
          <Text style={styles.headerIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Reading Content */}
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Chapter Title */}
        <Text style={styles.chapterTitle}>{chapterTitle}</Text>
        
        {/* Content Paragraphs */}
        {content.map((paragraph, index) => (
          <Text key={index} style={styles.paragraph}>
            {index === 0 && (
              <Text style={styles.dropCap}>
                {paragraph.charAt(0)}
              </Text>
            )}
            {index === 0 ? paragraph.slice(1) : paragraph}
          </Text>
        ))}
      </ScrollView>

      {/* Action Menu */}
      <View style={styles.actionMenu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={onCast}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>👥</Text>
          </View>
          <Text style={styles.menuLabel}>CAST</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, styles.analyzeButton]}
          onPress={onAnalyze}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>✨</Text>
          </View>
          <Text style={[styles.menuLabel, styles.analyzeLabelText]}>Analyze</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={onNotes}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>📝</Text>
          </View>
          <Text style={styles.menuLabel}>NOTES</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={onSaved}
        >
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🔖</Text>
          </View>
          <Text style={styles.menuLabel}>SAVED</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Arrows */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navArrow}>
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.aiAssistantButton}>
          <Text style={styles.aiAssistantIcon}>✨</Text>
          <Text style={styles.aiAssistantText}>AI Assistant</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navArrow}>
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};



export default ReadingPage;