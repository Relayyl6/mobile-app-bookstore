import React, { useMemo, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAppContext } from '@/context/useAppContext'
import { GENRES } from '@/constants/data'
import { api } from '@/components/ApiHandler'
import { useAuthStore } from '@/store/authStore'

const Onboarding = () => {
  const router = useRouter()
  const { colors } = useAppContext()
  const { user, updateUser } = useAuthStore()

  const [bio, setBio] = useState(user?.bio || '')
  const [goal, setGoal] = useState(String(user?.readingGoalPerYear || 12))
  const [genres, setGenres] = useState<string[]>(user?.preferredGenres || [])
  const [favoriteAuthors, setFavoriteAuthors] = useState((user?.favoriteAuthors || []).join(', '))
  const [submitting, setSubmitting] = useState(false)

  const firstGenres = useMemo(() => GENRES.slice(0, 12), [])

  const toggleGenre = (genre: string) => {
    setGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
  }

  const saveProfile = async (complete = true) => {
    try {
      setSubmitting(true)
      const response = await api.updateMyProfile({
        bio,
        preferredGenres: genres,
        favoriteAuthors: favoriteAuthors.split(',').map((a: string) => a.trim()).filter(Boolean),
        readingGoalPerYear: Number(goal) || 12,
        onboardingCompleted: complete,
      })

      if (!response.success) throw new Error(response.error || 'Failed to save profile')
      // @ts-ignore
      const nextUser = response.data?.user
      if (nextUser) await updateUser(nextUser)

      router.replace('/(tabs)/profile')
    } catch (error: any) {
      Alert.alert('Onboarding', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 14 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '700' }}>Profile setup</Text>
        <Text style={{ color: colors.textSecondary }}>Optional, but helps personalize your recommendations.</Text>

        <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder='Tell readers about you'
          placeholderTextColor={colors.placeholderText}
          multiline
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.textPrimary, minHeight: 90 }}
        />

        <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Reading goal (books/year)</Text>
        <TextInput
          value={goal}
          onChangeText={setGoal}
          keyboardType='numeric'
          placeholder='12'
          placeholderTextColor={colors.placeholderText}
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.textPrimary }}
        />

        <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Preferred genres</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {firstGenres.map((genre) => (
            <TouchableOpacity
              key={genre}
              onPress={() => toggleGenre(genre)}
              style={{
                borderWidth: 1,
                borderColor: genres.includes(genre) ? colors.primary : colors.border,
                backgroundColor: genres.includes(genre) ? colors.primary : colors.cardBackground,
                borderRadius: 16,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: genres.includes(genre) ? colors.white : colors.textPrimary }}>{genre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Favorite authors (comma-separated)</Text>
        <TextInput
          value={favoriteAuthors}
          onChangeText={setFavoriteAuthors}
          placeholder='e.g. Toni Morrison, Orwell'
          placeholderTextColor={colors.placeholderText}
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.textPrimary }}
        />

        <TouchableOpacity
          onPress={() => saveProfile(true)}
          disabled={submitting}
          style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 }}
        >
          <Text style={{ color: colors.white, fontWeight: '700' }}>{submitting ? 'Saving...' : 'Save & Continue'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => saveProfile(false)} style={{ alignItems: 'center', padding: 8 }}>
          <Text style={{ color: colors.textSecondary }}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Onboarding
