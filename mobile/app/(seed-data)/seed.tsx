import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppContext } from '@/context/useAppContext'
import { useSeedData } from '@/components/SeedData'
import { useRouter } from 'expo-router'

const SeedDataScreen = () => {
  const { colors } = useAppContext()
  const router = useRouter()
  const { seedAll, seedRandom, seedByGenre, isSeeding, progress, result, stats } =
    useSeedData()

  const styles = createStyles(colors)

  const handleSeedAll = () => {
    Alert.alert(
      'Seed All Books',
      `This will add ${stats.totalBooks} books to your library. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: seedAll },
      ]
    )
  }

  const handleSeedRandom = (count: number) => {
    Alert.alert(
      'Seed Random Books',
      `This will add ${count} random books to your library. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => seedRandom(count) },
      ]
    )
  }

  const handleSeedByGenre = (genre: string) => {
    Alert.alert(
      `Seed ${genre} Books`,
      `This will add all ${genre} books to your library. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => seedByGenre(genre) },
      ]
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Seed Demo Data</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="stats-chart" size={24} color={colors.primary} />
          <Text style={styles.cardTitle}>Available Data</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalBooks}</Text>
            <Text style={styles.statLabel}>Books</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.authors.length}</Text>
            <Text style={styles.statLabel}>Authors</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.genres.length}</Text>
            <Text style={styles.statLabel}>Genres</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </View>

      {/* Progress Card */}
      {isSeeding && (
        <View style={styles.card}>
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.progressText}>
              Seeding {progress.current} of {progress.total}...
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(progress.current / progress.total) * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressSubtext}>
              This may take a few minutes. Please don't close the app.
            </Text>
          </View>
        </View>
      )}

      {/* Result Card */}
      {result && !isSeeding && (
        <View style={styles.card}>
          <View style={styles.resultContainer}>
            <Ionicons
              name={result.failed === 0 ? 'checkmark-circle' : 'warning'}
              size={48}
              color={result.failed === 0 ? '#4CAF50' : '#FF9800'}
            />
            <Text style={styles.resultTitle}>Seeding Complete!</Text>
            <View style={styles.resultStats}>
              <Text style={styles.resultText}>✅ Success: {result.success}</Text>
              {result.failed > 0 && (
                <Text style={styles.resultText}>❌ Failed: {result.failed}</Text>
              )}
              <Text style={styles.resultText}>📚 Total: {result.total}</Text>
            </View>
            <TouchableOpacity
              style={styles.viewLibraryButton}
              onPress={() => router.push('/(tabs)/books')}
            >
              <Text style={styles.viewLibraryText}>View Library</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={[styles.actionButton, isSeeding && styles.buttonDisabled]}
          onPress={handleSeedAll}
          disabled={isSeeding}
        >
          <Ionicons name="cloud-download" size={24} color={colors.white} />
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Seed All Books</Text>
            <Text style={styles.actionButtonSubtitle}>
              Add all {stats.totalBooks} books
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, isSeeding && styles.buttonDisabled]}
          onPress={() => handleSeedRandom(5)}
          disabled={isSeeding}
        >
          <Ionicons name="shuffle" size={24} color={colors.white} />
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Seed 5 Random Books</Text>
            <Text style={styles.actionButtonSubtitle}>Quick starter library</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, isSeeding && styles.buttonDisabled]}
          onPress={() => handleSeedRandom(10)}
          disabled={isSeeding}
        >
          <Ionicons name="albums" size={24} color={colors.white} />
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Seed 10 Random Books</Text>
            <Text style={styles.actionButtonSubtitle}>
              Medium-sized collection
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Seed by Genre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seed by Genre</Text>
        <View style={styles.genreGrid}>
          {['Fiction', 'Science Fiction', 'Non-Fiction', 'Fantasy', 'Psychology'].map(
            (genre) => (
              <TouchableOpacity
                key={genre}
                style={[styles.genreButton, isSeeding && styles.buttonDisabled]}
                onPress={() => handleSeedByGenre(genre)}
                disabled={isSeeding}
              >
                <Text style={styles.genreButtonText}>{genre}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* Warning */}
      <View style={styles.warningCard}>
        <Ionicons name="warning" size={20} color="#FF9800" />
        <Text style={styles.warningText}>
          Seeding will create new books in your database. Each book takes about 1-2
          seconds to process.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      gap: 12,
      marginTop: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
      flex: 1,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    progressContainer: {
      alignItems: 'center',
      gap: 12,
    },
    progressText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    progressSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    progressBar: {
      width: '100%',
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    resultContainer: {
      alignItems: 'center',
      gap: 12,
    },
    resultTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    resultStats: {
      gap: 8,
      alignItems: 'center',
    },
    resultText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    viewLibraryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    viewLibraryText: {
      color: colors.white,
      fontWeight: '600',
      fontSize: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      gap: 16,
    },
    actionButtonContent: {
      flex: 1,
    },
    actionButtonTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
      marginBottom: 4,
    },
    actionButtonSubtitle: {
      fontSize: 14,
      color: colors.white,
      opacity: 0.8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    genreGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    genreButton: {
      backgroundColor: colors.cardBackground,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    genreButtonText: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    warningCard: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: '#FF9800',
      alignItems: 'center',
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      color: colors.textSecondary,
    },
  })

export default SeedDataScreen