import React from 'react';
import { View, TouchableOpacity, Text, ScrollView, StyleSheet } from 'react-native';
import { useAppContext } from '@/context/useAppContext';

const themes: ThemeType[] = ['forest', 'retro', 'ocean', 'blossom'];

export const ThemeSwitcher: React.FC = () => {
  const { colors, themeMode, currentTheme, setCurrentTheme, toggleThemeMode } = useAppContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Theme Mode Toggle */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Theme Mode</Text>
        <TouchableOpacity
          style={[
            styles.modeButton,
            { 
              backgroundColor: colors.primary,
              borderColor: colors.border,
            }
          ]}
          onPress={toggleThemeMode}
        >
          <Text style={[styles.modeButtonText, { color: colors.white }]}>
            {themeMode === 'light' ? '☀️ Light' : '🌙 Dark'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Theme Selector */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Color Theme</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.themeScroll}
        >
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme}
              style={[
                styles.themeButton,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: currentTheme === theme ? colors.primary : colors.border,
                  borderWidth: currentTheme === theme ? 3 : 1,
                },
              ]}
              onPress={() => setCurrentTheme(theme)}
            >
              <Text style={[styles.themeButtonText, { color: colors.textPrimary }]}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Text>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: colors.primary },
                ]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Current Theme Info */}
      <View
        style={[
          styles.infoBox,
          { 
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          }
        ]}
      >
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Current Theme</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
          {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} ({themeMode})
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  themeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    gap: 8,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
});
