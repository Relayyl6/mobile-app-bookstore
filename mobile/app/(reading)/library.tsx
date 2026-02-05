import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  TextInput,
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/context/useAppContext';
import libraryStyles from '@/constants/library.style';

const LibraryScreen = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); 
  const { colors } = useAppContext()
  const styles = libraryStyles(colors)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="book-open-variant" size={28} color={colors.primary} />
          <Text style={styles.headerTitle}>Library</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="sliders" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search title, author, or genre"
            placeholderTextColor={colors.placeholderText}
          />
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Feather name="grid" size={18} color={viewMode === 'grid' ? colors.white : colors.textSecondary} />
            <Text style={[styles.toggleText, viewMode === 'grid' && styles.toggleTextActive]}>
              Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Feather name="list" size={18} color={viewMode === 'list' ? colors.white : colors.textSecondary} />
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Recommended for You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>

          <View style={styles.recommendedGrid}>
            <View style={styles.recommendedCard}>
              <View style={styles.recommendedCover}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300' }}
                  style={styles.coverImage}
                />
                <View style={styles.aiSummaryBadge}>
                  <Feather name="zap" size={12} color={colors.white} />
                  <Text style={styles.aiSummaryText}>AI Summary</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>The Midnight...</Text>
              <Text style={styles.cardAuthor}>Matt Haig</Text>
              <View style={styles.cardFooter}>
                <View style={styles.rating}>
                  <Feather name="star" size={14} color="#ffa500" fill="#ffa500" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
                <Text style={styles.genre}>Fiction</Text>
              </View>
            </View>

            <View style={styles.recommendedCard}>
              <View style={styles.recommendedCover}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?w=300' }}
                  style={styles.coverImage}
                />
                <View style={styles.aiSummaryBadge}>
                  <Feather name="zap" size={12} color={colors.white} />
                  <Text style={styles.aiSummaryText}>AI Summary</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Project Hail Mary</Text>
              <Text style={styles.cardAuthor}>Andy Weir</Text>
              <View style={styles.cardFooter}>
                <View style={styles.rating}>
                  <Feather name="star" size={14} color="#ffa500" fill="#ffa500" />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
                <Text style={styles.genre}>Sci-Fi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* New Arrivals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitlePlain}>New Arrivals</Text>

          <View style={styles.listItem}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=200' }}
              style={styles.listCover}
            />
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>Klara and the Sun</Text>
              <Text style={styles.listAuthor}>Kazuo Ishiguro</Text>
              <View style={styles.listFooter}>
                <View style={styles.aiSummaryBadgeSmall}>
                  <Text style={styles.aiSummaryTextSmall}>AI Summary</Text>
                </View>
                <Text style={styles.listPages}>240 pages</Text>
                <View style={styles.rating}>
                  <Feather name="star" size={14} color="#ffa500" fill="#ffa500" />
                  <Text style={styles.ratingText}>4.5</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Feather name="more-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.listItem}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200' }}
              style={styles.listCover}
            />
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>The Alchemist</Text>
              <Text style={styles.listAuthor}>Paulo Coelho</Text>
              <View style={styles.listFooter}>
                <View style={styles.aiSummaryBadgeSmall}>
                  <Text style={styles.aiSummaryTextSmall}>AI Summary</Text>
                </View>
                <Text style={styles.listPages}>163 pages</Text>
                <View style={styles.rating}>
                  <Feather name="star" size={14} color="#ffa500" fill="#ffa500" />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Feather name="more-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.listItem}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200' }}
              style={styles.listCover}
            />
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>1984</Text>
              <Text style={styles.listAuthor}>George Orwell</Text>
              <View style={styles.listFooter}>
                <View style={styles.aiSummaryBadgeSmall}>
                  <Text style={styles.aiSummaryTextSmall}>AI Summary</Text>
                </View>
                <Text style={styles.listPages}>328 pages</Text>
                <View style={styles.rating}>
                  <Feather name="star" size={14} color="#ffa500" fill="#ffa500" />
                  <Text style={styles.ratingText}>4.7</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Feather name="more-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating AI Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <MaterialCommunityIcons name="robot" size={24} color={colors.white} />
        <Text style={styles.floatingButtonText}>Ask AI for a Book</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="compass" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>EXPLORE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="book" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>MY BOOKS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="chart-box" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>STATS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={24} color={colors.textSecondary} />
          <Text style={styles.navLabel}>PROFILE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LibraryScreen;