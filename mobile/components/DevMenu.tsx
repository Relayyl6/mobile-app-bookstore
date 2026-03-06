// components/DeveloperMenu.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppContext } from '@/context/useAppContext'
import { useRouter } from 'expo-router'
import { seedAllBooks, seedRandomBooks, getSeedingStats } from '@/components/SeedData'

interface DeveloperMenuProps {
  visible: boolean
  onClose: () => void
}

const DeveloperMenu: React.FC<DeveloperMenuProps> = ({ visible, onClose }) => {
  const { colors } = useAppContext()
  const router = useRouter()
  const [isSeeding, setIsSeeding] = useState(false)
  const styles = createStyles(colors)
  const stats = getSeedingStats()

  const handleQuickSeed = async (count: number) => {
    setIsSeeding(true)
    try {
      const result = await seedRandomBooks(count)
      Alert.alert(
        'Seeding Complete',
        `Added ${result.success} books successfully!`,
        [{ text: 'OK', onPress: onClose }]
      )
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setIsSeeding(false)
    }
  }

  const handleSeedAll = async () => {
    Alert.alert(
      'Seed All Books',
      `This will add ${stats.totalBooks} books. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setIsSeeding(true)
            try {
              const result = await seedAllBooks()
              Alert.alert(
                'Complete',
                `Added ${result.success} books!`,
                [{ text: 'OK', onPress: onClose }]
              )
            } finally {
              setIsSeeding(false)
            }
          },
        },
      ]
    )
  }

  const handleOpenSeedScreen = () => {
    onClose()
    router.push('/(seed-data)/seed')
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.menu}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="code-slash" size={24} color={colors.primary} />
              <Text style={styles.title}>Developer Menu</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Seeding Statistics</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Books:</Text>
                <Text style={styles.infoValue}>{stats.totalBooks}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Unique Authors:</Text>
                <Text style={styles.infoValue}>{stats.authors.length}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Genres:</Text>
                <Text style={styles.infoValue}>{stats.genres.length}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Avg Rating:</Text>
                <Text style={styles.infoValue}>
                  {stats.averageRating.toFixed(1)} ⭐
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Seed</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleQuickSeed(3)}
                disabled={isSeeding}
              >
                <Ionicons name="flash" size={20} color={colors.primary} />
                <Text style={styles.menuItemText}>Seed 3 Books (Quick)</Text>
                {isSeeding && <ActivityIndicator size="small" color={colors.primary} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleQuickSeed(5)}
                disabled={isSeeding}
              >
                <Ionicons name="layers" size={20} color={colors.primary} />
                <Text style={styles.menuItemText}>Seed 5 Books</Text>
                {isSeeding && <ActivityIndicator size="small" color={colors.primary} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSeedAll}
                disabled={isSeeding}
              >
                <Ionicons name="cloud-download" size={20} color={colors.primary} />
                <Text style={styles.menuItemText}>Seed All ({stats.totalBooks})</Text>
                {isSeeding && <ActivityIndicator size="small" color={colors.primary} />}
              </TouchableOpacity>
            </View>

            {/* Advanced */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Advanced</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleOpenSeedScreen}
              >
                <Ionicons name="settings" size={20} color={colors.primary} />
                <Text style={styles.menuItemText}>Open Seed Screen</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Warning */}
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={16} color="#FF9800" />
              <Text style={styles.warningText}>
                Dev mode only. Seeding creates real data.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    menu: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border + '40',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 16,
    },
    infoCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.background,
      marginBottom: 8,
      gap: 12,
    },
    menuItemText: {
      flex: 1,
      fontSize: 16,
      color: colors.textPrimary,
    },
    warningBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF3E0',
      borderRadius: 8,
      padding: 12,
      gap: 8,
    },
    warningText: {
      flex: 1,
      fontSize: 12,
      color: '#E65100',
    },
  })

export default DeveloperMenu