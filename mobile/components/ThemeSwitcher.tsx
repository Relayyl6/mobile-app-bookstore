import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '@/context/useAppContext';
import { darkThemes, lightThemes } from '@/constants/theme';

const themes: ThemeType[] = [
  'forest',
  'retro',
  'ocean',
  'blossom',
  'cyberpunk',
  'homeColors',
  'profileColors',
  'libraryColors',
  'greenTheme',
  'purpleTheme',
  'sunsetTheme',
  'grayTheme',
  'cyberpunkTheme',
];

export const ThemeSwitcher: React.FC = () => {
  const { colors, themeMode, currentTheme, setCurrentTheme, toggleThemeMode } = useAppContext();
  const palette = themeMode === 'light' ? lightThemes : darkThemes

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      <TouchableOpacity
        style={[styles.modeToggle, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        onPress={toggleThemeMode}
      >
        <Text style={[styles.modeText, { color: colors.textPrimary }]}>
          {themeMode === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </Text>
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      >
        {themes.map((theme) => {
          const themeColors = palette[theme]

          return (
          <TouchableOpacity
            key={theme}
            onPress={() => setCurrentTheme(theme)}
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBackground,
                borderColor: currentTheme === theme ? colors.primary : 'transparent',
              },
            ]}
          >
            <View style={[styles.preview, { backgroundColor: themeColors.background }]}>
              <View style={[styles.previewBar, { backgroundColor: themeColors.primary }]} />
              <View style={[styles.previewCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} />
              <View style={[styles.previewText, { backgroundColor: themeColors.textSecondary }]} />
            </View>
            <Text style={[styles.themeName, { color: colors.textPrimary }]} numberOfLines={1}>
              {theme}
            </Text>
          </TouchableOpacity>
        )})}
      </ScrollView>

      <Text style={[styles.currentText, { color: colors.textSecondary }]}>Current: {currentTheme} ({themeMode})</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
  },
  modeToggle: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modeText: {
    fontWeight: '700',
  },
  carouselContent: {
    gap: 12,
    paddingRight: 8,
  },
  card: {
    width: 108,
    height: 128,
    borderRadius: 14,
    padding: 10,
    borderWidth: 2,
    justifyContent: 'space-between',
  },
  preview: {
    height: 70,
    borderRadius: 10,
    padding: 6,
    gap: 4,
  },
  previewBar: {
    height: 8,
    borderRadius: 4,
  },
  previewCard: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  previewText: {
    height: 6,
    width: '70%',
    borderRadius: 4,
    opacity: 0.7,
  },
  themeName: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  currentText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
