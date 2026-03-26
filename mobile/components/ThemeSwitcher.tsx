import React from 'react'
import { View, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native'
import { useAppContext } from '@/context/useAppContext'

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
]

export const ThemeSwitcher: React.FC = () => {
  const { colors, themeMode, currentTheme, setCurrentTheme, toggleThemeMode } = useAppContext()

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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
        {themes.map((theme) => {
          const selected = currentTheme === theme
          return (
            <TouchableOpacity
              key={theme}
              onPress={() => setCurrentTheme(theme)}
              style={[
                styles.themeCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={[styles.preview, { backgroundColor: colors.primary }]} />
              <Text style={[styles.cardText, { color: colors.textPrimary }]}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Text>
              {selected ? <Text style={[styles.selectedText, { color: colors.primary }]}>Selected</Text> : null}
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <Text style={[styles.currentText, { color: colors.textSecondary }]}>Current: {currentTheme} ({themeMode})</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    gap: 16,
  },
  modeToggle: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  carouselContent: {
    paddingRight: 16,
    gap: 12,
  },
  themeCard: {
    width: 120,
    borderRadius: 12,
    borderWidth: 2,
    padding: 10,
    justifyContent: 'space-between',
    minHeight: 128,
  },
  preview: {
    height: 62,
    borderRadius: 8,
  },
  cardText: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  currentText: {
    fontSize: 13,
  },
})
