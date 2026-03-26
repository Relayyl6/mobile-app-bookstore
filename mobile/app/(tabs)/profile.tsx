import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SvgUri } from 'react-native-svg'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useAppContext } from '@/context/useAppContext'
import profileFillStyle from '@/constants/profileFill.styles'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import DeveloperMenu from '@/components/DevMenu'
import { api } from '@/components/ApiHandler'
import { BookCover } from '@/components/BookCover'

const ProfileScreen = () => {
  const { colors } = useAppContext()
  const styles = profileFillStyle(colors)
  const router = useRouter()
  const { user, logout, updateUser } = useAuthStore()
  const [openDevMenu, setOpenDevMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ uploadedBooks: 0, publicBooks: 0, privateBooks: 0 })
  const [uploadedBooks, setUploadedBooks] = useState<any[]>([])

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.getMyProfile()
      if (!response.success) throw new Error(response.error || 'Failed to load profile')

      // @ts-ignore
      const nextUser = response.data?.profile
      // @ts-ignore
      const nextStats = response.data?.stats
      // @ts-ignore
      const nextBooks = response.data?.uploadedBooks || []

      if (nextUser) await updateUser(nextUser)
      setStats(nextStats || { uploadedBooks: 0, publicBooks: 0, privateBooks: 0 })
      setUploadedBooks(nextBooks)
    } catch (error: any) {
      Alert.alert('Profile', error.message || 'Could not load profile')
    } finally {
      setLoading(false)
    }
  }, [updateUser])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const progress = useMemo(() => {
    const goal = user?.readingGoalPerYear || 12
    const completed = Math.min(stats.uploadedBooks, goal)
    return { goal, completed, percent: Math.round((completed / goal) * 100) }
  }, [stats.uploadedBooks, user?.readingGoalPerYear])

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/onboarding')}>
          <Feather name='settings' size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.iconButton} onPress={loadProfile}>
          <Feather name='refresh-cw' size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <SvgUri uri={user?.profileImage} width='100%' height='100%' style={styles.avatar} />
            </View>
          </View>
          <Text style={styles.name}>{user?.username || 'Reader'}</Text>
          <Text style={styles.tagline}>{user?.bio || 'Tell us about your reading style in onboarding.'}</Text>
          <Text style={styles.memberSince}>Member since {user?.createdAt || '-'}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name='book-open-page-variant' size={32} color={colors.primary} />
            <Text style={styles.statLabel}>UPLOADED</Text>
            <Text style={styles.statValue}>{stats.uploadedBooks}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name='earth' size={32} color={colors.primary} />
            <Text style={styles.statLabel}>PUBLIC</Text>
            <Text style={styles.statValue}>{stats.publicBooks}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name='lock' size={32} color={colors.primary} />
            <Text style={styles.statLabel}>PRIVATE</Text>
            <Text style={styles.statValue}>{stats.privateBooks}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Goal</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalContent}>
              <View style={styles.progressCircle}>
                <View style={styles.progressInner}>
                  <Text style={styles.progressText}>{progress.percent}%</Text>
                </View>
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>{new Date().getFullYear()} Goal</Text>
                <Text style={styles.goalSubtitle}>Target books this year: {progress.goal}</Text>
              </View>
              <Text style={styles.goalProgress}>{progress.completed}/{progress.goal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Uploads</Text>
          {uploadedBooks.slice(0, 5).map((book) => (
            <TouchableOpacity key={book.id} style={styles.summaryCard} onPress={() => router.push(`/details?bookId=${book.id}`)}>
              <BookCover title={book.title} author={book.author} coverUrl={book.image} width={50} height={72} />
              <View style={[styles.summaryInfo, { marginLeft: 12 }]}>
                <Text style={styles.summaryTitle}>{book.title}</Text>
                <Text style={styles.summaryMeta}>{book.visibility === 'private' ? '🔒 Private' : '🌍 Public'}</Text>
              </View>
              <Feather name='chevron-right' size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
          {uploadedBooks.length === 0 && <Text style={styles.summaryMeta}>No uploaded books yet.</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/onboarding')}>
            <View style={styles.settingLeft}>
              <Feather name='user' size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>Personal Information</Text>
            </View>
            <Feather name='chevron-right' size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/theme')}>
            <View style={styles.settingLeft}>
              <Feather name='grid' size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>Theme Switcher</Text>
            </View>
            <Feather name='chevron-right' size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setOpenDevMenu((prev) => !prev)}>
            <View style={styles.settingLeft}>
              <Feather name='tool' size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>Dev Menu</Text>
              <DeveloperMenu visible={openDevMenu} onClose={() => setOpenDevMenu(false)} />
            </View>
            <Feather name='chevron-right' size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <View style={styles.settingLeft}>
              <Feather name='log-out' size={20} color='#ff4444' />
              <Text style={styles.logoutText}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

export default ProfileScreen
